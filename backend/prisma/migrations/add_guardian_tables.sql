-- Guardian AI System Tables
-- Auto-generated migration for self-monitoring AI

-- Blocked IPs table
CREATE TABLE IF NOT EXISTS "BlockedIP" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip_address" TEXT NOT NULL UNIQUE,
    "reason" TEXT NOT NULL,
    "blocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Incidents table (for alerts and monitoring)
CREATE TABLE IF NOT EXISTS "Incident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- Security Events table
CREATE TABLE IF NOT EXISTS "SecurityEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_id" TEXT,
    "details" JSONB,
    "action_taken" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SecurityEvent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- System Metrics table (for historical tracking)
CREATE TABLE IF NOT EXISTS "SystemMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "metric_type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Vulnerability Scan Results
CREATE TABLE IF NOT EXISTS "VulnerabilityScan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scan_type" TEXT NOT NULL,
    "critical_count" INTEGER NOT NULL DEFAULT 0,
    "high_count" INTEGER NOT NULL DEFAULT 0,
    "medium_count" INTEGER NOT NULL DEFAULT 0,
    "low_count" INTEGER NOT NULL DEFAULT 0,
    "details" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "BlockedIP_ip_address_idx" ON "BlockedIP"("ip_address");
CREATE INDEX IF NOT EXISTS "BlockedIP_expires_at_idx" ON "BlockedIP"("expires_at");
CREATE INDEX IF NOT EXISTS "Incident_severity_idx" ON "Incident"("severity");
CREATE INDEX IF NOT EXISTS "Incident_status_idx" ON "Incident"("status");
CREATE INDEX IF NOT EXISTS "Incident_created_at_idx" ON "Incident"("created_at");
CREATE INDEX IF NOT EXISTS "SecurityEvent_event_type_idx" ON "SecurityEvent"("event_type");
CREATE INDEX IF NOT EXISTS "SecurityEvent_ip_address_idx" ON "SecurityEvent"("ip_address");
CREATE INDEX IF NOT EXISTS "SecurityEvent_created_at_idx" ON "SecurityEvent"("created_at");
CREATE INDEX IF NOT EXISTS "SystemMetric_metric_type_idx" ON "SystemMetric"("metric_type");
CREATE INDEX IF NOT EXISTS "SystemMetric_timestamp_idx" ON "SystemMetric"("timestamp");

-- Add rate_limit_override column to User table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='User' AND column_name='rate_limit_override'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "rate_limit_override" INTEGER;
    END IF;
END $$;
