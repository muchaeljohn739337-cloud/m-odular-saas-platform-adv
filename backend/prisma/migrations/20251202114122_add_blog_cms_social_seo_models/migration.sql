-- AlterTable
ALTER TABLE "users" ADD COLUMN "blockedAt" DATETIME;
ALTER TABLE "users" ADD COLUMN "blockedBy" TEXT;
ALTER TABLE "users" ADD COLUMN "blockedReason" TEXT;
ALTER TABLE "users" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "users" ADD COLUMN "deletedBy" TEXT;

-- CreateTable
CREATE TABLE "ai_workflows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "cronSchedule" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "riskLevel" TEXT NOT NULL DEFAULT 'medium',
    "aiModel" TEXT NOT NULL DEFAULT 'gpt-4',
    "config" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ai_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflowId" TEXT NOT NULL,
    "executionId" TEXT,
    "taskType" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "input" TEXT NOT NULL,
    "aiSuggestion" TEXT,
    "aiReasoning" TEXT,
    "aiConfidence" DECIMAL DEFAULT 0,
    "output" TEXT,
    "error" TEXT,
    "executionTimeMs" INTEGER,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "approvalStatus" TEXT,
    "humanFeedback" TEXT,
    "humanModification" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "scheduledFor" DATETIME,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ai_tasks_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "ai_workflows" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ai_tasks_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "ai_workflow_executions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_workflow_executions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflowId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "triggeredBy" TEXT NOT NULL,
    "triggerData" TEXT,
    "tasksTotal" INTEGER NOT NULL DEFAULT 0,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "tasksFailed" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "duration" INTEGER,
    "error" TEXT,
    CONSTRAINT "ai_workflow_executions_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "ai_workflows" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_learning" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "aiSuggestion" TEXT NOT NULL,
    "humanDecision" TEXT NOT NULL,
    "humanModification" TEXT,
    "feedback" TEXT,
    "wasCorrect" BOOLEAN,
    "outcomeNotes" TEXT,
    "context" TEXT NOT NULL,
    "patterns" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ai_monitoring_alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "detectedBy" TEXT NOT NULL DEFAULT 'ai_monitor',
    "aiAnalysis" TEXT,
    "aiSuggestion" TEXT,
    "aiConfidence" DECIMAL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'open',
    "assignedTo" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" DATETIME,
    "resolution" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ai_monitoring_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "threshold" REAL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastCheck" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ai_alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ruleId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ai_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'markdown',
    "generatedBy" TEXT NOT NULL DEFAULT 'ai_core',
    "aiModel" TEXT NOT NULL DEFAULT 'gpt-4',
    "dataFrom" DATETIME NOT NULL,
    "dataTo" DATETIME NOT NULL,
    "dataSources" TEXT NOT NULL,
    "insights" TEXT,
    "recommendations" TEXT,
    "status" TEXT NOT NULL DEFAULT 'generated',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "publishedAt" DATETIME,
    "recipients" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ai_system_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "pricing_plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "priceMonthly" DECIMAL NOT NULL DEFAULT 0,
    "priceYearly" DECIMAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stripePriceIdMonthly" TEXT,
    "stripePriceIdYearly" TEXT,
    "stripeProductId" TEXT,
    "aiRequestsPerDay" INTEGER NOT NULL DEFAULT 50,
    "aiRequestsPerMonth" INTEGER NOT NULL DEFAULT 1500,
    "storageGb" INTEGER NOT NULL DEFAULT 1,
    "maxTeamMembers" INTEGER NOT NULL DEFAULT 1,
    "features" TEXT NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "badge" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentPeriodStart" DATETIME NOT NULL,
    "currentPeriodEnd" DATETIME NOT NULL,
    "trialStart" DATETIME,
    "trialEnd" DATETIME,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "cancelledAt" DATETIME,
    "cancellationReason" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "pricing_plans" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountDue" DECIMAL NOT NULL,
    "amountPaid" DECIMAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "stripeInvoiceId" TEXT,
    "stripePaymentIntentId" TEXT,
    "hostedInvoiceUrl" TEXT,
    "invoicePdfUrl" TEXT,
    "dueDate" DATETIME,
    "paidAt" DATETIME,
    "lineItems" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "usage_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL,
    "totalPrice" DECIMAL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "billed" BOOLEAN NOT NULL DEFAULT false,
    "billedAt" DATETIME,
    "invoiceId" TEXT,
    "stripeUsageRecordId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "usage_records_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_usage_quotas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "aiRequestsToday" INTEGER NOT NULL DEFAULT 0,
    "aiRequestsThisMonth" INTEGER NOT NULL DEFAULT 0,
    "dailyLimit" INTEGER NOT NULL DEFAULT 50,
    "monthlyLimit" INTEGER NOT NULL DEFAULT 1500,
    "lastDailyReset" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMonthlyReset" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overageAllowed" BOOLEAN NOT NULL DEFAULT false,
    "overageRate" DECIMAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "blog_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "blog_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "blog_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "contentMarkdown" TEXT NOT NULL,
    "contentHtml" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "tags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "scheduledFor" DATETIME,
    "archivedAt" DATETIME,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "canonicalUrl" TEXT,
    "structuredData" TEXT,
    "readTimeMinutes" INTEGER,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiModel" TEXT,
    "aiPrompt" TEXT,
    "aiJobId" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "blog_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "blog_posts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "blog_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "blog_media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "altText" TEXT,
    "caption" TEXT,
    "s3Key" TEXT,
    "cdnUrl" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiPrompt" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "blog_media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "blog_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "blog_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "blog_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "blog_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "blog_comments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "seo_audits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT,
    "url" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "technicalScore" INTEGER NOT NULL,
    "contentScore" INTEGER NOT NULL,
    "mobileFriendly" BOOLEAN NOT NULL,
    "pageSpeed" INTEGER,
    "missingMetaTags" TEXT,
    "brokenLinks" TEXT,
    "missingAltText" TEXT,
    "keywordIssues" TEXT,
    "suggestions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "sitemaps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "urls" TEXT NOT NULL,
    "totalUrls" INTEGER NOT NULL,
    "generated" BOOLEAN NOT NULL DEFAULT false,
    "generatedAt" DATETIME,
    "submitted" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "social_media_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "vaultKeyAccess" TEXT NOT NULL,
    "vaultKeyRefresh" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "profileImageUrl" TEXT,
    "followerCount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "social_media_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blogPostId" TEXT,
    "accountId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT,
    "hashtags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduledFor" DATETIME,
    "postedAt" DATETIME,
    "platformPostId" TEXT,
    "platformUrl" TEXT,
    "errorMessage" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "lastSyncedAt" DATETIME,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiModel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "social_media_posts_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "blog_posts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "social_media_posts_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "social_media_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_workflows_name_key" ON "ai_workflows"("name");

-- CreateIndex
CREATE INDEX "ai_workflows_category_idx" ON "ai_workflows"("category");

-- CreateIndex
CREATE INDEX "ai_workflows_enabled_idx" ON "ai_workflows"("enabled");

-- CreateIndex
CREATE INDEX "ai_workflows_triggerType_idx" ON "ai_workflows"("triggerType");

-- CreateIndex
CREATE INDEX "ai_tasks_workflowId_idx" ON "ai_tasks"("workflowId");

-- CreateIndex
CREATE INDEX "ai_tasks_executionId_idx" ON "ai_tasks"("executionId");

-- CreateIndex
CREATE INDEX "ai_tasks_status_idx" ON "ai_tasks"("status");

-- CreateIndex
CREATE INDEX "ai_tasks_priority_idx" ON "ai_tasks"("priority");

-- CreateIndex
CREATE INDEX "ai_tasks_taskType_idx" ON "ai_tasks"("taskType");

-- CreateIndex
CREATE INDEX "ai_tasks_scheduledFor_idx" ON "ai_tasks"("scheduledFor");

-- CreateIndex
CREATE INDEX "ai_workflow_executions_workflowId_idx" ON "ai_workflow_executions"("workflowId");

-- CreateIndex
CREATE INDEX "ai_workflow_executions_status_idx" ON "ai_workflow_executions"("status");

-- CreateIndex
CREATE INDEX "ai_workflow_executions_startedAt_idx" ON "ai_workflow_executions"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_learning_taskId_key" ON "ai_learning"("taskId");

-- CreateIndex
CREATE INDEX "ai_learning_taskType_idx" ON "ai_learning"("taskType");

-- CreateIndex
CREATE INDEX "ai_learning_humanDecision_idx" ON "ai_learning"("humanDecision");

-- CreateIndex
CREATE INDEX "ai_learning_wasCorrect_idx" ON "ai_learning"("wasCorrect");

-- CreateIndex
CREATE INDEX "ai_learning_createdAt_idx" ON "ai_learning"("createdAt");

-- CreateIndex
CREATE INDEX "ai_monitoring_alerts_alertType_idx" ON "ai_monitoring_alerts"("alertType");

-- CreateIndex
CREATE INDEX "ai_monitoring_alerts_severity_idx" ON "ai_monitoring_alerts"("severity");

-- CreateIndex
CREATE INDEX "ai_monitoring_alerts_status_idx" ON "ai_monitoring_alerts"("status");

-- CreateIndex
CREATE INDEX "ai_monitoring_alerts_createdAt_idx" ON "ai_monitoring_alerts"("createdAt");

-- CreateIndex
CREATE INDEX "ai_monitoring_rules_type_idx" ON "ai_monitoring_rules"("type");

-- CreateIndex
CREATE INDEX "ai_monitoring_rules_enabled_idx" ON "ai_monitoring_rules"("enabled");

-- CreateIndex
CREATE INDEX "ai_alerts_ruleId_idx" ON "ai_alerts"("ruleId");

-- CreateIndex
CREATE INDEX "ai_alerts_status_idx" ON "ai_alerts"("status");

-- CreateIndex
CREATE INDEX "ai_alerts_severity_idx" ON "ai_alerts"("severity");

-- CreateIndex
CREATE INDEX "ai_reports_reportType_idx" ON "ai_reports"("reportType");

-- CreateIndex
CREATE INDEX "ai_reports_category_idx" ON "ai_reports"("category");

-- CreateIndex
CREATE INDEX "ai_reports_status_idx" ON "ai_reports"("status");

-- CreateIndex
CREATE INDEX "ai_reports_createdAt_idx" ON "ai_reports"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_system_config_key_key" ON "ai_system_config"("key");

-- CreateIndex
CREATE INDEX "ai_system_config_category_idx" ON "ai_system_config"("category");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_plans_name_key" ON "pricing_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_plans_slug_key" ON "pricing_plans"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_plans_stripePriceIdMonthly_key" ON "pricing_plans"("stripePriceIdMonthly");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_plans_stripePriceIdYearly_key" ON "pricing_plans"("stripePriceIdYearly");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_plans_stripeProductId_key" ON "pricing_plans"("stripeProductId");

-- CreateIndex
CREATE INDEX "pricing_plans_isActive_idx" ON "pricing_plans"("isActive");

-- CreateIndex
CREATE INDEX "pricing_plans_displayOrder_idx" ON "pricing_plans"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_planId_idx" ON "subscriptions"("planId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_stripeSubscriptionId_idx" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_status_key" ON "subscriptions"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_stripeInvoiceId_key" ON "invoices"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "invoices_subscriptionId_idx" ON "invoices"("subscriptionId");

-- CreateIndex
CREATE INDEX "invoices_userId_idx" ON "invoices"("userId");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_stripeInvoiceId_idx" ON "invoices"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "usage_records_subscriptionId_idx" ON "usage_records"("subscriptionId");

-- CreateIndex
CREATE INDEX "usage_records_userId_idx" ON "usage_records"("userId");

-- CreateIndex
CREATE INDEX "usage_records_resourceType_idx" ON "usage_records"("resourceType");

-- CreateIndex
CREATE INDEX "usage_records_periodStart_periodEnd_idx" ON "usage_records"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "usage_records_billed_idx" ON "usage_records"("billed");

-- CreateIndex
CREATE UNIQUE INDEX "ai_usage_quotas_userId_key" ON "ai_usage_quotas"("userId");

-- CreateIndex
CREATE INDEX "ai_usage_quotas_userId_idx" ON "ai_usage_quotas"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_name_key" ON "blog_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_slug_key" ON "blog_categories"("slug");

-- CreateIndex
CREATE INDEX "blog_categories_slug_idx" ON "blog_categories"("slug");

-- CreateIndex
CREATE INDEX "blog_categories_parentId_idx" ON "blog_categories"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_slug_idx" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_authorId_idx" ON "blog_posts"("authorId");

-- CreateIndex
CREATE INDEX "blog_posts_categoryId_idx" ON "blog_posts"("categoryId");

-- CreateIndex
CREATE INDEX "blog_posts_status_idx" ON "blog_posts"("status");

-- CreateIndex
CREATE INDEX "blog_posts_publishedAt_idx" ON "blog_posts"("publishedAt");

-- CreateIndex
CREATE INDEX "blog_posts_featured_idx" ON "blog_posts"("featured");

-- CreateIndex
CREATE INDEX "blog_media_postId_idx" ON "blog_media"("postId");

-- CreateIndex
CREATE INDEX "blog_media_type_idx" ON "blog_media"("type");

-- CreateIndex
CREATE INDEX "blog_comments_postId_idx" ON "blog_comments"("postId");

-- CreateIndex
CREATE INDEX "blog_comments_authorId_idx" ON "blog_comments"("authorId");

-- CreateIndex
CREATE INDEX "blog_comments_status_idx" ON "blog_comments"("status");

-- CreateIndex
CREATE INDEX "blog_comments_createdAt_idx" ON "blog_comments"("createdAt");

-- CreateIndex
CREATE INDEX "seo_audits_postId_idx" ON "seo_audits"("postId");

-- CreateIndex
CREATE INDEX "seo_audits_status_idx" ON "seo_audits"("status");

-- CreateIndex
CREATE INDEX "seo_audits_createdAt_idx" ON "seo_audits"("createdAt");

-- CreateIndex
CREATE INDEX "social_media_accounts_userId_idx" ON "social_media_accounts"("userId");

-- CreateIndex
CREATE INDEX "social_media_accounts_platform_idx" ON "social_media_accounts"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "social_media_accounts_userId_platform_accountId_key" ON "social_media_accounts"("userId", "platform", "accountId");

-- CreateIndex
CREATE INDEX "social_media_posts_accountId_idx" ON "social_media_posts"("accountId");

-- CreateIndex
CREATE INDEX "social_media_posts_blogPostId_idx" ON "social_media_posts"("blogPostId");

-- CreateIndex
CREATE INDEX "social_media_posts_status_idx" ON "social_media_posts"("status");

-- CreateIndex
CREATE INDEX "social_media_posts_scheduledFor_idx" ON "social_media_posts"("scheduledFor");

-- CreateIndex
CREATE INDEX "social_media_posts_postedAt_idx" ON "social_media_posts"("postedAt");
