// Quick Database Connection Test
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  console.log("Testing database connection...");

  try {
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Database query successful - Found ${userCount} users`);

    await prisma.$disconnect();
    return true;
  } catch (error: any) {
    console.error("❌ Database connection failed:", error.message);
    await prisma.$disconnect();
    return false;
  }
}

testConnection()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
