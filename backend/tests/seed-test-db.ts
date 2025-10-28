/**
 * Test Database Seeding Script
 * Seeds test database with users and initial data for E2E testing
 */

import prisma from "../src/prismaClient";
import bcrypt from "bcryptjs";

export async function seedTestDatabase() {
  console.log("🌱 Seeding test database...");

  try {
    // Create test admin user
    const adminPasswordHash = await bcrypt.hash("Admin123!@#", 10);
    const adminUser = await prisma.user.upsert({
      where: { email: "admin@test.com" },
      update: {},
      create: {
        email: "admin@test.com",
        username: "admin",
        passwordHash: adminPasswordHash,
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN",
        active: true,
        emailVerified: true,
        termsAccepted: true,
        termsAcceptedAt: new Date(),
      },
    });

    console.log(`✅ Created admin user: ${adminUser.email}`);

    // Create regular test user
    const userPasswordHash = await bcrypt.hash("User123!@#", 10);
    const testUser = await prisma.user.upsert({
      where: { email: "user@test.com" },
      update: {},
      create: {
        email: "user@test.com",
        username: "testuser",
        passwordHash: userPasswordHash,
        firstName: "Test",
        lastName: "User",
        role: "USER",
        active: true,
        emailVerified: true,
        termsAccepted: true,
        termsAcceptedAt: new Date(),
      },
    });

    console.log(`✅ Created test user: ${testUser.email}`);

    // Create test token wallet for the user
    await prisma.tokenWallet.upsert({
      where: { userId: testUser.id },
      update: {},
      create: {
        userId: testUser.id,
        balance: 1000,
        currency: "ADV",
      },
    });

    console.log("✅ Created test token wallet");

    console.log("🎉 Test database seeding complete!");

    return {
      adminUser,
      testUser,
    };
  } catch (error) {
    console.error("❌ Error seeding test database:", error);
    throw error;
  }
}

export async function cleanTestDatabase() {
  console.log("🧹 Cleaning test database...");

  try {
    // Delete in reverse order of dependencies
    await prisma.tokenWallet.deleteMany({
      where: {
        user: {
          email: {
            in: ["admin@test.com", "user@test.com"],
          },
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: ["admin@test.com", "user@test.com"],
        },
      },
    });

    console.log("✅ Test database cleaned");
  } catch (error) {
    console.error("❌ Error cleaning test database:", error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedTestDatabase()
    .then(() => {
      console.log("Seeding complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
