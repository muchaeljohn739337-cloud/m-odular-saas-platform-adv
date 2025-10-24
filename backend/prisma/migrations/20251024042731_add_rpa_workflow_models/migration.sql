-- CreateEnum
CREATE TYPE "RPAExecutionStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "push_subscriptions" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "RPAWorkflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "RPAWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RPAExecution" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "status" "RPAExecutionStatus" NOT NULL DEFAULT 'RUNNING',
    "trigger" JSONB NOT NULL,
    "steps" JSONB NOT NULL,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

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

-- AddForeignKey
ALTER TABLE "RPAWorkflow" ADD CONSTRAINT "RPAWorkflow_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RPAExecution" ADD CONSTRAINT "RPAExecution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "RPAWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
