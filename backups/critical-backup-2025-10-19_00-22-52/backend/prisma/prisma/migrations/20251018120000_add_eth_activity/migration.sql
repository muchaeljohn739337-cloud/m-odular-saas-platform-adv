-- CreateEnum
CREATE TYPE "EthActivityType" AS ENUM ('DEPOSIT', 'WITHDRAWAL');

-- CreateTable
CREATE TABLE "eth_activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "address" TEXT NOT NULL,
    "addressNormalized" TEXT NOT NULL,
    "type" "EthActivityType" NOT NULL,
    "txHash" TEXT,
    "amountEth" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "blockNumber" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eth_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "eth_activity_txHash_key" ON "eth_activity"("txHash");
CREATE INDEX "eth_activity_addressNormalized_idx" ON "eth_activity"("addressNormalized");
CREATE INDEX "eth_activity_type_idx" ON "eth_activity"("type");
CREATE INDEX "eth_activity_createdAt_idx" ON "eth_activity"("createdAt");

-- AddForeignKey
ALTER TABLE "eth_activity" ADD CONSTRAINT "eth_activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
