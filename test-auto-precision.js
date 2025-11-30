/**
 * ═══════════════════════════════════════════════════════════════
 * AUTO-PRECISION CORE TEST SUITE
 * ═══════════════════════════════════════════════════════════════
 * Tests all Auto-Precision capabilities with real scenarios
 */

const axios = require("axios");

const BASE_URL = "http://localhost:4000";
const API_TOKEN = process.env.TEST_JWT_TOKEN || "your_test_token_here";

// Test configuration
const config = {
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
    "Content-Type": "application/json",
  },
};

/**
 * Test results tracking
 */
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

function logTest(name, passed, details) {
  const status = passed ? "✅ PASS" : "❌ FAIL";
  console.log(`${status}: ${name}`);
  if (details) console.log(`   Details: ${details}`);

  results.tests.push({ name, passed, details });
  if (passed) results.passed++;
  else results.failed++;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * TEST SUITE
 * ═══════════════════════════════════════════════════════════════
 */

async function runTests() {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("🧪 AUTO-PRECISION CORE TEST SUITE");
  console.log("═══════════════════════════════════════════════════════\n");

  try {
    // Test 1: Health Check
    await testHealthCheck();

    // Test 2: Precision Calculation
    await testPrecisionCalculation();

    // Test 3: Business Rules Validation
    await testBusinessRules();

    // Test 4: Payment Processing
    await testPaymentProcessing();

    // Test 5: Duplicate Detection
    await testDuplicateDetection();

    // Test 6: Reward Calculation
    await testRewardCalculation();

    // Test 7: Fund Transfer
    await testFundTransfer();

    // Test 8: Search Functionality
    await testSearch();

    // Test 9: Statistics
    await testStatistics();

    // Test 10: Job Recall
    await testJobRecall();

    // Print summary
    printSummary();
  } catch (error) {
    console.error("\n❌ TEST SUITE FAILED:", error.message);
  }
}

/**
 * Test 1: Health Check
 */
async function testHealthCheck() {
  try {
    const response = await axios.get(`${BASE_URL}/api/jobs/health`, config);

    const isHealthy =
      response.data.status === "healthy" &&
      response.data.auto_precision_active === true;

    logTest(
      "Health Check",
      isHealthy,
      `Status: ${response.data.status}, Active: ${response.data.auto_precision_active}`
    );
  } catch (error) {
    logTest("Health Check", false, error.message);
  }
}

/**
 * Test 2: Precision Calculation
 */
async function testPrecisionCalculation() {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/jobs/calculate`,
      {
        operation: "multiply",
        values: [100.123456, 0.05],
      },
      config
    );

    const expected = "5.00617280";
    const actual = response.data.result;
    const passed = actual === expected;

    logTest(
      "Precision Calculation (multiply)",
      passed,
      `Expected: ${expected}, Got: ${actual}`
    );
  } catch (error) {
    logTest("Precision Calculation", false, error.message);
  }
}

/**
 * Test 3: Business Rules Validation
 */
async function testBusinessRules() {
  try {
    // Attempt payment exceeding max amount
    const response = await axios.post(
      `${BASE_URL}/api/jobs/execute`,
      {
        jobType: "PAYMENT_PROCESSING",
        payload: {
          userId: "test_user",
          amount: 200000.0,
          currency: "USD",
          description: "Test invalid payment",
        },
      },
      config
    );

    // Should fail
    logTest(
      "Business Rules Validation",
      false,
      "Expected 400 error but got success"
    );
  } catch (error) {
    // Expected to fail with 400
    const passed = error.response?.status === 400;
    logTest(
      "Business Rules Validation",
      passed,
      error.response?.data?.error || error.message
    );
  }
}

/**
 * Test 4: Payment Processing
 */
async function testPaymentProcessing() {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/jobs/execute`,
      {
        jobType: "PAYMENT_PROCESSING",
        payload: {
          userId: "test_user",
          amount: 50.0,
          currency: "USD",
          description: "Test payment",
        },
      },
      config
    );

    const passed = response.data.success === true && response.data.jobId;

    logTest(
      "Payment Processing",
      passed,
      `JobId: ${response.data.jobId}, Time: ${response.data.executionTime}ms`
    );

    return response.data.jobId;
  } catch (error) {
    logTest(
      "Payment Processing",
      false,
      error.response?.data?.error || error.message
    );
  }
}

/**
 * Test 5: Duplicate Detection
 */
async function testDuplicateDetection() {
  try {
    // Execute same payment twice
    const payload = {
      jobType: "PAYMENT_PROCESSING",
      payload: {
        userId: "test_user_dup",
        amount: 25.0,
        currency: "USD",
        description: "Duplicate test",
      },
    };

    // First execution
    await axios.post(`${BASE_URL}/api/jobs/execute`, payload, config);

    // Second execution (should fail)
    const response = await axios.post(
      `${BASE_URL}/api/jobs/execute`,
      payload,
      config
    );

    // Should fail
    logTest("Duplicate Detection", false, "Expected 409 error but got success");
  } catch (error) {
    // Expected to fail with 409
    const passed = error.response?.status === 409;
    logTest(
      "Duplicate Detection",
      passed,
      error.response?.data?.error || error.message
    );
  }
}

/**
 * Test 6: Reward Calculation
 */
async function testRewardCalculation() {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/jobs/execute`,
      {
        jobType: "REWARD_CALCULATION",
        payload: {
          userId: "test_user",
          transactionAmount: 100.0,
          rewardRate: 5.0,
        },
      },
      config
    );

    const passed = response.data.success === true;

    logTest(
      "Reward Calculation",
      passed,
      `Reward: ${response.data.data?.rewardAmount || "N/A"}`
    );
  } catch (error) {
    logTest(
      "Reward Calculation",
      false,
      error.response?.data?.error || error.message
    );
  }
}

/**
 * Test 7: Fund Transfer
 */
async function testFundTransfer() {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/jobs/execute`,
      {
        jobType: "FUND_TRANSFER",
        payload: {
          fromUserId: "test_user_1",
          toUserId: "test_user_2",
          amount: 25.0,
          currency: "USD",
          description: "Test transfer",
        },
      },
      config
    );

    const passed = response.data.success === true;

    logTest(
      "Fund Transfer",
      passed,
      `TransferId: ${response.data.data?.transferId || "N/A"}`
    );
  } catch (error) {
    logTest(
      "Fund Transfer",
      false,
      error.response?.data?.error || error.message
    );
  }
}

/**
 * Test 8: Search Functionality
 */
async function testSearch() {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/jobs/search`,
      {
        query: "payment",
        options: {
          sources: ["jobs"],
          limit: 10,
        },
      },
      config
    );

    const passed = Array.isArray(response.data);

    logTest(
      "Search Functionality",
      passed,
      `Found ${response.data.length} results`
    );
  } catch (error) {
    logTest(
      "Search Functionality",
      false,
      error.response?.data?.error || error.message
    );
  }
}

/**
 * Test 9: Statistics
 */
async function testStatistics() {
  try {
    const response = await axios.get(`${BASE_URL}/api/jobs/statistics`, config);

    const passed = typeof response.data.jobsExecuted === "number";

    logTest(
      "Statistics",
      passed,
      `Executed: ${response.data.jobsExecuted}, Success Rate: ${response.data.success_rate}`
    );
  } catch (error) {
    logTest("Statistics", false, error.response?.data?.error || error.message);
  }
}

/**
 * Test 10: Job Recall
 */
async function testJobRecall() {
  try {
    const response = await axios.get(`${BASE_URL}/api/jobs/memory/recall`, {
      ...config,
      params: {
        jobType: "PAYMENT_PROCESSING",
        payload: JSON.stringify({ userId: "test_user" }),
        limit: 5,
      },
    });

    const passed = Array.isArray(response.data.jobs);

    logTest(
      "Job Recall (Memory)",
      passed,
      `Found ${response.data.similarJobsCount} similar jobs`
    );
  } catch (error) {
    logTest("Job Recall", false, error.response?.data?.error || error.message);
  }
}

/**
 * Print summary
 */
function printSummary() {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("📊 TEST SUMMARY");
  console.log("═══════════════════════════════════════════════════════\n");

  console.log(`Total Tests: ${results.tests.length}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(
    `Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(
      2
    )}%\n`
  );

  if (results.failed > 0) {
    console.log("Failed Tests:");
    results.tests
      .filter((t) => !t.passed)
      .forEach((t) => console.log(`  - ${t.name}: ${t.details}`));
    console.log("");
  }

  console.log("═══════════════════════════════════════════════════════\n");
}

/**
 * Run the test suite
 */
runTests();
