const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const axios = require('axios');
const Problem = require('./models/Problem');

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// ── MongoDB ────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ── POST /api/execute ──────────────────────────────────────────────────────
app.post('/api/execute', async (req, res) => {
  const { problemId, language, code } = req.body;

  try {
    // 1. Fetch problem + hidden test cases from DB
    const problem = await Problem.findOne({ problemId });
    if (!problem) {
      return res.status(404).json({ error: `Problem '${problemId}' not found in database.` });
    }

    // 2. Map our language names to JDoodle runtime names
    const languageMap = {
      javascript: { language: 'nodejs',  versionIndex: '4' },
      python:     { language: 'python3', versionIndex: '4' },
      cpp:        { language: 'cpp17',   versionIndex: '1' },
      java:       { language: 'java',    versionIndex: '4' },
    };

    const runtime = languageMap[language];
    if (!runtime) {
      return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    // 3. Bundle user code + boilerplate
    const bundledCode = `${code}\n\n${problem.boilerplate}`;

    const results = [];
    let passedCount = 0;

    for (let i = 0; i < problem.hiddenTestCases.length; i++) {
      const testCase = problem.hiddenTestCases[i];

      let jdoodleResponse;
      try {
        // SENDING TO JDOODLE INSTEAD OF PISTON
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
        results.push({
          testCase: i + 1,
          passed:   false,
          output:   'Compiler API unreachable',
          expected: testCase.expectedOutput,
        });
        continue;
      }

      // JDoodle returns everything in response.data.output
      const actualOutput   = (jdoodleResponse.data.output || '').trim();
      const expectedOutput = testCase.expectedOutput.trim();
      const passed         = actualOutput === expectedOutput;

      if (passed) passedCount++;

      results.push({
        testCase: i + 1,
        passed,
        output:   actualOutput,
        expected: expectedOutput,
        memory:   jdoodleResponse.data.memory,
        cpuTime:  jdoodleResponse.data.cpuTime
      });
    }

    // 4. Return grading summary
    const allPassed = passedCount === problem.hiddenTestCases.length;
    return res.json({
      status:  allPassed ? 'Accepted' : 'Wrong Answer',
      passed:  passedCount,
      total:   problem.hiddenTestCases.length,
      results,
    });

  } catch (error) {
    console.error('❌ EXECUTE ERROR:', error);
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// ── Socket.IO placeholder (for matchmaking later) ─────────────────────────
// ── MATCHMAKING ENGINE ─────────────────────────
let matchmakingQueue = [];
const pendingMatches = new Map(); // Track matches waiting for Accept

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Listen for progress updates and broadcast them
  socket.on('update_progress', ({ roomId, passedCount }) => {
    socket.to(roomId).emit('opponent_progress', { passedCount });
  });

  // Listen for players wanting to fight
  socket.on('join_queue', (userData) => {
    console.log(`⏳ ${userData.name} joined the queue.`);
    matchmakingQueue.push({ socket, ...userData });

    // Do we have enough players for a match?
    if (matchmakingQueue.length >= 2) {
      const player1 = matchmakingQueue.shift();
      const player2 = matchmakingQueue.shift();
      const roomId = `room_${Math.random().toString(36).substring(2, 9)}`;

      player1.socket.join(roomId);
      player2.socket.join(roomId);

      console.log(`⚔️ Match found! Waiting for accept in ${roomId}`);

      // 1. Tell players a match is found (triggers Ready Check screen)
      io.to(roomId).emit('match_found', {
        roomId,
        player1: { id: player1.socket.id, name: player1.name, elo: player1.elo, avatar: player1.avatar },
        player2: { id: player2.socket.id, name: player2.name, elo: player2.elo, avatar: player2.avatar }
      });

      // 2. Start the 60-second AFK timer
      pendingMatches.set(roomId, {
        accepted: new Set(),
        timeout: setTimeout(() => {
          io.to(roomId).emit('match_cancelled', 'A player failed to accept.');
          player1.socket.leave(roomId);
          player2.socket.leave(roomId);
          pendingMatches.delete(roomId);
        }, 60000) // 60 seconds
      });
    }
  });

  // 3. Listen for players clicking "Accept"
  socket.on('accept_match', ({ roomId }) => {
    const match = pendingMatches.get(roomId);
    if (match) {
      match.accepted.add(socket.id);
      
      // Tell the other player we accepted (so their UI can update)
      socket.to(roomId).emit('opponent_accepted');

      // If both accepted, start the battle!
      if (match.accepted.size === 2) {
        clearTimeout(match.timeout); // Stop the 60s countdown
        pendingMatches.delete(roomId);
        io.to(roomId).emit('match_started');
        console.log(`🚀 Match started in ${roomId}`);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
    matchmakingQueue = matchmakingQueue.filter(user => user.socket.id !== socket.id);
  });
});

// ── Start server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));