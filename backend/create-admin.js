const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const hash = await bcrypt.hash("SecurePass123!", 10);

    const user = await prisma.user.create({
      data: {
        email: "admin@advancia.com",
        username: "admin",
        passwordHash: hash,
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN",
        active: true,
        termsAccepted: true,
        termsAcceptedAt: new Date(),
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log("Email:", user.email);
    console.log("ID:", user.id);
    console.log("Role:", user.role);
    console.log("\n🔐 Login credentials:");
    console.log("Email: admin@advancia.com");
    console.log("Password: SecurePass123!");
  } catch (error) {
    if (error.code === "P2002") {
      console.log("⚠️  User already exists. Updating...");
      const user = await prisma.user.update({
        where: { email: "admin@advancia.com" },
        data: { role: "ADMIN", active: true },
      });
      console.log("✅ User updated to admin");
      console.log("Email:", user.email);
    } else {
      console.error("❌ Error:", error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
