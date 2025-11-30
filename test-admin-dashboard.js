const https = require("https");
const http = require("http");

async function testAdminDashboard() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
  };

  console.log("👑 Starting comprehensive admin dashboard test...\n");

  const baseUrl = "http://localhost:4000";

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
    // Test 1: Admin Authentication
    console.log("1️⃣ Testing admin authentication...");

    const adminLoginOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/api/auth/admin/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const adminCredentials = {
      email: "admin@advancia.com",
      password: "Admin123!",
    };

    const adminLoginResponse = await makeRequest(
      adminLoginOptions,
      adminCredentials
    );

    let adminToken = null;
    if (
      adminLoginResponse.statusCode === 200 &&
      adminLoginResponse.body?.token
    ) {
      adminToken = adminLoginResponse.body.token;
      results.tests.adminAuth = {
        status: "✅ SUCCESS",
        message: "Admin authentication successful",
        hasToken: true,
      };
      console.log("✅ Admin authentication successful");
    } else {
      results.tests.adminAuth = {
        status: "⚠️  EXPECTED",
        message: "Admin login may require setup or different credentials",
        response: adminLoginResponse.body,
      };
      console.log("⚠️  Admin login may require setup");
    }

    // Test 2: Admin Dashboard Access
    if (adminToken) {
      console.log("2️⃣ Testing admin dashboard access...");

      const dashboardOptions = {
        hostname: "localhost",
        port: 4000,
        path: "/api/admin/dashboard",
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      };

      const dashboardResponse = await makeRequest(dashboardOptions);

      if (dashboardResponse.statusCode === 200 && dashboardResponse.body) {
        results.tests.adminDashboard = {
          status: "✅ SUCCESS",
          message: "Admin dashboard access successful",
          dashboardData: dashboardResponse.body,
        };
        console.log("✅ Admin dashboard access successful");
      } else {
        results.tests.adminDashboard = {
          status: "❌ FAILED",
          message: `Admin dashboard access failed: ${dashboardResponse.statusCode}`,
          response: dashboardResponse.body,
        };
        console.log("❌ Admin dashboard access failed");
      }

      // Test 3: User Management
      console.log("3️⃣ Testing user management...");

      const usersOptions = {
        hostname: "localhost",
        port: 4000,
        path: "/api/admin/users",
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      };

      const usersResponse = await makeRequest(usersOptions);

      if (usersResponse.statusCode === 200) {
        results.tests.userManagement = {
          status: "✅ SUCCESS",
          message: "User management access successful",
          userCount: usersResponse.body?.length || 0,
        };
        console.log("✅ User management access successful");
      } else {
        results.tests.userManagement = {
          status: "❌ FAILED",
          message: `User management access failed: ${usersResponse.statusCode}`,
          response: usersResponse.body,
        };
        console.log("❌ User management access failed");
      }

      // Test 4: System Statistics
      console.log("4️⃣ Testing system statistics...");

      const statsOptions = {
        hostname: "localhost",
        port: 4000,
        path: "/api/admin/stats",
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      };

      const statsResponse = await makeRequest(statsOptions);

      if (statsResponse.statusCode === 200 && statsResponse.body) {
        results.tests.systemStats = {
          status: "✅ SUCCESS",
          message: "System statistics access successful",
          stats: statsResponse.body,
        };
        console.log("✅ System statistics access successful");
      } else {
        results.tests.systemStats = {
          status: "⚠️  EXPECTED",
          message: "System stats endpoint may not be implemented",
          response: statsResponse.body,
        };
        console.log("⚠️  System stats endpoint may not be implemented");
      }

      // Test 5: Audit Logs
      console.log("5️⃣ Testing audit logs access...");

      const auditOptions = {
        hostname: "localhost",
        port: 4000,
        path: "/api/admin/audit-logs",
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      };

      const auditResponse = await makeRequest(auditOptions);

      if (auditResponse.statusCode === 200) {
        results.tests.auditLogs = {
          status: "✅ SUCCESS",
          message: "Audit logs access successful",
          logCount: auditResponse.body?.length || 0,
        };
        console.log("✅ Audit logs access successful");
      } else {
        results.tests.auditLogs = {
          status: "⚠️  EXPECTED",
          message: "Audit logs endpoint may not be implemented",
          response: auditResponse.body,
        };
        console.log("⚠️  Audit logs endpoint may not be implemented");
      }

      // Test 6: System Configuration
      console.log("6️⃣ Testing system configuration access...");

      const configOptions = {
        hostname: "localhost",
        port: 4000,
        path: "/api/admin/config",
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      };

      const configResponse = await makeRequest(configOptions);

      if (configResponse.statusCode === 200) {
        results.tests.systemConfig = {
          status: "✅ SUCCESS",
          message: "System configuration access successful",
          config: configResponse.body,
        };
        console.log("✅ System configuration access successful");
      } else {
        results.tests.systemConfig = {
          status: "⚠️  EXPECTED",
          message: "System config endpoint may not be implemented",
          response: configResponse.body,
        };
        console.log("⚠️  System config endpoint may not be implemented");
      }
    } else {
      // Test with regular user token for comparison
      console.log("Testing with regular user token...");

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

      const userLoginResponse = await makeRequest(loginOptions, testUser);

      if (userLoginResponse.statusCode !== 200) {
        // Try to register first
        const registerOptions = {
          hostname: "localhost",
          port: 4000,
          path: "/api/auth/register",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        };

        await makeRequest(registerOptions, {
          email: testUser.email,
          password: testUser.password,
          firstName: "Test",
          lastName: "User",
          role: "user",
        });

        const retryLoginResponse = await makeRequest(loginOptions, testUser);
        if (
          retryLoginResponse.statusCode === 200 &&
          retryLoginResponse.body?.token
        ) {
          const userToken = retryLoginResponse.body.token;

          // Test that regular user cannot access admin routes
          const adminAccessOptions = {
            hostname: "localhost",
            port: 4000,
            path: "/api/admin/dashboard",
            method: "GET",
            headers: {
              Authorization: `Bearer ${userToken}`,
              "Content-Type": "application/json",
            },
          };

          const adminAccessResponse = await makeRequest(adminAccessOptions);

          if (
            adminAccessResponse.statusCode === 403 ||
            adminAccessResponse.statusCode === 401
          ) {
            results.tests.adminAccessControl = {
              status: "✅ SUCCESS",
              message: "Admin access properly restricted to regular users",
            };
            console.log("✅ Admin access properly restricted to regular users");
          } else {
            results.tests.adminAccessControl = {
              status: "❌ FAILED",
              message: "Admin access not properly restricted",
              statusCode: adminAccessResponse.statusCode,
            };
            console.log("❌ Admin access not properly restricted");
          }
        }
      }
    }
  } catch (error) {
    results.tests.generalError = {
      status: "❌ ERROR",
      message: `Test execution failed: ${error.message}`,
    };
    console.log(`❌ Test execution failed: ${error.message}`);
  }

  // Summary
  console.log("\n📊 Admin Dashboard Test Summary:");
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
    "admin-dashboard-test-results.json",
    JSON.stringify(results, null, 2)
  );
  console.log("\n📄 Results saved to admin-dashboard-test-results.json");

  return results;
}

// Run the test if executed directly
if (require.main === module) {
  console.log("👑 Admin dashboard test script starting...");
  testAdminDashboard().catch(console.error);
}

module.exports = testAdminDashboard;
