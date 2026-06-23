const axios = require('axios');

async function testCompiler() {
  console.log('🚀 Sending code to the Arena Execution Engine...\n');

  // ─── "All unique pairs" solution ─────────────────────────────────────────
  // Uses a Map to record each value's indices, then collects every pair
  // where nums[i] + nums[j] === target and i < j.
  // Sorted before output so results are deterministic (matches boilerplate).
  const userSubmission = `
function twoSum(nums, target) {
    const map = new Map();   // value → [indices]
    const pairs = [];

    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            // Every stored index for this complement forms a valid pair with i
            for (const j of map.get(complement)) {
                pairs.push([j, i]);   // j < i always, since j was stored earlier
            }
        }
        // Record this index under its value (multiple indices per value allowed)
        if (!map.has(nums[i])) map.set(nums[i], []);
        map.get(nums[i]).push(i);
    }

    // Sort: primary by first index, secondary by second index
    pairs.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    return pairs;
}`;

  try {
    const response = await axios.post('http://localhost:3000/api/execute', {
      problemId: 'two-sum',
      language:  'javascript',
      code:      userSubmission
    });

    const { status, passed, total, results } = response.data;

    console.log('✅ ── GRADING RESULTS ─────────────────');
    console.log(`Status : ${status}`);
    console.log(`Passed : ${passed} / ${total}`);
    console.log('──────────────────────────────────────\n');

    results.forEach(res => {
      const icon = res.passed ? '🟢 PASSED' : '🔴 FAILED';
      console.log(`Test ${res.testCase}: ${icon}`);
      if (!res.passed) {
        console.log(`   Expected : ${res.expected}`);
        console.log(`   Got      : ${res.output}`);
      }
    });

    console.log('');
    if (passed === total) {
      console.log('🎉 All test cases passed! Pipeline is working end-to-end.');
    } else {
      console.log(`⚠️  ${total - passed} test case(s) failed. Check expected vs actual above.`);
    }

  } catch (error) {
    if (error.response) {
      // Server responded with a non-2xx status
      console.error(`❌ Server error ${error.response.status}:`, error.response.data);
    } else {
      // Network error — server probably not running
      console.error('❌ Could not reach the server. Is it running on port 3000?');
      console.error('   Run: node server.js  (or however you start your Express app)');
      console.error('   Detail:', error.message);
    }
  }
}

testCompiler();