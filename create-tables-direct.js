// Direct table creation script - no more waiting!
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://advancia_user:AxYyJPvCeXo0vA6uiQvjG2kEUgJKo20t@dpg-d3p5n1p5pdvs73ad8o1g-a.oregon-postgres.render.com/advancia_prod',
  ssl: { rejectUnauthorized: false }
});

async function createTables() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Drop and recreate ENUM types
    try {
      await client.query(`DROP TYPE IF EXISTS "Role" CASCADE`);
      await client.query(`DROP TYPE IF EXISTS "Currency" CASCADE`);
      await client.query(`DROP TYPE IF EXISTS "EthActivityType" CASCADE`);
      await client.query(`DROP TABLE IF EXISTS "users" CASCADE`);
    } catch (e) { console.log('Clean slate ready'); }
    
    await client.query(`CREATE TYPE "Role" AS ENUM ('USER', 'STAFF', 'ADMIN')`);
    await client.query(`CREATE TYPE "Currency" AS ENUM ('USD', 'ETH', 'BTC')`);
    await client.query(`CREATE TYPE "EthActivityType" AS ENUM ('DEPOSIT', 'WITHDRAWAL')`);
    console.log('✅ ENUM types created');
    
    // Create the users table - minimum needed for registration
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "email" TEXT NOT NULL UNIQUE,
        "username" TEXT NOT NULL UNIQUE,
        "passwordHash" TEXT NOT NULL,
        "firstName" TEXT,
        "lastName" TEXT,
        "role" "Role" NOT NULL DEFAULT 'USER',
        "usdBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "lastLogin" TIMESTAMP(3),
        "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
        "termsAcceptedAt" TIMESTAMP(3),
        "totpSecret" TEXT,
        "totpEnabled" BOOLEAN NOT NULL DEFAULT false,  
        "totpVerified" BOOLEAN NOT NULL DEFAULT false,
        "backupCodes" TEXT,
        "ethWalletAddress" TEXT UNIQUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await client.query(createUsersTable);
    console.log('✅ Users table created');
    
    // Test the table exists
    const result = await client.query("SELECT COUNT(*) FROM users");
    console.log('✅ Table working - count:', result.rows[0].count);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createTables();