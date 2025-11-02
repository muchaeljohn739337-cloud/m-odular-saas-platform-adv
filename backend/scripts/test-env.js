// Simple test to verify environment
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testEnvironment() {
  console.log("\n🔍 Environment Check\n");

  // Test 1: Can we import Prisma?
  console.log("✅ Prisma imported successfully");

  // Test 2: Can we connect to the database?
  try {
    console.log("🔌 Testing database connection...");
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Test 3: Can we query?
    const userCount = await prisma.user.count();
    console.log(`✅ Database query successful - Found ${userCount} users`);

    await prisma.$disconnect();

    console.log("\n✅ Environment is ready!\n");
    console.log("You can now run: npm run agent:test\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Database connection failed!");
    console.error("Error:", error.message);
    console.error("\n💡 Quick fixes:");
    console.error("   1. Check if PostgreSQL is running:");
    console.error("      net start postgresql-x64-14");
    console.error("   2. Verify DATABASE_URL in .env");
    console.error("   3. Create database if needed:");
    console.error(
      "      psql -U postgres -c 'CREATE DATABASE advancia_payledger;'"
    );
    console.error("   4. Run migrations:");
    console.error("      npx prisma migrate deploy\n");

    await prisma.$disconnect();
    process.exit(1);
  }
}

testEnvironment();
