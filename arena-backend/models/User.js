// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { 
    type: String, 
    required: true, 
    unique: true // Links their secure login to this profile
  },
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  elo: { 
    type: Number, 
    index: true,
    default: 1200 // Everyone starts at 1200 ELO
  },
  matchesPlayed: { 
    type: Number, 
    default: 0 
  },
  wins: { 
    type: Number, 
    default: 0 
  },
  avatar: { 
    type: String, 
    default: 'A'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);