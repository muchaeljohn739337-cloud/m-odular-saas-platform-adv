-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "usdBalance" DECIMAL NOT NULL DEFAULT 0,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "debit_cards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "cardHolderName" TEXT NOT NULL,
    "expiryMonth" INTEGER NOT NULL,
    "expiryYear" INTEGER NOT NULL,
    "cvv" TEXT NOT NULL,
    "cardType" TEXT NOT NULL DEFAULT 'virtual',
    "status" TEXT NOT NULL DEFAULT 'active',
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "dailyLimit" DECIMAL NOT NULL DEFAULT 1000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "debit_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "token_wallets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "tokenType" TEXT NOT NULL DEFAULT 'ADVANCIA',
    "lockedBalance" DECIMAL NOT NULL DEFAULT 0,
    "lifetimeEarned" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "token_wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "token_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "description" TEXT,
    "toAddress" TEXT,
    "fromAddress" TEXT,
    "txHash" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "token_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "token_wallets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "expiresAt" DATETIME,
    "claimedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rewards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_tiers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "currentTier" TEXT NOT NULL DEFAULT 'bronze',
    "points" INTEGER NOT NULL DEFAULT 0,
    "lifetimePoints" INTEGER NOT NULL DEFAULT 0,
    "lifetimeRewards" DECIMAL NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "achievements" TEXT,
    "badges" TEXT,
    "referralCode" TEXT,
    "referredBy" TEXT,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_tiers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "health_readings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "heartRate" INTEGER,
    "bloodPressureSys" INTEGER,
    "bloodPressureDia" INTEGER,
    "steps" INTEGER,
    "sleepHours" DECIMAL,
    "sleepQuality" TEXT,
    "weight" DECIMAL,
    "temperature" DECIMAL,
    "oxygenLevel" INTEGER,
    "stressLevel" TEXT,
    "mood" TEXT,
    "deviceId" TEXT,
    "deviceType" TEXT,
    "metadata" TEXT,
    "notes" TEXT,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "health_readings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "admin_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "btcAddress" TEXT,
    "ethAddress" TEXT,
    "usdtAddress" TEXT,
    "ltcAddress" TEXT,
    "otherAddresses" TEXT,
    "exchangeRateBtc" DECIMAL,
    "exchangeRateEth" DECIMAL,
    "exchangeRateUsdt" DECIMAL,
    "processingFeePercent" DECIMAL NOT NULL DEFAULT 2.5,
    "minPurchaseAmount" DECIMAL NOT NULL DEFAULT 10,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "crypto_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cryptoType" TEXT NOT NULL,
    "usdAmount" DECIMAL NOT NULL,
    "cryptoAmount" DECIMAL NOT NULL,
    "exchangeRate" DECIMAL NOT NULL,
    "processingFee" DECIMAL NOT NULL,
    "totalUsd" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminAddress" TEXT NOT NULL,
    "txHash" TEXT,
    "adminNotes" TEXT,
    "userWalletAddress" TEXT,
    "stripeSessionId" TEXT,
    "completedAt" DATETIME,
    "cancelledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "crypto_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "crypto_withdrawals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cryptoType" TEXT NOT NULL,
    "cryptoAmount" DECIMAL NOT NULL,
    "usdEquivalent" DECIMAL NOT NULL,
    "withdrawalAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminApprovedBy" TEXT,
    "adminNotes" TEXT,
    "txHash" TEXT,
    "networkFee" DECIMAL,
    "approvedAt" DATETIME,
    "rejectedAt" DATETIME,
    "completedAt" DATETIME,
    "cancelledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "crypto_withdrawals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "transactions_userId_idx" ON "transactions"("userId");

-- CreateIndex
CREATE INDEX "transactions_createdAt_idx" ON "transactions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "debit_cards_cardNumber_key" ON "debit_cards"("cardNumber");

-- CreateIndex
CREATE INDEX "debit_cards_userId_idx" ON "debit_cards"("userId");

-- CreateIndex
CREATE INDEX "debit_cards_cardNumber_idx" ON "debit_cards"("cardNumber");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "token_wallets_userId_key" ON "token_wallets"("userId");

-- CreateIndex
CREATE INDEX "token_wallets_userId_idx" ON "token_wallets"("userId");

-- CreateIndex
CREATE INDEX "token_transactions_walletId_idx" ON "token_transactions"("walletId");

-- CreateIndex
CREATE INDEX "token_transactions_createdAt_idx" ON "token_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "token_transactions_type_idx" ON "token_transactions"("type");

-- CreateIndex
CREATE INDEX "token_transactions_status_idx" ON "token_transactions"("status");

-- CreateIndex
CREATE INDEX "rewards_userId_idx" ON "rewards"("userId");

-- CreateIndex
CREATE INDEX "rewards_status_idx" ON "rewards"("status");

-- CreateIndex
CREATE INDEX "rewards_type_idx" ON "rewards"("type");

-- CreateIndex
CREATE INDEX "rewards_createdAt_idx" ON "rewards"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_tiers_userId_key" ON "user_tiers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_tiers_referralCode_key" ON "user_tiers"("referralCode");

-- CreateIndex
CREATE INDEX "user_tiers_userId_idx" ON "user_tiers"("userId");

-- CreateIndex
CREATE INDEX "user_tiers_currentTier_idx" ON "user_tiers"("currentTier");

-- CreateIndex
CREATE INDEX "user_tiers_points_idx" ON "user_tiers"("points");

-- CreateIndex
CREATE INDEX "user_tiers_referralCode_idx" ON "user_tiers"("referralCode");

-- CreateIndex
CREATE INDEX "health_readings_userId_idx" ON "health_readings"("userId");

-- CreateIndex
CREATE INDEX "health_readings_recordedAt_idx" ON "health_readings"("recordedAt");

-- CreateIndex
CREATE INDEX "health_readings_createdAt_idx" ON "health_readings"("createdAt");

-- CreateIndex
CREATE INDEX "crypto_orders_userId_idx" ON "crypto_orders"("userId");

-- CreateIndex
CREATE INDEX "crypto_orders_status_idx" ON "crypto_orders"("status");

-- CreateIndex
CREATE INDEX "crypto_orders_cryptoType_idx" ON "crypto_orders"("cryptoType");

-- CreateIndex
CREATE INDEX "crypto_orders_createdAt_idx" ON "crypto_orders"("createdAt");

-- CreateIndex
CREATE INDEX "crypto_withdrawals_userId_idx" ON "crypto_withdrawals"("userId");

-- CreateIndex
CREATE INDEX "crypto_withdrawals_status_idx" ON "crypto_withdrawals"("status");

-- CreateIndex
CREATE INDEX "crypto_withdrawals_cryptoType_idx" ON "crypto_withdrawals"("cryptoType");

-- CreateIndex
CREATE INDEX "crypto_withdrawals_createdAt_idx" ON "crypto_withdrawals"("createdAt");
