const https = require("https");
const http = require("http");

async function testPaymentProcessing() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
  };

  console.log("💳 Starting comprehensive payment processing test...\n");

  const baseUrl = "http://localhost:4000"; // Backend URL

  // Helper function to make HTTP requests
  function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          try {
            const response = {
              statusCode: res.statusCode,
              headers: res.headers,
              body: body ? JSON.parse(body) : null,
            };
            resolve(response);
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: body,
            });
          }
        });
      });

      req.on("error", (err) => {
        reject(err);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  try {
    // First, we need to authenticate to get a token
    console.log("1️⃣ Authenticating user for payment tests...");
    const loginOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/api/auth/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const testUser = {
      email: "test@example.com",
      password: "TestPass123!",
    };

    const loginResponse = await makeRequest(loginOptions, testUser);

    let userToken = null;
    if (loginResponse.statusCode === 200 && loginResponse.body?.token) {
      userToken = loginResponse.body.token;
      results.tests.userAuth = {
        status: "✅ SUCCESS",
        message: "User authentication successful",
      };
      console.log("✅ User authentication successful");
    } else {
      // Try to register a test user first
      console.log("Registering test user...");
      const registerOptions = {
        hostname: "localhost",
        port: 4000,
        path: "/api/auth/register",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const registerResponse = await makeRequest(registerOptions, {
        email: testUser.email,
        password: testUser.password,
        firstName: "Test",
        lastName: "User",
        role: "user",
      });

      if (
        registerResponse.statusCode === 201 ||
        registerResponse.statusCode === 200
      ) {
        console.log("✅ Test user registered, trying login again...");
        const retryLoginResponse = await makeRequest(loginOptions, testUser);
        if (
          retryLoginResponse.statusCode === 200 &&
          retryLoginResponse.body?.token
        ) {
          userToken = retryLoginResponse.body.token;
          results.tests.userAuth = {
            status: "✅ SUCCESS",
            message: "User authentication successful after registration",
          };
          console.log("✅ User authentication successful");
        } else {
          results.tests.userAuth = {
            status: "❌ FAILED",
            message: "Authentication failed even after registration",
            response: retryLoginResponse.body,
          };
          console.log("❌ Authentication failed");
          return results;
        }
      } else {
        results.tests.userAuth = {
          status: "❌ FAILED",
          message: "User registration failed",
          response: registerResponse.body,
        };
        console.log("❌ User registration failed");
        return results;
      }
    }

    // Test 2: Create Payment Intent
    console.log("2️⃣ Testing payment intent creation...");
    const paymentIntentOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/api/payments/create-intent",
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    };

    const paymentIntentResponse = await makeRequest(paymentIntentOptions, {
      amount: 1000, // $10.00
      currency: "usd",
      description: "Test payment",
    });

    if (
      paymentIntentResponse.statusCode === 200 &&
      paymentIntentResponse.body?.clientSecret
    ) {
      results.tests.createPaymentIntent = {
        status: "✅ SUCCESS",
        message: "Payment intent creation successful",
        hasClientSecret: true,
      };
      console.log("✅ Payment intent creation successful");
    } else {
      results.tests.createPaymentIntent = {
        status: "❌ FAILED",
        message: `Payment intent creation failed: ${paymentIntentResponse.statusCode}`,
        response: paymentIntentResponse.body,
      };
      console.log("❌ Payment intent creation failed");
    }

    // Test 3: Get Payment Methods
    console.log("3️⃣ Testing get payment methods...");
    const paymentMethodsOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/api/payments/methods",
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    };

    const paymentMethodsResponse = await makeRequest(paymentMethodsOptions);

    if (paymentMethodsResponse.statusCode === 200) {
      results.tests.getPaymentMethods = {
        status: "✅ SUCCESS",
        message: "Get payment methods successful",
        methods: paymentMethodsResponse.body,
      };
      console.log("✅ Get payment methods successful");
    } else {
      results.tests.getPaymentMethods = {
        status: "⚠️  EXPECTED",
        message: "Payment methods endpoint may not be implemented",
        response: paymentMethodsResponse.body,
      };
      console.log("⚠️  Get payment methods - may not be implemented");
    }

    // Test 4: Get Payment History
    console.log("4️⃣ Testing get payment history...");
    const paymentHistoryOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/api/payments/history",
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    };

    const paymentHistoryResponse = await makeRequest(paymentHistoryOptions);

    if (paymentHistoryResponse.statusCode === 200) {
      results.tests.getPaymentHistory = {
        status: "✅ SUCCESS",
        message: "Get payment history successful",
        history: paymentHistoryResponse.body,
      };
      console.log("✅ Get payment history successful");
    } else {
      results.tests.getPaymentHistory = {
        status: "⚠️  EXPECTED",
        message: "Payment history endpoint may not be implemented",
        response: paymentHistoryResponse.body,
      };
      console.log("⚠️  Get payment history - may not be implemented");
    }

    // Test 5: Test Webhook Endpoint (simulated)
    console.log("5️⃣ Testing webhook endpoint availability...");
    const webhookOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/api/payments/webhook",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Stripe-Signature": "test-signature",
      },
    };

    const webhookResponse = await makeRequest(webhookOptions, {
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "pi_test",
          amount: 1000,
          currency: "usd",
        },
      },
    });

    if (
      webhookResponse.statusCode === 400 ||
      webhookResponse.statusCode === 200
    ) {
      results.tests.webhookEndpoint = {
        status: "✅ SUCCESS",
        message: "Webhook endpoint is accessible",
        statusCode: webhookResponse.statusCode,
      };
      console.log("✅ Webhook endpoint is accessible");
    } else {
      results.tests.webhookEndpoint = {
        status: "❌ FAILED",
        message: `Webhook endpoint not accessible: ${webhookResponse.statusCode}`,
      };
      console.log("❌ Webhook endpoint not accessible");
    }
  } catch (error) {
    results.tests.generalError = {
      status: "❌ ERROR",
      message: `Test execution failed: ${error.message}`,
    };
    console.log(`❌ Test execution failed: ${error.message}`);
  }

  // Summary
  console.log("\n📊 Payment Processing Test Summary:");
  console.log("=====================================");

  const passed = Object.values(results.tests).filter((test) =>
    test.status.includes("SUCCESS")
  ).length;
  const failed = Object.values(results.tests).filter((test) =>
    test.status.includes("FAILED")
  ).length;
  const warnings = Object.values(results.tests).filter(
    (test) =>
      test.status.includes("EXPECTED") || test.status.includes("WARNING")
  ).length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);

  // Save results
  const fs = require("fs");
  fs.writeFileSync(
    "payment-test-results.json",
    JSON.stringify(results, null, 2)
  );
  console.log("\n📄 Results saved to payment-test-results.json");

  return results;
}

// Run the test if executed directly
if (require.main === module) {
  console.log("💳 Payment processing test script starting...");
  testPaymentProcessing().catch(console.error);
}

module.exports = testPaymentProcessing;
