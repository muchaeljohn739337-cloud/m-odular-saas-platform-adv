/*
  Warnings:

  - You are about to alter the column `steps` on the `RPAExecution` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `trigger` on the `RPAExecution` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `actions` on the `RPAWorkflow` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `trigger` on the `RPAWorkflow` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "admin_login_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "admin_portfolios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "currency" TEXT NOT NULL,
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
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
    "debitCardPriceUSD" DECIMAL NOT NULL DEFAULT 1000,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "admin_transfers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT,
    "userId" TEXT,
    "currency" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "note" TEXT,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ai_generations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "output" TEXT,
    "imageUrl" TEXT,
    "metadata" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastRotated" DATETIME,
    CONSTRAINT "ai_generations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_models" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "modelType" TEXT NOT NULL,
    "accuracy" DECIMAL,
    "precision" DECIMAL,
    "recall" DECIMAL,
    "f1Score" DECIMAL,
    "trainingSamples" INTEGER NOT NULL DEFAULT 0,
    "modelPath" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "trainedBy" TEXT,
    "trainedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ai_suggestions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "dismissed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ai_training_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "label" BOOLEAN NOT NULL,
    "verifiedBy" TEXT,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ai_usage_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "textGenerations" INTEGER NOT NULL DEFAULT 0,
    "codeGenerations" INTEGER NOT NULL DEFAULT 0,
    "imageGenerations" INTEGER NOT NULL DEFAULT 0,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "costUSD" DECIMAL NOT NULL DEFAULT 0,
    CONSTRAINT "ai_usage_metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "app_roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "policies" JSONB NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "changes" JSONB,
    "previousValues" JSONB,
    "newValues" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "backup_codes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "blockchain_verifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manifest_hash" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "tx_hash" TEXT,
    "record_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "blockchain" TEXT NOT NULL DEFAULT 'polygon',
    "confirmed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "bot_detections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "isBot" BOOLEAN NOT NULL,
    "confidence" DECIMAL NOT NULL,
    "riskScore" DECIMAL NOT NULL DEFAULT 0,
    "signals" JSONB,
    "action" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "senderId" TEXT,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "assignedAdminId" TEXT
);

-- CreateTable
CREATE TABLE "click_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "eventName" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "isRobot" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DECIMAL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "codebase_index" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filePath" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" TEXT,
    "lastIndexed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "compliance_alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alert_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "user_id" TEXT,
    "transaction_id" TEXT,
    "description" TEXT NOT NULL,
    "details" JSONB,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "assigned_to" TEXT,
    "resolution_notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" DATETIME
);

-- CreateTable
CREATE TABLE "compliance_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jurisdiction" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "user_id" TEXT,
    "payment_id" TEXT,
    "payload" JSONB NOT NULL,
    "compliance_result" JSONB NOT NULL,
    "processor" TEXT,
    "risk_score" DECIMAL,
    "violations" JSONB,
    "auto_corrected" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "consultation_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "consultationId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" DATETIME,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "symptoms" TEXT,
    "diagnosis" TEXT,
    "prescription" TEXT,
    "notes" TEXT,
    "videoRoomId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "copilot_feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "copilot_feedback_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "copilot_tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "copilot_interactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "copilot_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "context" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "result" JSONB,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "crisis_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "indicators" JSONB NOT NULL,
    "actions" JSONB,
    "resolved_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminAddress" TEXT NOT NULL,
    "txHash" TEXT,
    "adminNotes" TEXT,
    "userWalletAddress" TEXT,
    "stripeSessionId" TEXT,
    "completedAt" DATETIME,
    "cancelledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "crypto_withdrawals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cryptoType" TEXT NOT NULL,
    "cryptoAmount" DECIMAL NOT NULL,
    "usdEquivalent" DECIMAL NOT NULL,
    "withdrawalAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
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
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "dailyLimit" DECIMAL NOT NULL DEFAULT 1000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedAt" DATETIME,
    "verifiedBy" TEXT,
    "inviteCode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "eth_activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "address" TEXT NOT NULL,
    "addressNormalized" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "txHash" TEXT,
    "amountEth" DECIMAL NOT NULL,
    "status" TEXT NOT NULL,
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "blockNumber" INTEGER,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "fraud_scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT,
    "score" DECIMAL NOT NULL,
    "factors" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ip_blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip" TEXT NOT NULL,
    "reason" TEXT,
    "until" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "jurisdiction_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jurisdiction" TEXT NOT NULL,
    "regulators" TEXT NOT NULL,
    "requirements" JSONB NOT NULL,
    "allowed_processors" TEXT NOT NULL,
    "restricted_countries" TEXT NOT NULL,
    "compliance_level" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "interestRate" DECIMAL NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "monthlyPayment" DECIMAL NOT NULL,
    "remainingBalance" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "purpose" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "paidOffAt" DATETIME,
    "defaultedAt" DATETIME,
    "cancelledAt" DATETIME,
    "adminNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "market_intelligence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "sentiment" TEXT,
    "importance" INTEGER NOT NULL DEFAULT 5,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "medbeds_bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "chamberType" TEXT NOT NULL,
    "chamberName" TEXT NOT NULL,
    "sessionDate" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "cost" DECIMAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "transactionId" TEXT,
    "stripeSessionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "effectiveness" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "medbeds_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notificationId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" DATETIME,
    "metadata" JSONB
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "transactionAlerts" BOOLEAN NOT NULL DEFAULT true,
    "securityAlerts" BOOLEAN NOT NULL DEFAULT true,
    "systemAlerts" BOOLEAN NOT NULL DEFAULT true,
    "rewardAlerts" BOOLEAN NOT NULL DEFAULT true,
    "adminAlerts" BOOLEAN NOT NULL DEFAULT true,
    "promotionalEmails" BOOLEAN NOT NULL DEFAULT false,
    "enableDigest" BOOLEAN NOT NULL DEFAULT false,
    "digestFrequency" TEXT NOT NULL DEFAULT 'daily',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" DATETIME,
    "smsSent" BOOLEAN NOT NULL DEFAULT false,
    "smsSentAt" DATETIME,
    "pushSent" BOOLEAN NOT NULL DEFAULT false,
    "pushSentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "oal_audit_log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "object" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "subjectId" TEXT,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "processor_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "processor_id" TEXT NOT NULL,
    "processor_name" TEXT NOT NULL,
    "jurisdictions" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "fees" JSONB NOT NULL,
    "settlement_time_days" INTEGER NOT NULL,
    "max_amount" DECIMAL NOT NULL,
    "rating" DECIMAL NOT NULL DEFAULT 0.80,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "api_credentials" JSONB,
    "last_health_check" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "deviceInfo" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "expiresAt" DATETIME,
    "claimedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "risk_assessments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "transaction_id" TEXT,
    "risk_score" DECIMAL NOT NULL,
    "risk_level" TEXT NOT NULL,
    "risk_factors" JSONB NOT NULL,
    "assessment_reason" TEXT,
    "adaptive_policy_applied" BOOLEAN NOT NULL DEFAULT false,
    "assessed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "scam_addresses" (
    "address" TEXT NOT NULL PRIMARY KEY,
    "blockchain" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "reported_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "security_patches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "vulnerability" TEXT NOT NULL,
    "fix" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "applied_by" TEXT,
    "applied_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "response" TEXT,
    "resolvedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "resolvedAt" DATETIME
);

-- CreateTable
CREATE TABLE "system_alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "serviceName" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" DATETIME,
    "resolvedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "system_status" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responseTime" INTEGER,
    "uptime" DECIMAL,
    "lastChecked" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusMessage" TEXT,
    "alertLevel" TEXT NOT NULL DEFAULT 'none',
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "token_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "description" TEXT,
    "toAddress" TEXT,
    "fromAddress" TEXT,
    "txHash" TEXT,
    "metadata" TEXT,
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
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "uploaded_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'documents',
    "filename" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT,
    "size" INTEGER NOT NULL,
    "contentType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "uploaded_files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "user_id" TEXT NOT NULL,
    "dashboard_layout" JSONB,
    "features" JSONB,
    "suggestions" JSONB,
    "interaction_log" JSONB,
    "updated_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "usdBalance" DECIMAL NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" DATETIME,
    "lastLogin" DATETIME,
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "termsAcceptedAt" DATETIME,
    "totpSecret" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "totpVerified" BOOLEAN NOT NULL DEFAULT false,
    "backupCodes" TEXT,
    "ethWalletAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "btcBalance" DECIMAL NOT NULL DEFAULT 0,
    "ethBalance" DECIMAL NOT NULL DEFAULT 0,
    "usdtBalance" DECIMAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "vault_audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "secret_key" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "mfa_verified" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "vault_secrets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "encrypted_value" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "rotationPolicy" JSONB,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_rotated" DATETIME
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RPAExecution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflowId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "trigger" JSONB NOT NULL,
    "steps" JSONB NOT NULL,
    "error" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "RPAExecution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "RPAWorkflow" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RPAExecution" ("completedAt", "error", "id", "startedAt", "status", "steps", "trigger", "workflowId") SELECT "completedAt", "error", "id", "startedAt", "status", "steps", "trigger", "workflowId" FROM "RPAExecution";
DROP TABLE "RPAExecution";
ALTER TABLE "new_RPAExecution" RENAME TO "RPAExecution";
CREATE INDEX "RPAExecution_workflowId_idx" ON "RPAExecution"("workflowId");
CREATE INDEX "RPAExecution_status_idx" ON "RPAExecution"("status");
CREATE INDEX "RPAExecution_startedAt_idx" ON "RPAExecution"("startedAt");
CREATE TABLE "new_RPAWorkflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "RPAWorkflow_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RPAWorkflow" ("actions", "createdAt", "createdById", "description", "enabled", "id", "name", "trigger", "updatedAt") SELECT "actions", "createdAt", "createdById", "description", "enabled", "id", "name", "trigger", "updatedAt" FROM "RPAWorkflow";
DROP TABLE "RPAWorkflow";
ALTER TABLE "new_RPAWorkflow" RENAME TO "RPAWorkflow";
CREATE INDEX "RPAWorkflow_enabled_idx" ON "RPAWorkflow"("enabled");
CREATE INDEX "RPAWorkflow_createdById_idx" ON "RPAWorkflow"("createdById");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "admin_login_logs_createdAt_idx" ON "admin_login_logs"("createdAt");

-- CreateIndex
CREATE INDEX "admin_login_logs_status_idx" ON "admin_login_logs"("status");

-- CreateIndex
CREATE INDEX "admin_login_logs_email_idx" ON "admin_login_logs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_portfolios_currency_key" ON "admin_portfolios"("currency");

-- CreateIndex
CREATE INDEX "admin_transfers_userId_idx" ON "admin_transfers"("userId");

-- CreateIndex
CREATE INDEX "admin_transfers_createdAt_idx" ON "admin_transfers"("createdAt");

-- CreateIndex
CREATE INDEX "admin_transfers_currency_idx" ON "admin_transfers"("currency");

-- CreateIndex
CREATE INDEX "ai_generations_createdAt_idx" ON "ai_generations"("createdAt");

-- CreateIndex
CREATE INDEX "ai_generations_status_idx" ON "ai_generations"("status");

-- CreateIndex
CREATE INDEX "ai_generations_type_idx" ON "ai_generations"("type");

-- CreateIndex
CREATE INDEX "ai_generations_userId_idx" ON "ai_generations"("userId");

-- CreateIndex
CREATE INDEX "ai_models_isActive_idx" ON "ai_models"("isActive");

-- CreateIndex
CREATE INDEX "ai_models_modelType_idx" ON "ai_models"("modelType");

-- CreateIndex
CREATE INDEX "ai_suggestions_created_at_idx" ON "ai_suggestions"("created_at");

-- CreateIndex
CREATE INDEX "ai_suggestions_type_idx" ON "ai_suggestions"("type");

-- CreateIndex
CREATE INDEX "ai_suggestions_user_id_idx" ON "ai_suggestions"("user_id");

-- CreateIndex
CREATE INDEX "ai_training_data_createdAt_idx" ON "ai_training_data"("createdAt");

-- CreateIndex
CREATE INDEX "ai_training_data_verifiedBy_idx" ON "ai_training_data"("verifiedBy");

-- CreateIndex
CREATE INDEX "ai_training_data_label_idx" ON "ai_training_data"("label");

-- CreateIndex
CREATE INDEX "ai_usage_metrics_date_idx" ON "ai_usage_metrics"("date");

-- CreateIndex
CREATE INDEX "ai_usage_metrics_userId_idx" ON "ai_usage_metrics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_usage_metrics_userId_date_key" ON "ai_usage_metrics"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "app_roles_name_key" ON "app_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "app_roles_token_key" ON "app_roles"("token");

-- CreateIndex
CREATE INDEX "app_roles_expires_at_idx" ON "app_roles"("expires_at");

-- CreateIndex
CREATE INDEX "app_roles_token_idx" ON "app_roles"("token");

-- CreateIndex
CREATE INDEX "app_roles_name_idx" ON "app_roles"("name");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_resourceId_idx" ON "audit_logs"("resourceId");

-- CreateIndex
CREATE INDEX "audit_logs_resourceType_idx" ON "audit_logs"("resourceType");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "backup_codes_code_key" ON "backup_codes"("code");

-- CreateIndex
CREATE INDEX "backup_codes_isUsed_idx" ON "backup_codes"("isUsed");

-- CreateIndex
CREATE INDEX "backup_codes_code_idx" ON "backup_codes"("code");

-- CreateIndex
CREATE INDEX "backup_codes_userId_idx" ON "backup_codes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_verifications_tx_hash_key" ON "blockchain_verifications"("tx_hash");

-- CreateIndex
CREATE INDEX "blockchain_verifications_created_at_idx" ON "blockchain_verifications"("created_at");

-- CreateIndex
CREATE INDEX "blockchain_verifications_version_idx" ON "blockchain_verifications"("version");

-- CreateIndex
CREATE INDEX "blockchain_verifications_status_idx" ON "blockchain_verifications"("status");

-- CreateIndex
CREATE INDEX "bot_detections_createdAt_idx" ON "bot_detections"("createdAt");

-- CreateIndex
CREATE INDEX "bot_detections_isBot_idx" ON "bot_detections"("isBot");

-- CreateIndex
CREATE INDEX "bot_detections_ipAddress_idx" ON "bot_detections"("ipAddress");

-- CreateIndex
CREATE INDEX "bot_detections_userId_idx" ON "bot_detections"("userId");

-- CreateIndex
CREATE INDEX "click_events_createdAt_idx" ON "click_events"("createdAt");

-- CreateIndex
CREATE INDEX "click_events_isRobot_idx" ON "click_events"("isRobot");

-- CreateIndex
CREATE INDEX "click_events_eventName_idx" ON "click_events"("eventName");

-- CreateIndex
CREATE INDEX "click_events_userId_idx" ON "click_events"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "codebase_index_filePath_key" ON "codebase_index"("filePath");

-- CreateIndex
CREATE INDEX "codebase_index_lastIndexed_idx" ON "codebase_index"("lastIndexed");

-- CreateIndex
CREATE INDEX "codebase_index_filePath_idx" ON "codebase_index"("filePath");

-- CreateIndex
CREATE INDEX "compliance_alerts_created_at_idx" ON "compliance_alerts"("created_at");

-- CreateIndex
CREATE INDEX "compliance_alerts_user_id_idx" ON "compliance_alerts"("user_id");

-- CreateIndex
CREATE INDEX "compliance_alerts_severity_idx" ON "compliance_alerts"("severity");

-- CreateIndex
CREATE INDEX "compliance_alerts_status_idx" ON "compliance_alerts"("status");

-- CreateIndex
CREATE INDEX "compliance_logs_processor_idx" ON "compliance_logs"("processor");

-- CreateIndex
CREATE INDEX "compliance_logs_timestamp_idx" ON "compliance_logs"("timestamp");

-- CreateIndex
CREATE INDEX "compliance_logs_user_id_idx" ON "compliance_logs"("user_id");

-- CreateIndex
CREATE INDEX "compliance_logs_event_type_idx" ON "compliance_logs"("event_type");

-- CreateIndex
CREATE INDEX "compliance_logs_jurisdiction_idx" ON "compliance_logs"("jurisdiction");

-- CreateIndex
CREATE INDEX "copilot_feedback_rating_idx" ON "copilot_feedback"("rating");

-- CreateIndex
CREATE INDEX "copilot_feedback_userId_idx" ON "copilot_feedback"("userId");

-- CreateIndex
CREATE INDEX "copilot_feedback_taskId_idx" ON "copilot_feedback"("taskId");

-- CreateIndex
CREATE INDEX "copilot_interactions_timestamp_idx" ON "copilot_interactions"("timestamp");

-- CreateIndex
CREATE INDEX "copilot_interactions_sessionId_idx" ON "copilot_interactions"("sessionId");

-- CreateIndex
CREATE INDEX "copilot_interactions_userId_idx" ON "copilot_interactions"("userId");

-- CreateIndex
CREATE INDEX "copilot_tasks_createdAt_idx" ON "copilot_tasks"("createdAt");

-- CreateIndex
CREATE INDEX "copilot_tasks_type_idx" ON "copilot_tasks"("type");

-- CreateIndex
CREATE INDEX "copilot_tasks_status_idx" ON "copilot_tasks"("status");

-- CreateIndex
CREATE INDEX "crisis_events_created_at_idx" ON "crisis_events"("created_at");

-- CreateIndex
CREATE INDEX "crisis_events_severity_idx" ON "crisis_events"("severity");

-- CreateIndex
CREATE INDEX "crisis_events_type_idx" ON "crisis_events"("type");

-- CreateIndex
CREATE INDEX "crypto_orders_createdAt_idx" ON "crypto_orders"("createdAt");

-- CreateIndex
CREATE INDEX "crypto_orders_cryptoType_idx" ON "crypto_orders"("cryptoType");

-- CreateIndex
CREATE INDEX "crypto_orders_status_idx" ON "crypto_orders"("status");

-- CreateIndex
CREATE INDEX "crypto_orders_userId_idx" ON "crypto_orders"("userId");

-- CreateIndex
CREATE INDEX "crypto_withdrawals_createdAt_idx" ON "crypto_withdrawals"("createdAt");

-- CreateIndex
CREATE INDEX "crypto_withdrawals_cryptoType_idx" ON "crypto_withdrawals"("cryptoType");

-- CreateIndex
CREATE INDEX "crypto_withdrawals_status_idx" ON "crypto_withdrawals"("status");

-- CreateIndex
CREATE INDEX "crypto_withdrawals_userId_idx" ON "crypto_withdrawals"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "debit_cards_cardNumber_key" ON "debit_cards"("cardNumber");

-- CreateIndex
CREATE INDEX "debit_cards_status_idx" ON "debit_cards"("status");

-- CreateIndex
CREATE INDEX "debit_cards_cardNumber_idx" ON "debit_cards"("cardNumber");

-- CreateIndex
CREATE INDEX "debit_cards_userId_idx" ON "debit_cards"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "eth_activity_txHash_key" ON "eth_activity"("txHash");

-- CreateIndex
CREATE INDEX "eth_activity_createdAt_idx" ON "eth_activity"("createdAt");

-- CreateIndex
CREATE INDEX "eth_activity_type_idx" ON "eth_activity"("type");

-- CreateIndex
CREATE INDEX "eth_activity_addressNormalized_idx" ON "eth_activity"("addressNormalized");

-- CreateIndex
CREATE INDEX "fraud_scores_status_idx" ON "fraud_scores"("status");

-- CreateIndex
CREATE INDEX "fraud_scores_score_idx" ON "fraud_scores"("score");

-- CreateIndex
CREATE INDEX "fraud_scores_transactionId_idx" ON "fraud_scores"("transactionId");

-- CreateIndex
CREATE INDEX "fraud_scores_userId_idx" ON "fraud_scores"("userId");

-- CreateIndex
CREATE INDEX "health_readings_createdAt_idx" ON "health_readings"("createdAt");

-- CreateIndex
CREATE INDEX "health_readings_recordedAt_idx" ON "health_readings"("recordedAt");

-- CreateIndex
CREATE INDEX "health_readings_userId_idx" ON "health_readings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ip_blocks_ip_key" ON "ip_blocks"("ip");

-- CreateIndex
CREATE INDEX "ip_blocks_updatedAt_idx" ON "ip_blocks"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "jurisdiction_rules_jurisdiction_key" ON "jurisdiction_rules"("jurisdiction");

-- CreateIndex
CREATE INDEX "jurisdiction_rules_compliance_level_idx" ON "jurisdiction_rules"("compliance_level");

-- CreateIndex
CREATE INDEX "jurisdiction_rules_enabled_idx" ON "jurisdiction_rules"("enabled");

-- CreateIndex
CREATE INDEX "loans_createdAt_idx" ON "loans"("createdAt");

-- CreateIndex
CREATE INDEX "loans_status_idx" ON "loans"("status");

-- CreateIndex
CREATE INDEX "loans_userId_idx" ON "loans"("userId");

-- CreateIndex
CREATE INDEX "market_intelligence_sentiment_idx" ON "market_intelligence"("sentiment");

-- CreateIndex
CREATE INDEX "market_intelligence_source_idx" ON "market_intelligence"("source");

-- CreateIndex
CREATE INDEX "market_intelligence_created_at_category_idx" ON "market_intelligence"("created_at", "category");

-- CreateIndex
CREATE INDEX "medbeds_bookings_paymentStatus_idx" ON "medbeds_bookings"("paymentStatus");

-- CreateIndex
CREATE INDEX "medbeds_bookings_status_idx" ON "medbeds_bookings"("status");

-- CreateIndex
CREATE INDEX "medbeds_bookings_sessionDate_idx" ON "medbeds_bookings"("sessionDate");

-- CreateIndex
CREATE INDEX "medbeds_bookings_userId_idx" ON "medbeds_bookings"("userId");

-- CreateIndex
CREATE INDEX "notification_logs_channel_idx" ON "notification_logs"("channel");

-- CreateIndex
CREATE INDEX "notification_logs_sentAt_idx" ON "notification_logs"("sentAt");

-- CreateIndex
CREATE INDEX "notification_logs_status_idx" ON "notification_logs"("status");

-- CreateIndex
CREATE INDEX "notification_logs_notificationId_idx" ON "notification_logs"("notificationId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- CreateIndex
CREATE INDEX "notifications_priority_idx" ON "notifications"("priority");

-- CreateIndex
CREATE INDEX "notifications_category_idx" ON "notifications"("category");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "oal_audit_log_createdAt_idx" ON "oal_audit_log"("createdAt");

-- CreateIndex
CREATE INDEX "oal_audit_log_subjectId_idx" ON "oal_audit_log"("subjectId");

-- CreateIndex
CREATE INDEX "oal_audit_log_createdById_idx" ON "oal_audit_log"("createdById");

-- CreateIndex
CREATE INDEX "oal_audit_log_status_idx" ON "oal_audit_log"("status");

-- CreateIndex
CREATE INDEX "oal_audit_log_location_idx" ON "oal_audit_log"("location");

-- CreateIndex
CREATE INDEX "oal_audit_log_action_idx" ON "oal_audit_log"("action");

-- CreateIndex
CREATE INDEX "oal_audit_log_object_idx" ON "oal_audit_log"("object");

-- CreateIndex
CREATE UNIQUE INDEX "processor_configs_processor_id_key" ON "processor_configs"("processor_id");

-- CreateIndex
CREATE INDEX "processor_configs_processor_id_idx" ON "processor_configs"("processor_id");

-- CreateIndex
CREATE INDEX "processor_configs_enabled_idx" ON "processor_configs"("enabled");

-- CreateIndex
CREATE INDEX "push_subscriptions_isActive_idx" ON "push_subscriptions"("isActive");

-- CreateIndex
CREATE INDEX "push_subscriptions_userId_idx" ON "push_subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_userId_endpoint_key" ON "push_subscriptions"("userId", "endpoint");

-- CreateIndex
CREATE INDEX "rewards_createdAt_idx" ON "rewards"("createdAt");

-- CreateIndex
CREATE INDEX "rewards_type_idx" ON "rewards"("type");

-- CreateIndex
CREATE INDEX "rewards_status_idx" ON "rewards"("status");

-- CreateIndex
CREATE INDEX "rewards_userId_idx" ON "rewards"("userId");

-- CreateIndex
CREATE INDEX "risk_assessments_expires_at_idx" ON "risk_assessments"("expires_at");

-- CreateIndex
CREATE INDEX "risk_assessments_assessed_at_idx" ON "risk_assessments"("assessed_at");

-- CreateIndex
CREATE INDEX "risk_assessments_risk_level_idx" ON "risk_assessments"("risk_level");

-- CreateIndex
CREATE INDEX "risk_assessments_user_id_idx" ON "risk_assessments"("user_id");

-- CreateIndex
CREATE INDEX "scam_addresses_category_idx" ON "scam_addresses"("category");

-- CreateIndex
CREATE INDEX "scam_addresses_blockchain_severity_idx" ON "scam_addresses"("blockchain", "severity");

-- CreateIndex
CREATE INDEX "security_patches_created_at_idx" ON "security_patches"("created_at");

-- CreateIndex
CREATE INDEX "security_patches_type_idx" ON "security_patches"("type");

-- CreateIndex
CREATE INDEX "security_patches_status_idx" ON "security_patches"("status");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_userId_idx" ON "support_tickets"("userId");

-- CreateIndex
CREATE INDEX "system_alerts_createdAt_idx" ON "system_alerts"("createdAt");

-- CreateIndex
CREATE INDEX "system_alerts_isResolved_idx" ON "system_alerts"("isResolved");

-- CreateIndex
CREATE INDEX "system_alerts_severity_idx" ON "system_alerts"("severity");

-- CreateIndex
CREATE INDEX "system_alerts_alertType_idx" ON "system_alerts"("alertType");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- CreateIndex
CREATE INDEX "system_status_lastChecked_idx" ON "system_status"("lastChecked");

-- CreateIndex
CREATE INDEX "system_status_alertLevel_idx" ON "system_status"("alertLevel");

-- CreateIndex
CREATE INDEX "system_status_status_idx" ON "system_status"("status");

-- CreateIndex
CREATE INDEX "system_status_serviceName_idx" ON "system_status"("serviceName");

-- CreateIndex
CREATE INDEX "token_transactions_status_idx" ON "token_transactions"("status");

-- CreateIndex
CREATE INDEX "token_transactions_type_idx" ON "token_transactions"("type");

-- CreateIndex
CREATE INDEX "token_transactions_createdAt_idx" ON "token_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "token_transactions_walletId_idx" ON "token_transactions"("walletId");

-- CreateIndex
CREATE UNIQUE INDEX "token_wallets_userId_key" ON "token_wallets"("userId");

-- CreateIndex
CREATE INDEX "token_wallets_userId_idx" ON "token_wallets"("userId");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_createdAt_idx" ON "transactions"("createdAt");

-- CreateIndex
CREATE INDEX "transactions_userId_idx" ON "transactions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "uploaded_files_key_key" ON "uploaded_files"("key");

-- CreateIndex
CREATE INDEX "uploaded_files_userId_category_idx" ON "uploaded_files"("userId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_tiers_userId_key" ON "user_tiers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_tiers_referralCode_key" ON "user_tiers"("referralCode");

-- CreateIndex
CREATE INDEX "user_tiers_referralCode_idx" ON "user_tiers"("referralCode");

-- CreateIndex
CREATE INDEX "user_tiers_points_idx" ON "user_tiers"("points");

-- CreateIndex
CREATE INDEX "user_tiers_currentTier_idx" ON "user_tiers"("currentTier");

-- CreateIndex
CREATE INDEX "user_tiers_userId_idx" ON "user_tiers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_ethWalletAddress_key" ON "users"("ethWalletAddress");

-- CreateIndex
CREATE INDEX "vault_audit_logs_timestamp_idx" ON "vault_audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "vault_audit_logs_secret_key_idx" ON "vault_audit_logs"("secret_key");

-- CreateIndex
CREATE INDEX "vault_audit_logs_action_idx" ON "vault_audit_logs"("action");

-- CreateIndex
CREATE INDEX "vault_audit_logs_user_id_idx" ON "vault_audit_logs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "vault_secrets_key_key" ON "vault_secrets"("key");

-- CreateIndex
CREATE INDEX "vault_secrets_last_rotated_idx" ON "vault_secrets"("last_rotated");

-- CreateIndex
CREATE INDEX "vault_secrets_created_by_idx" ON "vault_secrets"("created_by");

-- CreateIndex
CREATE INDEX "vault_secrets_key_idx" ON "vault_secrets"("key");
