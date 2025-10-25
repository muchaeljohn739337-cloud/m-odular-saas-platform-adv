-- AlterTable: Enhance audit_logs table with new fields
-- Migration: enhance_audit_log_system
-- Date: 2025-10-17

-- Rename resource column to resourceType
ALTER TABLE "audit_logs" RENAME COLUMN "resource" TO "resourceType";

-- Add new required column resourceId
ALTER TABLE "audit_logs" ADD COLUMN "resourceId" TEXT NOT NULL DEFAULT '';

-- Add JSON columns for tracking changes
ALTER TABLE "audit_logs" ADD COLUMN "changes" JSONB;
ALTER TABLE "audit_logs" ADD COLUMN "previousValues" JSONB;
ALTER TABLE "audit_logs" ADD COLUMN "newValues" JSONB;
ALTER TABLE "audit_logs" ADD COLUMN "metadata" JSONB;

-- Add timestamp column (separate from createdAt)
ALTER TABLE "audit_logs" ADD COLUMN "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Drop old details column (replaced by changes/previousValues/newValues)
ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "details";

-- CreateIndex: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "audit_logs_resourceType_idx" ON "audit_logs"("resourceType");
CREATE INDEX IF NOT EXISTS "audit_logs_resourceId_idx" ON "audit_logs"("resourceId");
CREATE INDEX IF NOT EXISTS "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- Note: userId and createdAt indexes should already exist from previous migration
-- If not, uncomment these:
-- CREATE INDEX IF NOT EXISTS "audit_logs_userId_idx" ON "audit_logs"("userId");
-- CREATE INDEX IF NOT EXISTS "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
