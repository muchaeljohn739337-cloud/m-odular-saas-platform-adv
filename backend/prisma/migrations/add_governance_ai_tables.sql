-- ═══════════════════════════════════════════════════════════════
-- GOVERNANCE AI DATABASE SCHEMA
-- ═══════════════════════════════════════════════════════════════
-- Purpose: Store compliance logs, jurisdiction rules, risk assessments
-- Tables: ComplianceLog, JurisdictionRule, RiskAssessment, ProcessorConfig

-- Table 1: ComplianceLog - Track all compliance events
CREATE TABLE IF NOT EXISTS "ComplianceLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "jurisdiction" TEXT NOT NULL,
  "event_type" TEXT NOT NULL, -- PAYMENT_ROUTED, COMPLIANCE_CHECK, VIOLATION_DETECTED, etc.
  "user_id" TEXT,
  "payment_id" TEXT,
  "payload" JSONB NOT NULL,
  "compliance_result" JSONB NOT NULL,
  "processor" TEXT,
  "risk_score" DECIMAL(3,2),
  "violations" JSONB,
  "auto_corrected" BOOLEAN DEFAULT FALSE,
  "timestamp" TIMESTAMP DEFAULT NOW(),
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- Table 2: JurisdictionRule - Store jurisdiction-specific rules (overrides defaults)
CREATE TABLE IF NOT EXISTS "JurisdictionRule" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "jurisdiction" TEXT UNIQUE NOT NULL,
  "regulators" TEXT[] NOT NULL,
  "requirements" JSONB NOT NULL, -- KYC, AML, transaction limits, etc.
  "allowed_processors" TEXT[] NOT NULL,
  "restricted_countries" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "compliance_level" TEXT NOT NULL, -- strict, moderate, lenient
  "enabled" BOOLEAN DEFAULT TRUE,
  "last_updated" TIMESTAMP DEFAULT NOW(),
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- Table 3: RiskAssessment - Store risk scores for users/transactions
CREATE TABLE IF NOT EXISTS "RiskAssessment" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "user_id" TEXT NOT NULL,
  "transaction_id" TEXT,
  "risk_score" DECIMAL(3,2) NOT NULL,
  "risk_level" TEXT NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
  "risk_factors" JSONB NOT NULL,
  "assessment_reason" TEXT,
  "adaptive_policy_applied" BOOLEAN DEFAULT FALSE,
  "assessed_at" TIMESTAMP DEFAULT NOW(),
  "expires_at" TIMESTAMP, -- Risk scores can expire
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- Table 4: ProcessorConfig - Payment processor configurations
CREATE TABLE IF NOT EXISTS "ProcessorConfig" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "processor_id" TEXT UNIQUE NOT NULL,
  "processor_name" TEXT NOT NULL,
  "jurisdictions" TEXT[] NOT NULL,
  "features" TEXT[] NOT NULL,
  "fees" JSONB NOT NULL, -- { percentage: 2.9, fixed: 0.30 }
  "settlement_time_days" INTEGER NOT NULL,
  "max_amount" DECIMAL(12,2) NOT NULL,
  "rating" DECIMAL(3,2) DEFAULT 0.80,
  "enabled" BOOLEAN DEFAULT TRUE,
  "api_credentials" JSONB, -- Encrypted credentials
  "last_health_check" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Table 5: ComplianceAlert - High-priority compliance alerts
CREATE TABLE IF NOT EXISTS "ComplianceAlert" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "alert_type" TEXT NOT NULL, -- SANCTIONS_HIT, PEP_DETECTED, HIGH_RISK_TRANSACTION, etc.
  "severity" TEXT NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
  "user_id" TEXT,
  "transaction_id" TEXT,
  "description" TEXT NOT NULL,
  "details" JSONB,
  "status" TEXT DEFAULT 'OPEN', -- OPEN, INVESTIGATING, RESOLVED, FALSE_POSITIVE
  "assigned_to" TEXT,
  "resolution_notes" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "resolved_at" TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════════════

-- ComplianceLog indexes
CREATE INDEX IF NOT EXISTS "ComplianceLog_jurisdiction_idx" ON "ComplianceLog"("jurisdiction");
CREATE INDEX IF NOT EXISTS "ComplianceLog_event_type_idx" ON "ComplianceLog"("event_type");
CREATE INDEX IF NOT EXISTS "ComplianceLog_user_id_idx" ON "ComplianceLog"("user_id");
CREATE INDEX IF NOT EXISTS "ComplianceLog_timestamp_idx" ON "ComplianceLog"("timestamp" DESC);
CREATE INDEX IF NOT EXISTS "ComplianceLog_processor_idx" ON "ComplianceLog"("processor");

-- RiskAssessment indexes
CREATE INDEX IF NOT EXISTS "RiskAssessment_user_id_idx" ON "RiskAssessment"("user_id");
CREATE INDEX IF NOT EXISTS "RiskAssessment_risk_level_idx" ON "RiskAssessment"("risk_level");
CREATE INDEX IF NOT EXISTS "RiskAssessment_assessed_at_idx" ON "RiskAssessment"("assessed_at" DESC);
CREATE INDEX IF NOT EXISTS "RiskAssessment_expires_at_idx" ON "RiskAssessment"("expires_at");

-- JurisdictionRule indexes
CREATE INDEX IF NOT EXISTS "JurisdictionRule_enabled_idx" ON "JurisdictionRule"("enabled");
CREATE INDEX IF NOT EXISTS "JurisdictionRule_compliance_level_idx" ON "JurisdictionRule"("compliance_level");

-- ProcessorConfig indexes
CREATE INDEX IF NOT EXISTS "ProcessorConfig_enabled_idx" ON "ProcessorConfig"("enabled");
CREATE INDEX IF NOT EXISTS "ProcessorConfig_processor_id_idx" ON "ProcessorConfig"("processor_id");

-- ComplianceAlert indexes
CREATE INDEX IF NOT EXISTS "ComplianceAlert_status_idx" ON "ComplianceAlert"("status");
CREATE INDEX IF NOT EXISTS "ComplianceAlert_severity_idx" ON "ComplianceAlert"("severity");
CREATE INDEX IF NOT EXISTS "ComplianceAlert_user_id_idx" ON "ComplianceAlert"("user_id");
CREATE INDEX IF NOT EXISTS "ComplianceAlert_created_at_idx" ON "ComplianceAlert"("created_at" DESC);

-- ═══════════════════════════════════════════════════════════════
-- COMMENTS FOR DOCUMENTATION
-- ═══════════════════════════════════════════════════════════════

COMMENT ON TABLE "ComplianceLog" IS 'Complete audit trail of all compliance events and payment routing decisions';
COMMENT ON TABLE "JurisdictionRule" IS 'Jurisdiction-specific compliance rules (USA, Canada, UK, EU, etc.)';
COMMENT ON TABLE "RiskAssessment" IS 'Risk scores for users and transactions with expiration';
COMMENT ON TABLE "ProcessorConfig" IS 'Payment processor configurations and capabilities';
COMMENT ON TABLE "ComplianceAlert" IS 'High-priority compliance alerts requiring investigation';

COMMENT ON COLUMN "ComplianceLog"."auto_corrected" IS 'Whether Governance AI automatically corrected a violation';
COMMENT ON COLUMN "RiskAssessment"."adaptive_policy_applied" IS 'Whether risk-adaptive policies were applied';
COMMENT ON COLUMN "ProcessorConfig"."api_credentials" IS 'Encrypted API credentials for processor integration';

-- ═══════════════════════════════════════════════════════════════
-- PRE-POPULATED DATA
-- ═══════════════════════════════════════════════════════════════

-- Insert default jurisdiction rules (can be overridden via admin UI)
INSERT INTO "JurisdictionRule" ("jurisdiction", "regulators", "requirements", "allowed_processors", "restricted_countries", "compliance_level", "enabled") VALUES
(
  'USA',
  ARRAY['FinCEN', 'OFAC', 'SEC', 'State Banking Authorities'],
  '{
    "kyc": {"required": true, "level": "enhanced"},
    "aml": {"required": true, "monitoring": "continuous"},
    "transactionLimit": {"daily": 10000, "monthly": 50000},
    "reportingThreshold": 10000,
    "sanctionsScreening": true,
    "pep_screening": true,
    "sourceOfFunds": {"threshold": 5000}
  }'::JSONB,
  ARRAY['stripe', 'square', 'braintree', 'authorize.net'],
  ARRAY['IR', 'KP', 'SY', 'CU'],
  'strict',
  TRUE
),
(
  'CAN',
  ARRAY['FINTRAC', 'OSFI', 'Provincial Regulators'],
  '{
    "kyc": {"required": true, "level": "standard"},
    "aml": {"required": true, "monitoring": "periodic"},
    "transactionLimit": {"daily": 15000, "monthly": 60000},
    "reportingThreshold": 10000,
    "sanctionsScreening": true,
    "pep_screening": false,
    "sourceOfFunds": {"threshold": 10000}
  }'::JSONB,
  ARRAY['stripe', 'square', 'moneris', 'bambora'],
  ARRAY['IR', 'KP', 'SY'],
  'moderate',
  TRUE
),
(
  'GBR',
  ARRAY['FCA', 'PRA', 'HMRC'],
  '{
    "kyc": {"required": true, "level": "enhanced"},
    "aml": {"required": true, "monitoring": "continuous"},
    "transactionLimit": {"daily": 8000, "monthly": 40000},
    "reportingThreshold": 10000,
    "sanctionsScreening": true,
    "pep_screening": true,
    "sourceOfFunds": {"threshold": 5000}
  }'::JSONB,
  ARRAY['stripe', 'worldpay', 'checkout.com', 'adyen'],
  ARRAY['IR', 'KP', 'SY', 'RU'],
  'strict',
  TRUE
),
(
  'EUR',
  ARRAY['EBA', 'ECB', 'National Regulators'],
  '{
    "kyc": {"required": true, "level": "standard"},
    "aml": {"required": true, "monitoring": "continuous"},
    "transactionLimit": {"daily": 10000, "monthly": 50000},
    "reportingThreshold": 15000,
    "sanctionsScreening": true,
    "pep_screening": true,
    "sourceOfFunds": {"threshold": 10000},
    "sca": {"required": true},
    "gdpr": {"required": true}
  }'::JSONB,
  ARRAY['stripe', 'adyen', 'klarna', 'mollie'],
  ARRAY['IR', 'KP', 'SY', 'RU'],
  'strict',
  TRUE
),
(
  'GLOBAL',
  ARRAY['Local Authorities'],
  '{
    "kyc": {"required": false, "level": "basic"},
    "aml": {"required": false, "monitoring": "none"},
    "transactionLimit": {"daily": 50000, "monthly": 200000},
    "reportingThreshold": 50000,
    "sanctionsScreening": false,
    "pep_screening": false,
    "sourceOfFunds": {"threshold": 25000}
  }'::JSONB,
  ARRAY['stripe', 'paypal', 'crypto'],
  ARRAY[]::TEXT[],
  'lenient',
  TRUE
)
ON CONFLICT ("jurisdiction") DO NOTHING;

-- Insert default processor configurations
INSERT INTO "ProcessorConfig" ("processor_id", "processor_name", "jurisdictions", "features", "fees", "settlement_time_days", "max_amount", "rating", "enabled") VALUES
(
  'stripe',
  'Stripe',
  ARRAY['USA', 'CAN', 'GBR', 'EUR', 'GLOBAL'],
  ARRAY['cards', 'ach', 'sepa', 'local_methods'],
  '{"percentage": 2.9, "fixed": 0.30}'::JSONB,
  2,
  999999.00,
  0.95,
  TRUE
),
(
  'square',
  'Square',
  ARRAY['USA', 'CAN', 'GBR'],
  ARRAY['cards', 'ach'],
  '{"percentage": 2.6, "fixed": 0.10}'::JSONB,
  1,
  50000.00,
  0.90,
  TRUE
),
(
  'paypal',
  'PayPal',
  ARRAY['USA', 'CAN', 'GBR', 'EUR', 'GLOBAL'],
  ARRAY['paypal_balance', 'cards', 'bank'],
  '{"percentage": 3.5, "fixed": 0.49}'::JSONB,
  3,
  100000.00,
  0.85,
  TRUE
),
(
  'crypto',
  'Crypto (Coinbase/Ethereum)',
  ARRAY['GLOBAL'],
  ARRAY['bitcoin', 'ethereum', 'usdc'],
  '{"percentage": 1.0, "fixed": 0}'::JSONB,
  0,
  9999999.00,
  0.80,
  TRUE
)
ON CONFLICT ("processor_id") DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════

-- Verify tables created
DO $$
BEGIN
  RAISE NOTICE '✅ Governance AI database schema created successfully';
  RAISE NOTICE '   - 5 tables: ComplianceLog, JurisdictionRule, RiskAssessment, ProcessorConfig, ComplianceAlert';
  RAISE NOTICE '   - 15+ indexes for performance';
  RAISE NOTICE '   - 5 pre-populated jurisdiction rules (USA, CAN, GBR, EUR, GLOBAL)';
  RAISE NOTICE '   - 4 pre-populated processor configs (Stripe, Square, PayPal, Crypto)';
END $$;
