#!/usr/bin/env bash

# Test script for newly wired endpoints
set -e

API_URL="http://localhost:4000"
TEST_USER_ID="00000000-0000-0000-0000-000000000002"  # Demo user ID

echo "🧪 Testing New API Endpoints"
echo "================================"
sleep 3

# Test 1: Get token balance
echo -e "\n✅ Test 1: GET /api/tokens/balance/:userId"
curl -s "$API_URL/api/tokens/balance/$TEST_USER_ID" -H "Authorization: Bearer test-token" | head -c 200
echo ""

# Test 2: Get token history
echo -e "\n✅ Test 2: GET /api/tokens/history/:userId"
curl -s "$API_URL/api/tokens/history/$TEST_USER_ID?limit=5" -H "Authorization: Bearer test-token" | head -c 200
echo ""

# Test 3: Get pending rewards
echo -e "\n✅ Test 3: GET /api/rewards/pending/:userId"
curl -s "$API_URL/api/rewards/pending/$TEST_USER_ID" -H "Authorization: Bearer test-token" | head -c 200
echo ""

# Test 4: Get rewards leaderboard
echo -e "\n✅ Test 4: GET /api/rewards/leaderboard?limit=5"
curl -s "$API_URL/api/rewards/leaderboard?limit=5" | head -c 200
echo ""

# Test 5: Get rewards tier info
echo -e "\n✅ Test 5: GET /api/rewards/tier/:userId"
curl -s "$API_URL/api/rewards/tier/$TEST_USER_ID" -H "Authorization: Bearer test-token" | head -c 200
echo ""

echo -e "\n================================"
echo "✅ Endpoint testing complete!"
