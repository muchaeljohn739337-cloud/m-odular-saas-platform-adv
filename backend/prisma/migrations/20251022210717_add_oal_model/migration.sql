/*
  Warnings:

  - Made the column `btcBalance` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ethBalance` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `usdtBalance` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "OALStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "btcBalance" SET NOT NULL,
ALTER COLUMN "ethBalance" SET NOT NULL,
ALTER COLUMN "usdtBalance" SET NOT NULL;

-- CreateTable
CREATE TABLE "medbeds_bookings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chamberType" TEXT NOT NULL,
    "chamberName" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "transactionId" TEXT,
    "stripeSessionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "effectiveness" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medbeds_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oal_audit_log" (
    "id" TEXT NOT NULL,
    "object" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "subjectId" TEXT,
    "metadata" JSONB,
    "status" "OALStatus" NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oal_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "medbeds_bookings_userId_idx" ON "medbeds_bookings"("userId");

-- CreateIndex
CREATE INDEX "medbeds_bookings_sessionDate_idx" ON "medbeds_bookings"("sessionDate");

-- CreateIndex
CREATE INDEX "medbeds_bookings_status_idx" ON "medbeds_bookings"("status");

-- CreateIndex
CREATE INDEX "medbeds_bookings_paymentStatus_idx" ON "medbeds_bookings"("paymentStatus");

-- CreateIndex
CREATE INDEX "oal_audit_log_object_idx" ON "oal_audit_log"("object");

-- CreateIndex
CREATE INDEX "oal_audit_log_action_idx" ON "oal_audit_log"("action");

-- CreateIndex
CREATE INDEX "oal_audit_log_location_idx" ON "oal_audit_log"("location");

-- CreateIndex
CREATE INDEX "oal_audit_log_status_idx" ON "oal_audit_log"("status");

-- CreateIndex
CREATE INDEX "oal_audit_log_createdById_idx" ON "oal_audit_log"("createdById");

-- CreateIndex
CREATE INDEX "oal_audit_log_subjectId_idx" ON "oal_audit_log"("subjectId");

-- CreateIndex
CREATE INDEX "oal_audit_log_createdAt_idx" ON "oal_audit_log"("createdAt");

-- AddForeignKey
ALTER TABLE "medbeds_bookings" ADD CONSTRAINT "medbeds_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
