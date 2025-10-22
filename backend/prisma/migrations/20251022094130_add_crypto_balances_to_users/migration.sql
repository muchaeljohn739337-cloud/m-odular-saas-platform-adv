-- AlterTable: Add crypto balance columns with IF NOT EXISTS
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "btcBalance" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "ethBalance" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "usdtBalance" DECIMAL(65,30) DEFAULT 0;

-- Drop existing foreign key if it exists (ignore if it doesn't)
ALTER TABLE "crypto_withdrawals" 
DROP CONSTRAINT IF EXISTS "crypto_withdrawals_userId_fkey";

-- Add the foreign key (this should succeed now)
ALTER TABLE "crypto_withdrawals" 
ADD CONSTRAINT "crypto_withdrawals_userId_fkey" 
FOREIGN KEY ("userId") 
REFERENCES "users"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;
