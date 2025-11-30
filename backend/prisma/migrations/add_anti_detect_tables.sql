-- Anti-Detect Layer Database Tables
-- Extends Guardian AI with approval queue and security rules

-- Approval Queue for human-in-loop operations
CREATE TABLE IF NOT EXISTS "ApprovalQueue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operation_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "user_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "data" JSONB,
    "requires_admin" BOOLEAN NOT NULL DEFAULT true,
    "requires_2fa" BOOLEAN NOT NULL DEFAULT false,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ApprovalQueue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ApprovalQueue_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Blocked Actions log
CREATE TABLE IF NOT EXISTS "BlockedAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "layer" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "user_id" TEXT,
    "ip_address" TEXT,
    "request_data" JSONB,
    "threat_level" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlockedAction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Security Rules configuration
CREATE TABLE IF NOT EXISTS "SecurityRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rule_name" TEXT NOT NULL UNIQUE,
    "layer" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL,
    "pattern" TEXT,
    "action" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- Audit Trail for all security events
CREATE TABLE IF NOT EXISTS "AuditTrail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_type" TEXT NOT NULL,
    "layer" TEXT NOT NULL,
    "user_id" TEXT,
    "admin_id" TEXT,
    "action" TEXT NOT NULL,
    "before_state" JSONB,
    "after_state" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "success" BOOLEAN NOT NULL,
    "error_message" TEXT,
    "forensic_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditTrail_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditTrail_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Honeypot Access Log
CREATE TABLE IF NOT EXISTS "HoneypotAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT,
    "headers" JSONB,
    "payload" JSONB,
    "auto_blocked" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Rate Limit Tracking
CREATE TABLE IF NOT EXISTS "RateLimitViolation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip_address" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "limit_type" TEXT NOT NULL,
    "violation_count" INTEGER NOT NULL,
    "window_start" TIMESTAMP(3) NOT NULL,
    "window_end" TIMESTAMP(3) NOT NULL,
    "action_taken" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "ApprovalQueue_status_idx" ON "ApprovalQueue"("status");
CREATE INDEX IF NOT EXISTS "ApprovalQueue_user_id_idx" ON "ApprovalQueue"("user_id");
CREATE INDEX IF NOT EXISTS "ApprovalQueue_expires_at_idx" ON "ApprovalQueue"("expires_at");

CREATE INDEX IF NOT EXISTS "BlockedAction_layer_idx" ON "BlockedAction"("layer");
CREATE INDEX IF NOT EXISTS "BlockedAction_ip_address_idx" ON "BlockedAction"("ip_address");
CREATE INDEX IF NOT EXISTS "BlockedAction_created_at_idx" ON "BlockedAction"("created_at");

CREATE INDEX IF NOT EXISTS "SecurityRule_layer_idx" ON "SecurityRule"("layer");
CREATE INDEX IF NOT EXISTS "SecurityRule_enabled_idx" ON "SecurityRule"("enabled");

CREATE INDEX IF NOT EXISTS "AuditTrail_event_type_idx" ON "AuditTrail"("event_type");
CREATE INDEX IF NOT EXISTS "AuditTrail_layer_idx" ON "AuditTrail"("layer");
CREATE INDEX IF NOT EXISTS "AuditTrail_user_id_idx" ON "AuditTrail"("user_id");
CREATE INDEX IF NOT EXISTS "AuditTrail_created_at_idx" ON "AuditTrail"("created_at");

CREATE INDEX IF NOT EXISTS "HoneypotAccess_ip_address_idx" ON "HoneypotAccess"("ip_address");
CREATE INDEX IF NOT EXISTS "HoneypotAccess_created_at_idx" ON "HoneypotAccess"("created_at");

CREATE INDEX IF NOT EXISTS "RateLimitViolation_ip_address_idx" ON "RateLimitViolation"("ip_address");
CREATE INDEX IF NOT EXISTS "RateLimitViolation_window_start_idx" ON "RateLimitViolation"("window_start");

-- Insert default security rules
INSERT INTO "SecurityRule" ("id", "rule_name", "layer", "rule_type", "pattern", "action", "severity", "enabled", "created_at", "updated_at")
VALUES
    ('rule_001', 'Block SQL Injection', 'ANTI_EXPLOIT', 'PATTERN', '(\bOR\b|\bAND\b).*=.*(\bOR\b|\bAND\b)', 'BLOCK', 'CRITICAL', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rule_002', 'Block XSS Attempts', 'ANTI_EXPLOIT', 'PATTERN', '<script[^>]*>.*?</script>', 'BLOCK', 'CRITICAL', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rule_003', 'Block Path Traversal', 'ANTI_EXPLOIT', 'PATTERN', '(\.\.\/|\.\.\\)', 'BLOCK', 'HIGH', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rule_004', 'Block Delete Environment', 'ANTI_SUGGEST', 'KEYWORD', 'delete environment', 'BLOCK', 'CRITICAL', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rule_005', 'Block Drop Database', 'ANTI_SUGGEST', 'KEYWORD', 'drop database', 'BLOCK', 'CRITICAL', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rule_006', 'Require Approval for Payments', 'ANTI_APPROVE', 'OPERATION', 'PAYMENT_PROCESSING', 'REQUIRE_APPROVAL', 'HIGH', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rule_007', 'Require Approval for Key Rotation', 'ANTI_APPROVE', 'OPERATION', 'API_KEY_ROTATION', 'REQUIRE_APPROVAL', 'HIGH', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rule_008', 'Block Infrastructure Changes', 'ANTI_PLAN', 'OPERATION', 'INFRASTRUCTURE_CHANGE', 'REQUIRE_APPROVAL', 'HIGH', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rule_009', 'Block Table Rename', 'ANTI_ORGANIZE', 'OPERATION', 'RENAME_TABLE', 'BLOCK', 'HIGH', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rule_010', 'Monitor Honeypot Access', 'ANTI_SECURE', 'ENDPOINT', '/admin/backdoor', 'AUTO_BLOCK', 'CRITICAL', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (rule_name) DO NOTHING;

-- Verify tables created
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ApprovalQueue') THEN
        RAISE NOTICE '✅ ApprovalQueue table created';
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'BlockedAction') THEN
        RAISE NOTICE '✅ BlockedAction table created';
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'SecurityRule') THEN
        RAISE NOTICE '✅ SecurityRule table created';
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'AuditTrail') THEN
        RAISE NOTICE '✅ AuditTrail table created';
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'HoneypotAccess') THEN
        RAISE NOTICE '✅ HoneypotAccess table created';
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'RateLimitViolation') THEN
        RAISE NOTICE '✅ RateLimitViolation table created';
    END IF;
END $$;
