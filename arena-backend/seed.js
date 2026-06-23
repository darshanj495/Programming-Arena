const mongoose = require('mongoose');
const Problem = require('./models/Problem');

mongoose.connect('mongodb://127.0.0.1:27017/arena')
  .then(() => console.log('✅ Connected to MongoDB for seeding...'))
  .catch(err => { console.error('❌ Connection failed:', err); process.exit(1); });

const seedProblems = async () => {
  await Problem.deleteMany({});
  console.log('🗑️  Cleared existing problems.');

  const twoSum = new Problem({
    problemId: 'two-sum',
    title: 'Two Sum — Find all unique pairs',
    difficulty: 'Medium',
    timeLimit: 2000,
    memoryLimit: 256,
    hiddenTestCases: [
      { input: '[2, 7, 11, 15]\n9',  expectedOutput: '[[0, 1]]'          },
      { input: '[-3, 4, 3, 90]\n0',  expectedOutput: '[[0, 2]]'          },
      { input: '[3, 2, 4, 3]\n6',    expectedOutput: '[[0, 3], [1, 2]]'  }
    ],

    // ── Boilerplate: ONLY the stdin runner. No function definition here. ──
    // The backend prepends the user's solution, then appends this.
    // Final bundled code = userCode + "\n\n" + this boilerplate
    boilerplate: `// ⚠️ DO NOT MODIFY BELOW THIS LINE ⚠️
const lines = require('fs').readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');
const nums   = JSON.parse(lines[0]);
const target = parseInt(lines[1]);
const result = twoSum(nums, target);
result.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
console.log(JSON.stringify(result).replace(/,/g, ', '));`
  });

  await twoSum.save();
  console.log('✅ Seeded: Two Sum — Find all unique pairs');
  mongoose.connection.close();
};

seedProblems().catch(err => {
  console.error('❌ Seeding failed:', err);
  mongoose.connection.close();
});