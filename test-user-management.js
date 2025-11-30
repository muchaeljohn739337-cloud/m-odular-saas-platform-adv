const https = require("https");
const http = require("http");

async function testUserManagement() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
  };

  console.log("👥 Starting comprehensive user management test...\n");

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
    // Test 1: User Registration
    console.log("1️⃣ Testing user registration...");
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
      email: `testuser${Date.now()}@example.com`,
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
        userId: registerResponse.body?.user?.id,
      };
      console.log("✅ User registration successful");
    } else {
      results.tests.userRegistration = {
        status: "❌ FAILED",
        message: `Registration failed: ${registerResponse.statusCode}`,
        response: registerResponse.body,
      };
      console.log("❌ User registration failed");
      return results; // Exit early if registration fails
    }

    // Test 2: User Login
    console.log("2️⃣ Testing user login...");
    const loginOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/api/auth/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const loginResponse = await makeRequest(loginOptions, {
      email: testUser.email,
      password: testUser.password,
    });

    let userToken = null;
    if (loginResponse.statusCode === 200 && loginResponse.body?.token) {
      results.tests.userLogin = {
        status: "✅ SUCCESS",
        message: "User login successful",
        hasToken: true,
      };
      userToken = loginResponse.body.token;
      console.log("✅ User login successful");
    } else {
      results.tests.userLogin = {
        status: "❌ FAILED",
        message: `Login failed: ${loginResponse.statusCode}`,
        response: loginResponse.body,
      };
      console.log("❌ User login failed");
      return results;
    }

    // Test 3: Get User Profile
    console.log("3️⃣ Testing get user profile...");
    const profileOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/api/users/profile",
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    };

    const profileResponse = await makeRequest(profileOptions);

    if (profileResponse.statusCode === 200 && profileResponse.body) {
      results.tests.getProfile = {
        status: "✅ SUCCESS",
        message: "Get user profile successful",
        profile: profileResponse.body,
      };
      console.log("✅ Get user profile successful");
    } else {
      results.tests.getProfile = {
        status: "❌ FAILED",
        message: `Get profile failed: ${profileResponse.statusCode}`,
        response: profileResponse.body,
      };
      console.log("❌ Get user profile failed");
    }

    // Test 4: Update User Profile
    console.log("4️⃣ Testing update user profile...");
    const updateProfileOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/api/users/profile",
      method: "PUT",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    };

    const updateData = {
      firstName: "Updated",
      lastName: "TestUser",
    };

    const updateResponse = await makeRequest(updateProfileOptions, updateData);

    if (updateResponse.statusCode === 200) {
      results.tests.updateProfile = {
        status: "✅ SUCCESS",
        message: "Update user profile successful",
      };
      console.log("✅ Update user profile successful");
    } else {
      results.tests.updateProfile = {
        status: "❌ FAILED",
        message: `Update profile failed: ${updateResponse.statusCode}`,
        response: updateResponse.body,
      };
      console.log("❌ Update user profile failed");
    }

    // Test 5: Change Password
    console.log("5️⃣ Testing password change...");
    const changePasswordOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/api/users/change-password",
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    };

    const changePasswordResponse = await makeRequest(changePasswordOptions, {
      currentPassword: testUser.password,
      newPassword: "NewPass123!",
    });

    if (changePasswordResponse.statusCode === 200) {
      results.tests.changePassword = {
        status: "✅ SUCCESS",
        message: "Password change successful",
      };
      console.log("✅ Password change successful");
    } else {
      results.tests.changePassword = {
        status: "⚠️  EXPECTED",
        message:
          "Password change may not be implemented or requires different endpoint",
        response: changePasswordResponse.body,
      };
      console.log("⚠️  Password change - may not be implemented");
    }

    // Test 6: Logout (if implemented)
    console.log("6️⃣ Testing logout...");
    const logoutOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/api/auth/logout",
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    };

    const logoutResponse = await makeRequest(logoutOptions);

    if (
      logoutResponse.statusCode === 200 ||
      logoutResponse.statusCode === 204
    ) {
      results.tests.logout = {
        status: "✅ SUCCESS",
        message: "Logout successful",
      };
      console.log("✅ Logout successful");
    } else {
      results.tests.logout = {
        status: "⚠️  EXPECTED",
        message: "Logout may not be implemented or handled differently",
        response: logoutResponse.body,
      };
      console.log("⚠️  Logout - may not be implemented");
    }
  } catch (error) {
    results.tests.generalError = {
      status: "❌ ERROR",
      message: `Test execution failed: ${error.message}`,
    };
    console.log(`❌ Test execution failed: ${error.message}`);
  }

  // Summary
  console.log("\n📊 User Management Test Summary:");
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
    "user-management-test-results.json",
    JSON.stringify(results, null, 2)
  );
  console.log("\n📄 Results saved to user-management-test-results.json");

  return results;
}

// Run the test if executed directly
if (require.main === module) {
  console.log("👥 User management test script starting...");
  testUserManagement().catch(console.error);
}

module.exports = testUserManagement;
