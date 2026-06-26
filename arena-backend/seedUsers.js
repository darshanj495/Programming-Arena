const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const fakeUsers = [
  { username: 'Neo_Coder', elo: 2450 },
  { username: 'AlgorithmGod', elo: 2120 },
  { username: 'ByteMe', elo: 1980 },
  { username: 'ArrayOfSunshine', elo: 1850 },
  { username: 'NullPointer', elo: 1720 },
  { username: 'StackOverflower', elo: 1640 },
  { username: 'DropTableStudents', elo: 1590 },
  { username: 'O(1)_Wizard', elo: 1450 },
  { username: '404BrainNotFound', elo: 1320 },
  { username: 'SyntaxTerror', elo: 1250 },
  { username: 'CtrlAltDefeat', elo: 1150 },
  { username: 'SpaghettiChef', elo: 1050 }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/arena')
  .then(async () => {
    console.log('✅ Connected. Seeding users...');
    for (const u of fakeUsers) {
      // Create fake UIDs so they don't clash
      await User.updateOne(
        { username: u.username }, 
        { $set: { firebaseUid: 'fake_' + u.username, elo: u.elo, matchesPlayed: 42, wins: 24, email: `${u.username}@test.com` } },
        { upsert: true }
      );
    }
    console.log('🎉 Seeded 12 players! Check your leaderboard.');
    process.exit(0);
  });