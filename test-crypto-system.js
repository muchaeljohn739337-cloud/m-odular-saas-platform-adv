#!/usr/bin/env node

/**
 * Crypto & Token System - Integration Test Script
 * 
 * Tests all major endpoints added/modified:
 * - CoinGecko price integration
 * - Admin reward system
 * - Token statistics
 * - Admin token flow dashboard
 */

const axios = require('axios');

const API_BASE = process.env.API_URL || 'http://localhost:4000/api';
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.cyan}🧪 CRYPTO & TOKEN SYSTEM - INTEGRATION TEST${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
console.log('');

let adminToken = null;
let testUserId = null;
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Test helper function
 */
async function test(name, fn) {
  try {
    process.stdout.write(`${colors.yellow}Testing: ${name}...${colors.reset} `);
    const result = await fn();
    console.log(`${colors.green}✅ PASS${colors.reset}`);
    testResults.passed++;
    testResults.tests.push({ name, status: 'PASS', result });
    return result;
  } catch (error) {
    console.log(`${colors.red}❌ FAIL${colors.reset}`);
    console.log(`   Error: ${error.message}`);
    testResults.failed++;
    testResults.tests.push({ name, status: 'FAIL', error: error.message });
    return null;
  }
}

/**
 * Test 1: Health Check
 */
async function testHealthCheck() {
  const response = await axios.get(`${API_BASE}/health`);
  if (response.status !== 200) throw new Error('Health check failed');
  return response.data;
}

/**
 * Test 2: Admin Login
 */
async function testAdminLogin() {
  const response = await axios.post(`${API_BASE}/auth/login`, {
    email: process.env.ADMIN_EMAIL || 'admin@advanciapayledger.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345'
  });
  
  if (!response.data.token) throw new Error('No token received');
  if (response.data.user.role !== 'ADMIN' && response.data.user.role !== 'STAFF') {
    throw new Error('User is not an admin');
  }
  
  adminToken = response.data.token;
  testUserId = response.data.user.id;
  return { userId: response.data.user.id, role: response.data.user.role };
}

/**
 * Test 3: Get Crypto Prices (CoinGecko Integration)
 */
async function testCryptoPrices() {
  const response = await axios.get(`${API_BASE}/crypto/prices`);
  
  if (!response.data.prices) throw new Error('No prices object');
  if (!response.data.prices.BTC) throw new Error('BTC price missing');
  if (!response.data.prices.ETH) throw new Error('ETH price missing');
  if (response.data.prices.BTC.usd <= 0) throw new Error('Invalid BTC price');
  
  return {
    btcPrice: response.data.prices.BTC.usd,
    ethPrice: response.data.prices.ETH.usd,
    source: response.data.source
  };
}

/**
 * Test 4: Get Market Data for BTC
 */
async function testMarketData() {
  const response = await axios.get(`${API_BASE}/crypto/market/BTC`);
  
  if (!response.data.market) throw new Error('No market object');
  if (!response.data.market.market_cap) throw new Error('Market cap missing');
  
  return {
    marketCap: response.data.market.market_cap,
    volume24h: response.data.market.total_volume,
    priceChange24h: response.data.market.price_change_percentage_24h
  };
}

/**
 * Test 5: Get Token Admin Statistics
 */
async function testTokenStats() {
  if (!adminToken) throw new Error('Admin token required');
  
  const response = await axios.get(`${API_BASE}/tokens/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  
  if (!response.data.stats) throw new Error('No stats object');
  if (typeof response.data.stats.totalSupply === 'undefined') {
    throw new Error('Total supply missing');
  }
  
  return {
    totalSupply: response.data.stats.totalSupply,
    circulatingSupply: response.data.stats.circulatingSupply,
    activeUsers: response.data.stats.activeUsers
  };
}

/**
 * Test 6: Get Recent Token Activity
 */
async function testRecentActivity() {
  if (!adminToken) throw new Error('Admin token required');
  
  const response = await axios.get(`${API_BASE}/tokens/admin/recent-activity?limit=5`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  
  if (!Array.isArray(response.data.activities)) {
    throw new Error('Activities not an array');
  }
  
  return {
    count: response.data.activities.length,
    activities: response.data.activities.slice(0, 2)
  };
}

/**
 * Test 7: Get Top Token Holders
 */
async function testTopHolders() {
  if (!adminToken) throw new Error('Admin token required');
  
  const response = await axios.get(`${API_BASE}/tokens/admin/top-holders?limit=5`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  
  if (!Array.isArray(response.data.holders)) {
    throw new Error('Holders not an array');
  }
  
  return {
    count: response.data.holders.length,
    topHolder: response.data.holders[0]
  };
}

/**
 * Test 8: Get Reward Statistics
 */
async function testRewardStats() {
  if (!adminToken) throw new Error('Admin token required');
  
  const response = await axios.get(`${API_BASE}/rewards/admin/statistics`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  
  if (!response.data.statistics) throw new Error('No statistics object');
  
  return {
    totalRewardsSent: response.data.statistics.totalRewardsSent,
    activeRewards: response.data.statistics.activeRewards,
    totalValue: response.data.statistics.totalRewardValue
  };
}

/**
 * Test 9: Send Test Reward (requires valid user ID)
 */
async function testSendReward() {
  if (!adminToken) throw new Error('Admin token required');
  if (!testUserId) throw new Error('Test user ID required');
  
  const response = await axios.post(
    `${API_BASE}/rewards/admin/send`,
    {
      userId: testUserId,
      amount: 10,
      description: 'Test reward from integration test',
      expiresIn: 7 // 7 days
    },
    {
      headers: { Authorization: `Bearer ${adminToken}` }
    }
  );
  
  if (!response.data.reward) throw new Error('No reward object');
  if (response.data.reward.amount !== '10') throw new Error('Invalid reward amount');
  
  return {
    rewardId: response.data.reward.id,
    amount: response.data.reward.amount,
    status: response.data.reward.status
  };
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`${colors.yellow}Running tests against: ${API_BASE}${colors.reset}`);
  console.log('');
  
  // Core tests
  await test('Health Check', testHealthCheck);
  await test('Admin Login', testAdminLogin);
  
  // CoinGecko integration tests
  await test('Get Crypto Prices (CoinGecko)', testCryptoPrices);
  await test('Get BTC Market Data', testMarketData);
  
  // Admin token statistics tests
  await test('Get Token Statistics', testTokenStats);
  await test('Get Recent Token Activity', testRecentActivity);
  await test('Get Top Token Holders', testTopHolders);
  
  // Admin reward system tests
  await test('Get Reward Statistics', testRewardStats);
  await test('Send Test Reward', testSendReward);
  
  // Print summary
  console.log('');
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}📊 TEST SUMMARY${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log('');
  console.log(`${colors.green}✅ Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${testResults.failed}${colors.reset}`);
  console.log('');
  
  if (testResults.failed > 0) {
    console.log(`${colors.red}Failed tests:${colors.reset}`);
    testResults.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => console.log(`  - ${t.name}: ${t.error}`));
    console.log('');
  }
  
  console.log(`${colors.yellow}💡 Tips:${colors.reset}`);
  console.log('   - Ensure backend is running: cd backend && npm run dev');
  console.log('   - Check .env has correct admin credentials');
  console.log('   - Verify axios is installed: npm list axios');
  console.log('   - See CRYPTO_TOKEN_SYSTEM_COMPLETE.md for details');
  console.log('');
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
