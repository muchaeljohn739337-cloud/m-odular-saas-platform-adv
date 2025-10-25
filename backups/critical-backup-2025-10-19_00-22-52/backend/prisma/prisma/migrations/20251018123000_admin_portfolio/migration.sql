-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'ETH', 'BTC');

-- CreateTable
CREATE TABLE "admin_portfolios" (
    "id" TEXT NOT NULL,
    "currency" "Currency" NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_transfers" (
    "id" TEXT NOT NULL,
    "adminId" TEXT,
    "userId" TEXT,
    "currency" "Currency" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "note" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_portfolios_currency_key" ON "admin_portfolios"("currency");
CREATE INDEX "admin_transfers_currency_idx" ON "admin_transfers"("currency");
CREATE INDEX "admin_transfers_createdAt_idx" ON "admin_transfers"("createdAt");
CREATE INDEX "admin_transfers_userId_idx" ON "admin_transfers"("userId");

-- AddForeignKey
ALTER TABLE "admin_transfers" ADD CONSTRAINT "admin_transfers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
