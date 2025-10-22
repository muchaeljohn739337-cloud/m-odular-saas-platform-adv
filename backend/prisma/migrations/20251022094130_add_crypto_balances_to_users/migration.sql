-- AlterTable
ALTER TABLE "users" ADD COLUMN     "btcBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "ethBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "usdtBalance" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "crypto_withdrawals" ADD CONSTRAINT "crypto_withdrawals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
