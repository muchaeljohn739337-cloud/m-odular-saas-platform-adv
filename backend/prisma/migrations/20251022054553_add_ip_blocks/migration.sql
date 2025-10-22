-- CreateEnum
CREATE TYPE "DoctorStatus" AS ENUM ('PENDING', 'VERIFIED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."admin_transfers" DROP CONSTRAINT "admin_transfers_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."chat_messages" DROP CONSTRAINT "chat_messages_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."chat_sessions" DROP CONSTRAINT "chat_sessions_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."crypto_orders" DROP CONSTRAINT "crypto_orders_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."crypto_withdrawals" DROP CONSTRAINT "crypto_withdrawals_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."debit_cards" DROP CONSTRAINT "debit_cards_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."eth_activity" DROP CONSTRAINT "eth_activity_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."health_readings" DROP CONSTRAINT "health_readings_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."loans" DROP CONSTRAINT "loans_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."notification_preferences" DROP CONSTRAINT "notification_preferences_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."push_subscriptions" DROP CONSTRAINT "push_subscriptions_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."rewards" DROP CONSTRAINT "rewards_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."support_tickets" DROP CONSTRAINT "support_tickets_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."token_transactions" DROP CONSTRAINT "token_transactions_walletId_fkey";

-- DropForeignKey
ALTER TABLE "public"."token_wallets" DROP CONSTRAINT "token_wallets_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_tiers" DROP CONSTRAINT "user_tiers_userId_fkey";

-- DropIndex
DROP INDEX "public"."activity_logs_action_idx";

-- DropIndex
DROP INDEX "public"."activity_logs_createdAt_idx";

-- DropIndex
DROP INDEX "public"."activity_logs_userId_idx";

-- DropIndex
DROP INDEX "public"."chat_messages_createdAt_idx";

-- DropIndex
DROP INDEX "public"."chat_messages_sessionId_idx";

-- DropIndex
DROP INDEX "public"."chat_sessions_status_idx";

-- DropIndex
DROP INDEX "public"."chat_sessions_userId_idx";

-- DropIndex
DROP INDEX "public"."support_tickets_createdAt_idx";

-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "status" "DoctorStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "inviteCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "status" "ConsultationStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "symptoms" TEXT,
    "diagnosis" TEXT,
    "prescription" TEXT,
    "notes" TEXT,
    "videoRoomId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_messages" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_login_logs" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_login_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_login_logs_email_idx" ON "admin_login_logs"("email");

-- CreateIndex
CREATE INDEX "admin_login_logs_status_idx" ON "admin_login_logs"("status");

-- CreateIndex
CREATE INDEX "admin_login_logs_createdAt_idx" ON "admin_login_logs"("createdAt");
