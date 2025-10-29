import prisma from "../../src/prismaClient";
import bcrypt from "bcryptjs";

/**
 * Complete test data fixtures with all relationships
 * Creates admin user, regular user, and all related entities
 */
export async function seedCompleteTestData() {
  console.log("🌱 Seeding complete test data...");

  // Clean existing test data first
  await cleanTestData();

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash("Admin123!@#", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@test.com",
      username: "testadmin",
      passwordHash: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      emailVerified: true,
      active: true,
      usdBalance: 10000.0,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    },
  });

  console.log(`✅ Created admin user: ${admin.email}`);

  // 2. Create Regular User
  const userPassword = await bcrypt.hash("User123!@#", 10);
  const user = await prisma.user.create({
    data: {
      email: "user@test.com",
      username: "testuser",
      passwordHash: userPassword,
      firstName: "Test",
      lastName: "User",
      role: "USER",
      emailVerified: true,
      active: true,
      usdBalance: 1000.0,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    },
  });

  console.log(`✅ Created regular user: ${user.email}`);

  // 3. Create Token Wallets
  const adminWallet = await prisma.tokenWallet.create({
    data: {
      userId: admin.id,
      balance: 5000.0,
      lockedBalance: 2000.0,
      lifetimeEarned: 7000.0,
      tokenType: "ADVANCIA",
    },
  });

  const userWallet = await prisma.tokenWallet.create({
    data: {
      userId: user.id,
      balance: 500.0,
      lockedBalance: 100.0,
      lifetimeEarned: 600.0,
      tokenType: "ADVANCIA",
    },
  });

  console.log("✅ Created token wallets");

  // 4. Create Transactions
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        userId: admin.id,
        type: "deposit",
        amount: 5000.0,
        status: "completed",
        description: "Initial deposit",
        category: "deposit",
      },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "deposit",
        amount: 500.0,
        status: "completed",
        description: "User deposit",
        category: "deposit",
      },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "withdrawal",
        amount: 50.0,
        status: "pending",
        description: "Test withdrawal",
        category: "withdrawal",
      },
    }),
  ]);

  console.log(`✅ Created ${transactions.length} transactions`);

  // 5. Create Token Transactions
  const tokenTransactions = await Promise.all([
    prisma.tokenTransaction.create({
      data: {
        walletId: adminWallet.id,
        amount: 100.0,
        type: "buy",
        status: "completed",
        description: "Admin token purchase",
      },
    }),
    prisma.tokenTransaction.create({
      data: {
        walletId: userWallet.id,
        amount: 50.0,
        type: "buy",
        status: "completed",
        description: "User token purchase",
      },
    }),
  ]);

  console.log(`✅ Created ${tokenTransactions.length} token transactions`);

  // 6. Create Rewards
  const rewards = await Promise.all([
    prisma.reward.create({
      data: {
        userId: admin.id,
        type: "referral",
        amount: 100.0,
        title: "Referral Bonus",
        description: "Referral bonus reward",
        status: "completed",
      },
    }),
    prisma.reward.create({
      data: {
        userId: user.id,
        type: "tier_upgrade",
        amount: 50.0,
        title: "Tier Upgrade Bonus",
        description: "Gold tier bonus",
        status: "pending",
      },
    }),
  ]);

  console.log(`✅ Created ${rewards.length} rewards`);

  // 7. Create User Tiers
  const userTiers = await Promise.all([
    prisma.userTier.create({
      data: {
        userId: admin.id,
        currentTier: "platinum",
        points: 10000,
        lifetimePoints: 10000,
        lifetimeRewards: 1000.0,
      },
    }),
    prisma.userTier.create({
      data: {
        userId: user.id,
        currentTier: "gold",
        points: 500,
        lifetimePoints: 500,
        lifetimeRewards: 50.0,
      },
    }),
  ]);

  console.log(`✅ Created ${userTiers.length} user tiers`);

  // 8. Create Support Tickets
  const supportTickets = await Promise.all([
    prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject: "Test ticket",
        message: "This is a test support ticket",
        category: "GENERAL",
        status: "OPEN",
        priority: "MEDIUM",
      },
    }),
  ]);

  console.log(`✅ Created ${supportTickets.length} support tickets`);

  // 9. Create System Config (for admin endpoints)
  const systemConfig = await prisma.systemConfig.upsert({
    where: { key: "maintenance_mode" },
    update: { value: "false" },
    create: {
      key: "maintenance_mode",
      value: "false",
    },
  });

  console.log("✅ Created system config");
  console.log("🎉 Complete test data seeding finished!");

  return {
    admin,
    user,
    adminWallet,
    userWallet,
    transactions,
    tokenTransactions,
    rewards,
    userTiers,
    supportTickets,
    systemConfig,
  };
}

/**
 * Clean all test data
 */
        },
      },
    });

    await prisma.userTier.deleteMany({
      where: {
        user: {
          email: {
            in: ["admin@test.com", "user@test.com"],
          },
        },
      },
    });

    await prisma.reward.deleteMany({
      where: {
        user: {
          email: {
            in: ["admin@test.com", "user@test.com"],
          },
        },
      },
    });

    await prisma.tokenTransaction.deleteMany({
      where: {
        wallet: {
          user: {
            email: {
              in: ["admin@test.com", "user@test.com"],
            },
          },
        },
      },
    });

    await prisma.tokenWallet.deleteMany({
      where: {
        user: {
          email: {
            in: ["admin@test.com", "user@test.com"],
          },
        },
      },
    });

    await prisma.transaction.deleteMany({
      where: {
        user: {
          email: {
            in: ["admin@test.com", "user@test.com"],
          },
        },
      },
    });

    // Delete test users last
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ["admin@test.com", "user@test.com"],
        },
      },
    });

    console.log("✅ Test data cleaned");
  } catch (error) {
    console.error("❌ Error cleaning test data:", error);
    throw error;
  }
}

/**
 * Get test user credentials for login tests
 */
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

