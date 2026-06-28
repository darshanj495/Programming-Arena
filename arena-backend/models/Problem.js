const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  problemId:   { type: String, required: true, unique: true },
  title:       { type: String, required: true },
  difficulty:  { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  description: { type: String, required: true },
  examples: [
    {
      input:  String,
      output: String,
      note:   String,
    }
  ],
  constraints:     [String],
  timeLimit:       Number,
  memoryLimit:     Number,
  hiddenTestCases: [
    {
      input:          String,
      expectedOutput: String,
    }
  ],
  boilerplate: String,
});

module.exports = mongoose.models.Problem || mongoose.model('Problem', problemSchema);