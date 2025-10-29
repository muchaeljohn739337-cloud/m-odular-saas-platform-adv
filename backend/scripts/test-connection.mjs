import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

console.log("Testing Prisma connection...");
try {
  const count = await prisma.user.count();
  console.log(`✅ Connection successful! Found ${count} users.`);
  
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (admin) {
    console.log(`✅ Admin user found: ${admin.email}`);
  } else {
    console.log("⚠️  No admin user found");
  }
  
  await prisma.$disconnect();
} catch (error) {
  console.error("❌ Connection failed:", error.message);
  process.exit(1);
}
