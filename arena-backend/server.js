const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const axios = require('axios');
const Problem = require('./models/Problem');
const User = require('./models/User');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/arena')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));


// ── REST APIs ──────────────────────────────────────────────────────────────
const executeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many submissions. Please wait a minute before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/execute', executeLimiter, async (req, res) => {
  const { problemId, language, code } = req.body;
  try {
    const problem = await Problem.findOne({ problemId });
    if (!problem) return res.status(404).json({ error: `Problem '${problemId}' not found in database.` });

    const languageMap = {
      javascript: { language: 'nodejs',  versionIndex: '4' },
      python:     { language: 'python3', versionIndex: '4' },
      'c++':      { language: 'cpp17',   versionIndex: '1' },
      cpp:        { language: 'cpp17',   versionIndex: '1' },
      java:       { language: 'java',    versionIndex: '4' },
    };

    const runtime = languageMap[language];
    if (!runtime) return res.status(400).json({ error: `Unsupported language: ${language}` });

    const boilerplate = (problem.boilerplates && problem.boilerplates[language]) ? problem.boilerplates[language] : (problem.boilerplate || '');
    const bundledCode = `${code}\n\n${boilerplate}`;
    const results = [];
    let passedCount = 0;

    for (let i = 0; i < problem.hiddenTestCases.length; i++) {
      const testCase = problem.hiddenTestCases[i];
      let jdoodleResponse;
      try {
        jdoodleResponse = await axios.post('https://api.jdoodle.com/v1/execute', {
          script: bundledCode,
          language: runtime.language,
          versionIndex: runtime.versionIndex,
          stdin: testCase.input,
          clientId: process.env.JDOODLE_CLIENT_ID,
          clientSecret: process.env.JDOODLE_CLIENT_SECRET
        });
      } catch (apiErr) {
        console.error(`JDoodle error on test ${i + 1}:`, apiErr.message);
        results.push({ testCase: i + 1, passed: false, output: 'Compiler API unreachable', expected: testCase.expectedOutput });
        continue;
      }

      const actualOutput   = (jdoodleResponse.data.output || '').trim();
      const expectedOutput = testCase.expectedOutput.trim();
      const passed         = actualOutput === expectedOutput;
      if (passed) passedCount++;

      results.push({
        testCase: i + 1, passed,
        output: actualOutput, expected: expectedOutput,
        memory: jdoodleResponse.data.memory, cpuTime: jdoodleResponse.data.cpuTime
      });
    }

    const allPassed = passedCount === problem.hiddenTestCases.length;
    return res.json({ status: allPassed ? 'Accepted' : 'Wrong Answer', passed: passedCount, total: problem.hiddenTestCases.length, results });
  } catch (error) {
    console.error('❌ EXECUTE ERROR:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/sync', async (req, res) => {
  try {
    const { firebaseUid, email, username } = req.body;
    let player = await User.findOne({ firebaseUid });
    if (!player) {
      player = new User({ firebaseUid, email, username, elo: 1200, matchesPlayed: 0, wins: 0 });
      await player.save();
      console.log(`✨ New player joined the Arena: ${username}`);
    } else {
      console.log(`👤 Returning player logged in: ${player.username}`);
    }
    res.status(200).json(player);
  } catch (error) {
    console.error('❌ Sync Error:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  const { firebaseUid } = req.query;
  try {
    const top100 = await User.find().sort({ elo: -1 }).limit(100).select('username elo avatar -_id');
    let userRank = null;
    if (firebaseUid) {
      const user = await User.findOne({ firebaseUid });
      if (user) {
        const rank = await User.countDocuments({ elo: { $gt: user.elo } }) + 1;
        userRank = { username: user.username, elo: user.elo, rank };
      }
    }
    res.json({ top100, userRank });
  } catch (err) {
    console.error('❌ Leaderboard Error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ── STATE MANAGEMENT ───────────────────────────────────────────────────────
const roomScores = new Map(); // roomId → { [socketId]: { passedCount, firebaseUid } }
const pendingMatches = new Map();
const matchTimers    = new Map(); // roomId → game countdown timeout

const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const matchmakingQueues = { Easy: [], Medium: [], Hard: [] };

// ── HELPER FUNCTIONS ───────────────────────────────────────────────────────
async function updateElo(winnerId, loserId) {
  try {
    await User.updateOne({ firebaseUid: winnerId }, { $inc: { elo: 20, wins: 1, matchesPlayed: 1 } });
    await User.updateOne({ firebaseUid: loserId  }, { $inc: { elo: -20, matchesPlayed: 1 } });
    console.log(`✅ ELO updated: ${winnerId} (+20), ${loserId} (-20)`);
  } catch (err) {
    console.error('❌ ELO update failed:', err);
  }
}

async function resolveMatch(roomId) {
  const scores = roomScores.get(roomId);

  // FIX: was a duplicate `if (!scores)if (!scores)` — cleaned up
  if (!scores) {
    console.log(`⚠️  Resolve called for room ${roomId} but no scores found.`);
    return;
  }

  // FIX: guard against resolving before both players have submitted anything.
  // If only one player is tracked (the other never submitted), we still resolve
  // correctly — they just have 0 passed tests by default.
  const playerIds = Object.keys(scores);
  if (playerIds.length < 2) {
    console.log(`⚠️  Resolve called for room ${roomId} but only ${playerIds.length} player(s) tracked — skipping.`);
    return;
  }

  const [p1id, p2id] = playerIds;
  const p1 = scores[p1id];
  const p2 = scores[p2id];

  let winnerId   = null;
  let loserId    = null;
  let resultType = 'draw';

  if (p1.passedCount > p2.passedCount) {
    winnerId = p1id; loserId = p2id; resultType = 'winner';
  } else if (p2.passedCount > p1.passedCount) {
    winnerId = p2id; loserId = p1id; resultType = 'winner';
  }

  if (resultType === 'winner') {
    await updateElo(scores[winnerId].firebaseUid, scores[loserId].firebaseUid);
  }

  console.log(`🏁 Emitting match_finished to room ${roomId}`);

  for (const [socketId, data] of Object.entries(scores)) {
    const isWinner   = socketId === winnerId;
    const isDraw     = resultType === 'draw';
    const opponentId = socketId === p1id ? p2id : p1id;

    io.to(socketId).emit('match_finished', {
      result:        isDraw ? 'draw' : isWinner ? 'victory' : 'defeat',
      myScore:       data.passedCount,
      opponentScore: scores[opponentId].passedCount,
      eloChange:     isDraw ? 0 : isWinner ? +20 : -20,
    });
  }

  roomScores.delete(roomId);
  console.log(`🏁 Match resolved in ${roomId} — result: ${resultType}`);
}

async function getRandomProblem(difficulty) {
  const count = await Problem.countDocuments({ difficulty });
  if (count === 0) {
    console.warn(`⚠️  No problems found for difficulty: ${difficulty}`);
    return null;
  }
  const skip = Math.floor(Math.random() * count);
  return Problem.findOne({ difficulty }).skip(skip);
}

// ── SOCKET.IO LOGIC ────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // 1. In-Game Code Submission Updates
  socket.on('update_progress', ({ roomId, passedCount, firebaseUid, total }) => {
    if (!roomScores.has(roomId)) roomScores.set(roomId, {});
    roomScores.get(roomId)[socket.id] = { passedCount, firebaseUid };

    socket.to(roomId).emit('opponent_progress', { passedCount });

    // FIX: only resolve if both players are in scores AND someone hit all tests
    const scores = roomScores.get(roomId);
    if (passedCount >= total && Object.keys(scores).length === 2) {
      const timer = matchTimers.get(roomId);
      if (timer) { clearTimeout(timer); matchTimers.delete(roomId); }
      resolveMatch(roomId);
    }
  });

  // 2. Queueing & Matchmaking
  socket.on('join_queue', (userData) => {
    // Prevent duplicate entries
    for (const diff of VALID_DIFFICULTIES) {
      matchmakingQueues[diff] = matchmakingQueues[diff].filter(u => {
        if (u.socket.id === socket.id) return false;
        if (userData.firebaseUid && u.firebaseUid === userData.firebaseUid) return false;
        return true;
      });
    }

    const difficulty = VALID_DIFFICULTIES.includes(userData.difficulty)
      ? userData.difficulty
      : 'Easy';

    console.log(`⏳ ${userData.name} joined the ${difficulty} queue.`);

    const queue = matchmakingQueues[difficulty];
    queue.push({ socket, ...userData, difficulty });

    if (queue.length >= 2) {
      const player1 = queue.shift();
      const player2 = queue.shift();
      const roomId  = `room_${Math.random().toString(36).substring(2, 9)}`;

      player1.socket.join(roomId);
      player2.socket.join(roomId);

      roomScores.set(roomId, {
        [player1.socket.id]: { passedCount: 0, firebaseUid: player1.firebaseUid },
        [player2.socket.id]: { passedCount: 0, firebaseUid: player2.firebaseUid },
      });

      console.log(`⚔️  Match found in ${difficulty} queue! Room: ${roomId}. Fetching problem…`);

      getRandomProblem(difficulty)
        .then((problem) => {
          if (!problem) {
            io.to(roomId).emit('match_cancelled', `No ${difficulty} problems available right now.`);
            player1.socket.leave(roomId);
            player2.socket.leave(roomId);
            roomScores.delete(roomId);
            return;
          }

          io.to(roomId).emit('match_found', {
            roomId,
            difficulty,
            problem: {
              problemId:   problem.problemId,
              title:       problem.title,
              description: problem.description,
              difficulty:  problem.difficulty,
              examples:    problem.examples,
              constraints: problem.constraints,
              boilerplate: problem.boilerplate,
              total:       problem.hiddenTestCases.length,
            },
            player1: { id: player1.socket.id, name: player1.name, elo: player1.elo, avatar: player1.avatar },
            player2: { id: player2.socket.id, name: player2.name, elo: player2.elo, avatar: player2.avatar },
          });

          // 60-Second Ready Check Timer
          pendingMatches.set(roomId, {
            accepted: new Set(),
            timeout: setTimeout(() => {
              io.to(roomId).emit('match_cancelled', 'A player failed to accept.');
              player1.socket.leave(roomId);
              player2.socket.leave(roomId);
              roomScores.delete(roomId);
              pendingMatches.delete(roomId);
            }, 60000),
          });
        })
        .catch((err) => {
          console.error('❌ Failed to fetch problem:', err);
          io.to(roomId).emit('match_cancelled', 'Server error fetching problem.');
          player1.socket.leave(roomId);
          player2.socket.leave(roomId);
          roomScores.delete(roomId);
        });
    }
  });

  socket.on('leave_queue', () => {
    for (const difficulty of VALID_DIFFICULTIES) {
      matchmakingQueues[difficulty] = matchmakingQueues[difficulty].filter(
        u => u.socket.id !== socket.id
      );
    }
    console.log(`❌ Socket ${socket.id} left the queue.`);
  });

  // 3. Ready Check Acceptance
  socket.on('accept_match', ({ roomId }) => {
    const match = pendingMatches.get(roomId);
    if (match) {
      match.accepted.add(socket.id);
      socket.to(roomId).emit('opponent_accepted');

      if (match.accepted.size === 2) {
        clearTimeout(match.timeout);
        pendingMatches.delete(roomId);
        io.to(roomId).emit('match_started');
        console.log(`🚀 Match started in ${roomId}`);

        // 10-Minute Game Timer
        const gameTimer = setTimeout(() => {
          matchTimers.delete(roomId);
          resolveMatch(roomId);
        }, 10 * 60 * 1000);

        matchTimers.set(roomId, gameTimer);
      }
    }
  });

  // 4. Manual Match End (if needed)
  socket.on('battle_ended', ({ roomId }) => {
    const timer = matchTimers.get(roomId);
    if (timer) { clearTimeout(timer); matchTimers.delete(roomId); }
    resolveMatch(roomId);
  });

  // 5. Global Lobby Chat
  socket.on('send_chat', (msg) => {
    // Broadcast to everyone including sender
    io.emit('receive_chat', msg);
  });

  // 6. Rage Quit & Cleanup Handler
  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);

    // Remove from queues if they were waiting
    for (const difficulty of VALID_DIFFICULTIES) {
      matchmakingQueues[difficulty] = matchmakingQueues[difficulty].filter(
        u => u.socket.id !== socket.id
      );
    }

    // Check if they were in an active match
    for (const [roomId, scores] of roomScores.entries()) {
      if (!(socket.id in scores)) continue;

      const playerIds      = Object.keys(scores);
      const winnerSocketId = playerIds.find(id => id !== socket.id);
      const loserSocketId  = socket.id;

      if (!winnerSocketId) {
        roomScores.delete(roomId);
        const timer = matchTimers.get(roomId);
        if (timer) { clearTimeout(timer); matchTimers.delete(roomId); }
        break;
      }

      const winnerUid = scores[winnerSocketId]?.firebaseUid;
      const loserUid  = scores[loserSocketId]?.firebaseUid;

      // Award ELO instantly to the player who stayed
      if (winnerUid && loserUid) {
        updateElo(winnerUid, loserUid).catch(err =>
          console.error('❌ ELO update failed on disconnect:', err)
        );
      }

      // Stop the match timer
      const timer = matchTimers.get(roomId);
      if (timer) { clearTimeout(timer); matchTimers.delete(roomId); }

      // Notify the remaining player they won by forfeit
      io.to(winnerSocketId).emit('match_finished', {
        result:        'victory',
        reason:        'disconnect',
        eloChange:     +20,
        myScore:       scores[winnerSocketId]?.passedCount ?? 0,
        opponentScore: scores[loserSocketId]?.passedCount  ?? 0,
      });

      // Close the room
      roomScores.delete(roomId);
      break;
    }
  });
});

// ── THE JANITOR (Memory Leak Sweeper) ───────────────────────────────────
setInterval(() => {
  console.log('🧹 Running routine server sweep...');

  // Sweep Matchmaking Queues (Remove sockets that disconnected poorly)
  for (const diff of VALID_DIFFICULTIES) {
    const originalLength = matchmakingQueues[diff].length;
    matchmakingQueues[diff] = matchmakingQueues[diff].filter(u => u.socket.connected);
    if (originalLength !== matchmakingQueues[diff].length) {
      console.log(`🧹 Swept ${originalLength - matchmakingQueues[diff].length} ghosts from ${diff} queue.`);
    }
  }
}, 5 * 60 * 1000);

// ── SERVER START ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));