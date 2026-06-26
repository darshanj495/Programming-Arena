const mongoose = require('mongoose');

// Connect to your MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/arena')
  .then(() => console.log('✅ Connected to MongoDB for seeding...'))
  .catch(err => { console.error('❌ Connection failed:', err); process.exit(1); });

// Define the exact schema your app expects
const problemSchema = new mongoose.Schema({
  problemId: String,
  title: String,
  difficulty: String,
  description: String,
  timeLimit: Number,
  memoryLimit: Number,
  hiddenTestCases: Array,
  boilerplate: String
});

// Avoid OverwriteModelError if it already exists
const Problem = mongoose.models.Problem || mongoose.model('Problem', problemSchema);

const seedProblems = async () => {
  await Problem.deleteMany({});
  console.log('🗑️  Cleared existing problems.');

  // ── EASY: Contains Duplicate ──
  const containsDuplicate = new Problem({
    problemId: 'contains-duplicate',
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    description: 'Given an integer array `nums`, return true if any value appears at least twice in the array, and return false if every element is distinct.',
    timeLimit: 2000,
    memoryLimit: 256,
    hiddenTestCases: [
      { input: '[1, 2, 3, 1]', expectedOutput: 'true' },
      { input: '[1, 2, 3, 4]', expectedOutput: 'false' },
      { input: '[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]', expectedOutput: 'true' }
    ],
    boilerplate: `// ⚠️ DO NOT MODIFY BELOW THIS LINE ⚠️
const lines = require('fs').readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');
const nums = JSON.parse(lines[0]);
console.log(containsDuplicate(nums));`
  });

  // ── MEDIUM: Two Sum (Your exact configuration) ──
  const twoSum = new Problem({
    problemId: 'two-sum',
    title: 'Two Sum — Find all unique pairs',
    difficulty: 'Medium',
    description: 'Given an array of integers `nums` and an integer `target`, return all unique pairs of indices of the two numbers such that they add up to `target`.',
    timeLimit: 2000,
    memoryLimit: 256,
    hiddenTestCases: [
      { input: '[2, 7, 11, 15]\n9',  expectedOutput: '[[0, 1]]' },
      { input: '[-3, 4, 3, 90]\n0',  expectedOutput: '[[0, 2]]' },
      { input: '[3, 2, 4, 3]\n6',    expectedOutput: '[[0, 3], [1, 2]]' }
    ],
    boilerplate: `// ⚠️ DO NOT MODIFY BELOW THIS LINE ⚠️
const lines = require('fs').readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');
const nums   = JSON.parse(lines[0]);
const target = parseInt(lines[1]);
const result = twoSum(nums, target);
if(result) {
  result.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  console.log(JSON.stringify(result).replace(/,/g, ', '));
} else {
  console.log("[]");
}`
  });

  // ── HARD: Trapping Rain Water ──
  const trappingRainWater = new Problem({
    problemId: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    description: 'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    timeLimit: 2500,
    memoryLimit: 256,
    hiddenTestCases: [
      { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' },
      { input: '[4,2,0,3,2,5]', expectedOutput: '9' },
      { input: '[0,0,0,0]', expectedOutput: '0' }
    ],
    boilerplate: `// ⚠️ DO NOT MODIFY BELOW THIS LINE ⚠️
const lines = require('fs').readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');
const height = JSON.parse(lines[0]);
console.log(trap(height));`
  });

  // Save all to database
  await containsDuplicate.save();
  await twoSum.save();
  await trappingRainWater.save();

  console.log('✅ Seeded 3 Problems: Easy, Medium, Hard');
  mongoose.connection.close();
};

seedProblems().catch(err => {
  console.error('❌ Seeding failed:', err);
  mongoose.connection.close();
});