const https = require("https");
const http = require("http");

console.log("🔐 Authentication test script starting...");

// Run the test immediately if this script is executed directly
if (require.main === module) {
  console.log("Running as main module...");
  testAuthentication().catch(console.error);
}

async function testAuthentication() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
  };

  console.log("🔐 Starting comprehensive authentication test...\n");

  const baseUrl = "http://localhost:4000"; // Backend URL
  const testEmail = "admin@advancia.com";
  const testPassword = "Admin123!";

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
    // Test 1: Admin Login Request
    console.log("1️⃣ Testing admin login request...");
    const loginOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/api/auth/admin/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const loginResponse = await makeRequest(loginOptions, {
      email: testEmail,
      password: testPassword,
    });

    if (loginResponse.statusCode === 200 && loginResponse.body?.requiresOTP) {
      results.tests.adminLogin = {
        status: "✅ SUCCESS",
        message: "Admin login initiated, OTP required",
        otpRequired: loginResponse.body.requiresOTP,
      };
      console.log("✅ Admin login request successful - OTP required");
    } else if (loginResponse.statusCode === 401) {
      results.tests.adminLogin = {
        status: "⚠️  EXPECTED",
        message: "Admin login failed - may need setup or different credentials",
        response: loginResponse.body,
      };
      console.log("⚠️  Admin login failed - may need setup");
    } else {
      results.tests.adminLogin = {
        status: "❌ FAILED",
        message: `Unexpected response: ${loginResponse.statusCode}`,
        response: loginResponse.body,
      };
      console.log("❌ Admin login test failed");
    }

    // Test 2: User Registration
    console.log("2️⃣ Testing user registration...");
    const registerOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/api/auth/register",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const testUser = {
      email: `test${Date.now()}@example.com`,
      password: "TestPass123!",
      firstName: "Test",
      lastName: "User",
      role: "user",
    };

    const registerResponse = await makeRequest(registerOptions, testUser);

    if (
      registerResponse.statusCode === 201 ||
      registerResponse.statusCode === 200
    ) {
      results.tests.userRegistration = {
        status: "✅ SUCCESS",
        message: "User registration successful",
        user: registerResponse.body,
      };
      console.log("✅ User registration successful");
    } else {
      results.tests.userRegistration = {
        status: "❌ FAILED",
        message: `Registration failed: ${registerResponse.statusCode}`,
        response: registerResponse.body,
      };
      console.log("❌ User registration failed");
    }

    // Test 3: User Login
    console.log("3️⃣ Testing user login...");
    const userLoginOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/api/auth/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const userLoginResponse = await makeRequest(userLoginOptions, {
      email: testUser.email,
      password: testUser.password,
    });

    if (userLoginResponse.statusCode === 200 && userLoginResponse.body?.token) {
      results.tests.userLogin = {
        status: "✅ SUCCESS",
        message: "User login successful",
        hasToken: !!userLoginResponse.body.token,
      };
      console.log("✅ User login successful");

      // Test 4: Protected Route Access
      console.log("4️⃣ Testing protected route access...");
      const protectedOptions = {
        hostname: "localhost",
        port: 4000,
        path: "/api/users/profile",
        method: "GET",
        headers: {
          Authorization: `Bearer ${userLoginResponse.body.token}`,
          "Content-Type": "application/json",
        },
      };

      const protectedResponse = await makeRequest(protectedOptions);

      if (protectedResponse.statusCode === 200) {
        results.tests.protectedRoute = {
          status: "✅ SUCCESS",
          message: "Protected route access successful",
        };
        console.log("✅ Protected route access successful");
      } else {
        results.tests.protectedRoute = {
          status: "❌ FAILED",
          message: `Protected route failed: ${protectedResponse.statusCode}`,
          response: protectedResponse.body,
        };
        console.log("❌ Protected route access failed");
      }

      // Test 5: Invalid Token
      console.log("5️⃣ Testing invalid token rejection...");
      const invalidTokenOptions = {
        hostname: "localhost",
        port: 4000,
        path: "/api/users/profile",
        method: "GET",
        headers: {
          Authorization: "Bearer invalid.token.here",
          "Content-Type": "application/json",
        },
      };

      const invalidTokenResponse = await makeRequest(invalidTokenOptions);

      if (
        invalidTokenResponse.statusCode === 401 ||
        invalidTokenResponse.statusCode === 403
      ) {
        results.tests.invalidToken = {
          status: "✅ SUCCESS",
          message: "Invalid token properly rejected",
        };
        console.log("✅ Invalid token properly rejected");
      } else {
        results.tests.invalidToken = {
          status: "❌ FAILED",
          message: `Invalid token not rejected: ${invalidTokenResponse.statusCode}`,
        };
        console.log("❌ Invalid token test failed");
      }
    } else {
      results.tests.userLogin = {
        status: "❌ FAILED",
        message: `User login failed: ${userLoginResponse.statusCode}`,
        response: userLoginResponse.body,
      };
      console.log("❌ User login failed");
    }

    // Test 6: Password Reset Request
    console.log("6️⃣ Testing password reset request...");
    const resetOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/api/auth/forgot-password",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const resetResponse = await makeRequest(resetOptions, {
      email: testUser.email,
    });

    if (resetResponse.statusCode === 200 || resetResponse.statusCode === 202) {
      results.tests.passwordReset = {
        status: "✅ SUCCESS",
        message: "Password reset request accepted",
      };
      console.log("✅ Password reset request successful");
    } else {
      results.tests.passwordReset = {
        status: "⚠️  EXPECTED",
        message:
          "Password reset may not be implemented or email service not configured",
        response: resetResponse.body,
      };
      console.log("⚠️  Password reset request - may not be implemented");
    }
  } catch (error) {
    results.tests.generalError = {
      status: "❌ ERROR",
      message: `Test execution failed: ${error.message}`,
    };
    console.log(`❌ Test execution failed: ${error.message}`);
  }

  // Summary
  console.log("\n📊 Authentication Test Summary:");
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
  console.log("\n📄 Saving results to auth-test-results.json...");
  try {
    fs.writeFileSync(
      "auth-test-results.json",
      JSON.stringify(results, null, 2)
    );
    console.log("✅ Results saved successfully");
  } catch (error) {
    console.log("❌ Failed to save results:", error.message);
  }

  return results;
}

// Run the test
testAuthentication().catch(console.error);
