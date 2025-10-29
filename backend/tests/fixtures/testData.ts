import prisma from "../../src/prismaClient";
import bcrypt from "bcryptjs";

export async function seedCompleteTestData() {
  console.log("🌱 Seeding test data...");
  await cleanTestData();

  const adminPassword = await bcrypt.hash("Admin123!@#", 10);
  const admin = await prisma.User.create({
    data: {
      email: "admin@test.com",
      username: "testadmin",
      passwordHash: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      emailVerified: true,
      active: true,
      usdBalance: 10000.00,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    },
  });

  const userPassword = await bcrypt.hash("User123!@#", 10);
  const user = await prisma.User.create({
    data: {
      email: "user@test.com",
      username: "testuser",
      passwordHash: userPassword,
      firstName: "Test",
      lastName: "User",
      role: "USER",
      emailVerified: true,
      active: true,
      usdBalance: 1000.00,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    },
  });

  console.log("✅ Test users created");
  return { admin, user };
}

export async function cleanTestData() {
  console.log("�� Cleaning test data...");
  
  try {
    const testUsers = await prisma.User.findMany({
      where: {
        email: {
          in: ["admin@test.com", "user@test.com"],
        },
      },
      select: { id: true },
    });

    const testUserIds = testUsers.map((u) => u.id);

    if (testUserIds.length === 0) {
      console.log("No test users found to clean");
      return;
    }

    await prisma.SupportTicket.deleteMany({
      where: { userId: { in: testUserIds } },
    });

    await prisma.UserTier.deleteMany({
      where: { userId: { in: testUserIds } },
    });

    await prisma.Reward.deleteMany({
      where: { userId: { in: testUserIds } },
    });

    const wallets = await prisma.TokenWallet.findMany({
      where: { userId: { in: testUserIds } },
      select: { id: true },
    });
    const walletIds = wallets.map((w) => w.id);

    if (walletIds.length > 0) {
      await prisma.TokenTransaction.deleteMany({
        where: { walletId: { in: walletIds } },
      });
    }

    await prisma.TokenWallet.deleteMany({
      where: { userId: { in: testUserIds } },
    });

    await prisma.Transaction.deleteMany({
      where: { userId: { in: testUserIds } },
    });
    
    await prisma.User.deleteMany({
      where: { id: { in: testUserIds } },
    });

    console.log("✅ Test data cleaned");
  } catch (error) {
    console.error("❌ Error cleaning test data:", error);
  }
}

export const TEST_CREDENTIALS = {
  admin: {
    email: "admin@test.com",
    password: "Admin123!@#",
    role: "ADMIN",
  },
  user: {
    email: "user@test.com",
    password: "User123!@#",
    role: "USER",
  },
};
