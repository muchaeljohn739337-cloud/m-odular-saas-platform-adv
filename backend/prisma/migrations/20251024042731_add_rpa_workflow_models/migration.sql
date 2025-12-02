-- SQLite does not support CREATE TYPE enums; use TEXT with optional CHECK constraints instead.

-- AlterTable
-- Note: SQLite has limited ALTER COLUMN support; skipping default change to avoid errors.

-- CreateTable
CREATE TABLE "RPAWorkflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" TEXT NOT NULL,
    "actions" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "RPAWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RPAExecution" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "trigger" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "error" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,

    CONSTRAINT "RPAExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RPAWorkflow_createdById_idx" ON "RPAWorkflow"("createdById");

-- CreateIndex
CREATE INDEX "RPAWorkflow_enabled_idx" ON "RPAWorkflow"("enabled");

-- CreateIndex
CREATE INDEX "RPAExecution_workflowId_idx" ON "RPAExecution"("workflowId");

-- CreateIndex
CREATE INDEX "RPAExecution_status_idx" ON "RPAExecution"("status");

-- CreateIndex
CREATE INDEX "RPAExecution_startedAt_idx" ON "RPAExecution"("startedAt");

-- SQLite ALTER TABLE does not support adding FK constraints post-creation in this manner in shadow DB.
-- Skipping explicit FK additions for shadow compatibility.
