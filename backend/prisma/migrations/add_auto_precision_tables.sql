-- ════════════════════════════════════════════════════════════════
-- AUTO-PRECISION CORE DATABASE SCHEMA
-- ════════════════════════════════════════════════════════════════
-- Tables for:
-- - Job memory (vector storage)
-- - Job execution tracking
-- - Business rules engine
-- - Migration checkpoints
-- - Search index
-- ════════════════════════════════════════════════════════════════

-- ┌────────────────────────────────────────────────────────────────┐
-- │ 1. Job Memory (Vector Storage for Auto-Remember)               │
-- └────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS "JobMemory" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "job_hash" TEXT NOT NULL,
    "job_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "execution_result" JSONB,
    "execution_time_ms" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "error_message" TEXT,
    "feedback" JSONB,
    -- Vector embedding for similarity search (requires pgvector extension)
    -- "embedding" vector(1536),  -- Uncomment if using pgvector
    "metadata" JSONB,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "JobMemory_job_type_idx" ON "JobMemory"("job_type");
CREATE INDEX IF NOT EXISTS "JobMemory_job_hash_idx" ON "JobMemory"("job_hash");
CREATE INDEX IF NOT EXISTS "JobMemory_success_idx" ON "JobMemory"("success");
CREATE INDEX IF NOT EXISTS "JobMemory_created_at_idx" ON "JobMemory"("created_at" DESC);
-- CREATE INDEX IF NOT EXISTS "JobMemory_embedding_idx" ON "JobMemory" USING ivfflat ("embedding" vector_cosine_ops);  -- Uncomment if using pgvector


-- ┌────────────────────────────────────────────────────────────────┐
-- │ 2. Job Execution Tracking (Deduplication & Status)             │
-- └────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS "Job" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "job_hash" TEXT NOT NULL UNIQUE,
    "job_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, RUNNING, COMPLETED, FAILED, CANCELLED
    "result" JSONB,
    "error" TEXT,
    "execution_time_ms" INTEGER,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "completed_at" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Job_job_hash_idx" ON "Job"("job_hash");
CREATE INDEX IF NOT EXISTS "Job_job_type_idx" ON "Job"("job_type");
CREATE INDEX IF NOT EXISTS "Job_status_idx" ON "Job"("status");
CREATE INDEX IF NOT EXISTS "Job_created_at_idx" ON "Job"("created_at" DESC);


-- ┌────────────────────────────────────────────────────────────────┐
-- │ 3. Business Rules Engine (Auto-Precision Validation)           │
-- └────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS "BusinessRule" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "rule_name" TEXT NOT NULL UNIQUE,
    "job_type" TEXT NOT NULL,
    "condition" TEXT NOT NULL, -- JavaScript expression to evaluate
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    "error_message" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "BusinessRule_job_type_idx" ON "BusinessRule"("job_type");
CREATE INDEX IF NOT EXISTS "BusinessRule_enabled_idx" ON "BusinessRule"("enabled");
CREATE INDEX IF NOT EXISTS "BusinessRule_severity_idx" ON "BusinessRule"("severity");


-- ┌────────────────────────────────────────────────────────────────┐
-- │ 4. Migration Checkpoints (Auto-Migrate Safety)                 │
-- └────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS "MigrationCheckpoint" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "migration_type" TEXT NOT NULL, -- WORKFLOW, CONNECTOR, DATABASE
    "target_name" TEXT NOT NULL,
    "current_version" TEXT NOT NULL,
    "target_version" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, RUNNING, COMPLETED, FAILED, ROLLED_BACK
    "changes" JSONB NOT NULL,
    "error" TEXT,
    "rollback_data" JSONB,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "completed_at" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "MigrationCheckpoint_migration_type_idx" ON "MigrationCheckpoint"("migration_type");
CREATE INDEX IF NOT EXISTS "MigrationCheckpoint_target_name_idx" ON "MigrationCheckpoint"("target_name");
CREATE INDEX IF NOT EXISTS "MigrationCheckpoint_status_idx" ON "MigrationCheckpoint"("status");
CREATE INDEX IF NOT EXISTS "MigrationCheckpoint_created_at_idx" ON "MigrationCheckpoint"("created_at" DESC);


-- ┌────────────────────────────────────────────────────────────────┐
-- │ 5. Search Index (AI-Powered Search)                            │
-- └────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS "SearchIndex" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "source" TEXT NOT NULL, -- jobs, logs, audits, transactions, etc.
    "source_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    -- Vector embedding for semantic search
    -- "embedding" vector(1536),  -- Uncomment if using pgvector
    "relevance_score" DECIMAL(5,4),
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "SearchIndex_source_idx" ON "SearchIndex"("source");
CREATE INDEX IF NOT EXISTS "SearchIndex_source_id_idx" ON "SearchIndex"("source_id");
CREATE INDEX IF NOT EXISTS "SearchIndex_relevance_score_idx" ON "SearchIndex"("relevance_score" DESC);
-- CREATE INDEX IF NOT EXISTS "SearchIndex_embedding_idx" ON "SearchIndex" USING ivfflat ("embedding" vector_cosine_ops);  -- Uncomment if using pgvector

-- Full-text search index
CREATE INDEX IF NOT EXISTS "SearchIndex_content_fts_idx" ON "SearchIndex" USING gin(to_tsvector('english', "content"));


-- ┌────────────────────────────────────────────────────────────────┐
-- │ 6. Precision Calculations Log (Audit Trail for Numbers)        │
-- └────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS "PrecisionCalculation" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "calculation_type" TEXT NOT NULL, -- add, subtract, multiply, divide, percentage
    "inputs" JSONB NOT NULL,
    "result" TEXT NOT NULL, -- Store as string for exact precision
    "precision_decimals" INTEGER NOT NULL DEFAULT 8,
    "job_id" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "PrecisionCalculation_calculation_type_idx" ON "PrecisionCalculation"("calculation_type");
CREATE INDEX IF NOT EXISTS "PrecisionCalculation_job_id_idx" ON "PrecisionCalculation"("job_id");
CREATE INDEX IF NOT EXISTS "PrecisionCalculation_created_at_idx" ON "PrecisionCalculation"("created_at" DESC);


-- ┌────────────────────────────────────────────────────────────────┐
-- │ 7. Workflow Versions (Auto-Migrate Tracking)                   │
-- └────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS "WorkflowVersion" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "workflow_name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "definition" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "activated_at" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "WorkflowVersion_workflow_name_idx" ON "WorkflowVersion"("workflow_name");
CREATE INDEX IF NOT EXISTS "WorkflowVersion_version_idx" ON "WorkflowVersion"("version");
CREATE INDEX IF NOT EXISTS "WorkflowVersion_is_active_idx" ON "WorkflowVersion"("is_active");
CREATE UNIQUE INDEX IF NOT EXISTS "WorkflowVersion_workflow_name_version_unique" ON "WorkflowVersion"("workflow_name", "version");


-- ┌────────────────────────────────────────────────────────────────┐
-- │ 8. Pre-populate Business Rules                                 │
-- └────────────────────────────────────────────────────────────────┘

INSERT INTO "BusinessRule" ("rule_name", "job_type", "condition", "severity", "error_message", "enabled") VALUES
    ('payment_max_amount', 'PAYMENT_PROCESSING', 'payload.amount <= 100000', 'HIGH', 'Payment amount exceeds maximum allowed ($100,000)', true),
    ('payment_min_amount', 'PAYMENT_PROCESSING', 'payload.amount >= 0.01', 'HIGH', 'Payment amount must be at least $0.01', true),
    ('payment_positive_balance', 'PAYMENT_PROCESSING', 'payload.userBalance >= payload.amount', 'CRITICAL', 'Insufficient balance for payment', true),
    ('reward_valid_rate', 'REWARD_CALCULATION', 'payload.rewardRate >= 0 && payload.rewardRate <= 100', 'HIGH', 'Reward rate must be between 0% and 100%', true),
    ('reward_min_transaction', 'REWARD_CALCULATION', 'payload.transactionAmount >= 1', 'MEDIUM', 'Transaction amount must be at least $1 to earn rewards', true),
    ('fund_transfer_same_currency', 'FUND_TRANSFER', 'payload.fromCurrency === payload.toCurrency', 'HIGH', 'Cross-currency transfers not allowed', true),
    ('fund_transfer_positive_amount', 'FUND_TRANSFER', 'payload.amount > 0', 'CRITICAL', 'Transfer amount must be positive', true),
    ('fund_transfer_different_users', 'FUND_TRANSFER', 'payload.fromUserId !== payload.toUserId', 'CRITICAL', 'Cannot transfer funds to same user', true),
    ('crypto_min_amount', 'CRYPTO_TRANSFER', 'payload.amount >= 0.0001', 'HIGH', 'Crypto transfer must be at least 0.0001 units', true),
    ('balance_update_reasonable_adjustment', 'BALANCE_UPDATE', 'Math.abs(payload.adjustment) <= 1000000', 'CRITICAL', 'Balance adjustment exceeds reasonable limit', true)
ON CONFLICT ("rule_name") DO NOTHING;


-- ┌────────────────────────────────────────────────────────────────┐
-- │ 9. Indexes for Performance                                     │
-- └────────────────────────────────────────────────────────────────┘

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS "Job_status_created_at_idx" ON "Job"("status", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "JobMemory_job_type_success_idx" ON "JobMemory"("job_type", "success");
CREATE INDEX IF NOT EXISTS "BusinessRule_job_type_enabled_idx" ON "BusinessRule"("job_type", "enabled");


-- ┌────────────────────────────────────────────────────────────────┐
-- │ 10. Comments for Documentation                                 │
-- └────────────────────────────────────────────────────────────────┘

COMMENT ON TABLE "JobMemory" IS 'Vector storage for Auto-Remember: stores all job executions for future optimization';
COMMENT ON TABLE "Job" IS 'Job execution tracking with deduplication via job_hash';
COMMENT ON TABLE "BusinessRule" IS 'Auto-Precision validation rules for business logic enforcement';
COMMENT ON TABLE "MigrationCheckpoint" IS 'Auto-Migrate safety checkpoints with rollback support';
COMMENT ON TABLE "SearchIndex" IS 'AI-powered search index with vector embeddings';
COMMENT ON TABLE "PrecisionCalculation" IS 'Audit trail for all precision-safe numeric calculations';
COMMENT ON TABLE "WorkflowVersion" IS 'Workflow versioning for Auto-Migrate tracking';


-- ┌────────────────────────────────────────────────────────────────┐
-- │ 11. Optional: Enable pgvector extension (for vector search)    │
-- └────────────────────────────────────────────────────────────────┘

-- Uncomment the following to enable vector similarity search:
-- CREATE EXTENSION IF NOT EXISTS vector;


-- ════════════════════════════════════════════════════════════════
-- Migration Complete
-- ════════════════════════════════════════════════════════════════

SELECT '✅ Auto-Precision Core schema created successfully' AS status;
