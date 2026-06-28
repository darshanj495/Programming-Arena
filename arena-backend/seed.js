const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB for seeding...'))
  .catch(err => { console.error('❌ Connection failed:', err); process.exit(1); });

const problemSchema = new mongoose.Schema({
  problemId:       String,
  title:           String,
  difficulty:      String,
  description:     String,
  examples:        Array,
  constraints:     [String],
  timeLimit:       Number,
  memoryLimit:     Number,
  hiddenTestCases: Array,
  boilerplates:    mongoose.Schema.Types.Mixed, // { javascript, python, cpp, java }
  boilerplate:     String, // legacy fallback
});

const Problem = mongoose.models.Problem || mongoose.model('Problem', problemSchema);

const seedProblems = async () => {
  await Problem.deleteMany({});
  console.log('🗑️  Cleared existing problems.');

  // ── EASY: Contains Duplicate ──
  await new Problem({
    problemId:   'contains-duplicate',
    title:       'Contains Duplicate',
    difficulty:  'Easy',
    description: 'Given an integer array `nums`, return `true` if any value appears **at least twice** in the array, and return `false` if every element is distinct.',
    examples: [
      { input: 'nums = [1,2,3,1]',       output: 'true',  note: '1 appears twice' },
      { input: 'nums = [1,2,3,4]',       output: 'false', note: 'All elements are distinct' },
      { input: 'nums = [1,1,1,3,3,4,3]', output: 'true',  note: 'Multiple duplicates' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁹ ≤ nums[i] ≤ 10⁹'],
    timeLimit: 2000, memoryLimit: 256,
    hiddenTestCases: [
      { input: '[1, 2, 3, 1]',                    expectedOutput: 'true'  },
      { input: '[1, 2, 3, 4]',                    expectedOutput: 'false' },
      { input: '[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]', expectedOutput: 'true'  },
    ],
    boilerplates: {
      javascript: `// ⚠️ DO NOT MODIFY BELOW THIS LINE ⚠️
const lines = require('fs').readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');
const nums = JSON.parse(lines[0]);
console.log(containsDuplicate(nums));`,

      python: `# ⚠️ DO NOT MODIFY BELOW THIS LINE ⚠️
import sys, json
nums = json.loads(sys.stdin.readline())
print(str(containsDuplicate(nums)).lower())`,

      cpp: `// ⚠️ DO NOT MODIFY BELOW THIS LINE ⚠️
int main() {
    std::string line;
    std::getline(std::cin, line);
    std::vector<int> nums;
    line = line.substr(1, line.size() - 2);
    std::stringstream ss(line);
    std::string token;
    while (std::getline(ss, token, ',')) {
        nums.push_back(std::stoi(token));
    }
    std::cout << (containsDuplicate(nums) ? "true" : "false") << std::endl;
    return 0;
}`,

      java: `// ⚠️ DO NOT MODIFY BELOW THIS LINE ⚠️
public static void main(String[] args) throws Exception {
    java.util.Scanner sc = new java.util.Scanner(System.in);
    String line = sc.nextLine().trim();
    line = line.substring(1, line.length() - 1);
    String[] parts = line.split(",");
    int[] nums = new int[parts.length];
    for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i].trim());
    System.out.println(new Solution().containsDuplicate(nums));
}`,
    },
  }).save();

  // ── MEDIUM: Two Sum ──
  await new Problem({
    problemId:   'two-sum',
    title:       'Two Sum — Find all unique pairs',
    difficulty:  'Medium',
    description: 'Given an array of integers `nums` and an integer `target`, return **all unique pairs of indices** `[i, j]` such that `nums[i] + nums[j] == target` and `i != j`.\n\nEach input will have at least one solution. You may return pairs in any order.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[[0,1]]',       note: 'nums[0] + nums[1] = 9' },
      { input: 'nums = [-3,4,3,90], target = 0', output: '[[0,2]]',       note: '-3 + 3 = 0' },
      { input: 'nums = [3,2,4,3], target = 6',   output: '[[0,3],[1,2]]', note: 'Two valid pairs' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', '-10⁹ ≤ target ≤ 10⁹', 'At least one valid pair exists.'],
    timeLimit: 2000, memoryLimit: 256,
    hiddenTestCases: [
      { input: '[2, 7, 11, 15]\n9', expectedOutput: '[[0, 1]]'         },
      { input: '[-3, 4, 3, 90]\n0', expectedOutput: '[[0, 2]]'         },
      { input: '[3, 2, 4, 3]\n6',   expectedOutput: '[[0, 3], [1, 2]]' },
    ],
    boilerplates: {
      javascript: `// ⚠️ DO NOT MODIFY BELOW THIS LINE ⚠️
const lines = require('fs').readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');
const nums   = JSON.parse(lines[0]);
const target = parseInt(lines[1]);
const result = twoSum(nums, target);
if (result) {
  result.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  console.log(JSON.stringify(result).replace(/,/g, ', '));
} else {
  console.log('[]');
}`,

      python: `# ⚠️ DO NOT MODIFY BELOW THIS LINE ⚠️
import sys, json
data = sys.stdin.read().strip().split('\\n')
nums = json.loads(data[0])
target = int(data[1])
result = twoSum(nums, target)
result.sort()
print(json.dumps(result).replace(',', ', '))`,

      cpp: `// ⚠️ DO NOT MODIFY BELOW THIS LINE ⚠️
int main() {
    std::string line;
    std::getline(std::cin, line);
    std::vector<int> nums;
    line = line.substr(1, line.size() - 2);
    std::stringstream ss(line);
    std::string token;
    while (std::getline(ss, token, ',')) nums.push_back(std::stoi(token));
    int target; std::cin >> target;
    auto result = twoSum(nums, target);
    std::sort(result.begin(), result.end());
    std::cout << "[";
    for (int i = 0; i < result.size(); i++) {
        std::cout << "[" << result[i][0] << ", " << result[i][1] << "]";
        if (i < result.size()-1) std::cout << ", ";
    }
    std::cout << "]" << std::endl;
    return 0;
}`,

      java: `// ⚠️ DO NOT MODIFY BELOW THIS LINE ⚠️
public static void main(String[] args) throws Exception {
    java.util.Scanner sc = new java.util.Scanner(System.in);
    String line = sc.nextLine().trim();
    line = line.substring(1, line.length()-1);
    String[] parts = line.split(",");
    int[] nums = new int[parts.length];
    for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i].trim());
    int target = Integer.parseInt(sc.nextLine().trim());
    int[][] result = new Solution().twoSum(nums, target);
    StringBuilder sb = new StringBuilder("[");
    for (int i = 0; i < result.length; i++) {
        sb.append("[").append(result[i][0]).append(", ").append(result[i][1]).append("]");
        if (i < result.length-1) sb.append(", ");
    }
    sb.append("]");
    System.out.println(sb);
}`,
    },
  }).save();

  // ── HARD: Trapping Rain Water ──
  await new Problem({
    problemId:   'trapping-rain-water',
    title:       'Trapping Rain Water',
    difficulty:  'Hard',
    description: 'Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can **trap after raining**.',
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', note: 'Classic example — 6 units trapped' },
      { input: 'height = [4,2,0,3,2,5]',              output: '9', note: '9 units trapped'                  },
      { input: 'height = [0,0,0,0]',                  output: '0', note: 'Flat surface — no water trapped'  },
    ],
    constraints: ['n == height.length', '1 ≤ n ≤ 2 × 10⁴', '0 ≤ height[i] ≤ 10⁵'],
    timeLimit: 2500, memoryLimit: 256,
    hiddenTestCases: [
      { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' },
      { input: '[4,2,0,3,2,5]',              expectedOutput: '9' },
      { input: '[0,0,0,0]',                  expectedOutput: '0' },
    ],
    boilerplates: {
      javascript: `// ⚠️ DO NOT MODIFY BELOW THIS LINE ⚠️
const lines = require('fs').readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');
const height = JSON.parse(lines[0]);
console.log(trap(height));`,

      python: `# ⚠️ DO NOT MODIFY BELOW THIS LINE ⚠️
import sys, json
height = json.loads(sys.stdin.readline())
print(trap(height))`,

      cpp: `// ⚠️ DO NOT MODIFY BELOW THIS LINE ⚠️
int main() {
    std::string line;
    std::getline(std::cin, line);
    std::vector<int> height;
    line = line.substr(1, line.size() - 2);
    std::stringstream ss(line);
    std::string token;
    while (std::getline(ss, token, ',')) height.push_back(std::stoi(token));
    std::cout << trap(height) << std::endl;
    return 0;
}`,

      java: `// ⚠️ DO NOT MODIFY BELOW THIS LINE ⚠️
public static void main(String[] args) throws Exception {
    java.util.Scanner sc = new java.util.Scanner(System.in);
    String line = sc.nextLine().trim();
    line = line.substring(1, line.length()-1);
    String[] parts = line.split(",");
    int[] height = new int[parts.length];
    for (int i = 0; i < parts.length; i++) height[i] = Integer.parseInt(parts[i].trim());
    System.out.println(new Solution().trap(height));
}`,
    },
  }).save();

  console.log('✅ Seeded 3 problems: Easy, Medium, Hard');
  mongoose.connection.close();
};

seedProblems().catch(err => {
  console.error('❌ Seeding failed:', err);
  mongoose.connection.close();
});