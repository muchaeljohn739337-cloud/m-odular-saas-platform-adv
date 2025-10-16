-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "interestRate" DECIMAL NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "monthlyPayment" DECIMAL NOT NULL,
    "remainingBalance" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "purpose" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "paidOffAt" DATETIME,
    "defaultedAt" DATETIME,
    "cancelledAt" DATETIME,
    "adminNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "loans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "loans_userId_idx" ON "loans"("userId");

-- CreateIndex
CREATE INDEX "loans_status_idx" ON "loans"("status");

-- CreateIndex
CREATE INDEX "loans_createdAt_idx" ON "loans"("createdAt");
