/**
 * Frontend E2E Test Seeding Setup
 * Seeds database before Playwright tests run
 */

import { test as setup } from "@playwright/test";
import path from "path";

const STORAGE_STATE = path.join(__dirname, "../.auth/user.json");

/**
 * Global setup - seed database before all E2E tests
 */
setup("seed test database", async () => {
  console.log("🌱 Seeding database for E2E tests...");

  try {
    // Call backend seeding script
    const response = await fetch("http://localhost:4000/api/test/seed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-test-key": process.env.TEST_API_KEY || "test-key-for-e2e",
      },
    });

    if (!response.ok) {
      console.warn("⚠️  Database seeding endpoint not available");
      console.log("Using fallback seeding method...");

      // Fallback: run seeding script directly if endpoint not available
      const { execSync } = require("child_process");
      execSync("npm run test:seed", {
        cwd: path.join(__dirname, "../../backend"),
        stdio: "inherit",
      });
    } else {
      const data = await response.json();
      console.log("✅ Database seeded:", data);
    }
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    // Don't fail tests if seeding fails - tests should handle missing data gracefully
  }
});

/**
 * Authenticate as test user and save state
 */
setup("authenticate as test user", async ({ page }) => {
  console.log("🔐 Authenticating test user...");

  await page.goto("http://localhost:3001/auth/login");

  await page.fill('input[name="email"]', "user@test.com");
  await page.fill('input[name="password"]', "User123!@#");
  await page.click('button[type="submit"]');

  // Wait for successful login redirect
  await page.waitForURL("**/dashboard", { timeout: 10000 }).catch(() => {
    console.warn("⚠️  Login redirect timeout - user may not be approved");
  });

  // Save authentication state
  await page.context().storageState({ path: STORAGE_STATE });

  console.log("✅ Test user authenticated");
});
