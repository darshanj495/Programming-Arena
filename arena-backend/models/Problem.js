const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true }
});

const problemSchema = new mongoose.Schema({
  problemId:    { type: String, required: true, unique: true },
  title:        { type: String, required: true },
  difficulty:   { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
  timeLimit:    { type: Number, default: 2000 },   // ms
  memoryLimit:  { type: Number, default: 256 },    // MB
  hiddenTestCases: [testCaseSchema],
  boilerplate:  { type: String, required: true }
});

module.exports = mongoose.model('Problem', problemSchema);