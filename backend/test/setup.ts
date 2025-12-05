/**
 * Test Setup - Global configuration for all tests
 * Sets up test database, server instance, and cleanup hooks
 */

import { PrismaClient } from "@prisma/client";
import { Application } from "express";
import app from "../src/app";
import { cleanTestDatabase, setupTestDatabase } from "./setup-db";

let server: any;
let testApp: Application;
const prisma = new PrismaClient();

export const getApp = (): Application => testApp;
export const getServer = () => server;

// Ensure test environment is set
process.env.NODE_ENV = "test";

// Run once before all tests
beforeAll(async () => {
  try {
    // Setup test database (this will also apply migrations)
    await setupTestDatabase();

    // Initialize app
    testApp = app;

    // Verify database connection
    await prisma.$connect();
    console.log("✅ Test database connection established");

    console.log("✅ Test environment initialized");
  } catch (error) {
    console.error("❌ Failed to initialize test environment:");
    console.error(error);
    process.exit(1);
  }
}, 60000); // 60 second timeout for database setup

// Run after all tests are done
afterAll(async () => {
  try {
    await prisma.$disconnect();
    console.log("✅ Test database connection closed");
  } catch (error) {
    console.error("❌ Error closing test database connection:", error);
  }
});

// Run before each test
beforeEach(async () => {
  // Clean the database before each test
  await cleanTestDatabase();
});

// Run after all tests
afterAll(async () => {
  try {
    // Close server if it's running
    if (server) {
      server.close();
    }

    console.log("✅ Test environment cleaned up");
  } catch (error) {
    console.error("❌ Error during test teardown:");
    console.error(error);
  }
});

// Export test utilities
export * from "./test-utils";

/**
 * Clean all tables in the database
 */
async function cleanDatabase() {
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  for (const { tablename } of tablenames) {
    if (tablename !== "_prisma_migrations") {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
      } catch (error) {
        console.log(`Could not truncate ${tablename}, but continuing...`);
      }
    }
  }
}

/**
 * Initialize test data
 */
async function initializeTestData() {
  // Add any global test data initialization here
  // For example, seed roles, currencies, etc.
}

/**
 * Helper to reset database between tests
 */
export async function resetDatabase() {
  await cleanDatabase();
  await initializeTestData();
}
