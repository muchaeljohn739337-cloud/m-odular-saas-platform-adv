# Prisma Database Schema Documentation

Generated: 2025-12-01T12:33:09.404Z

## Models

### User

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| email | String | @unique |
| username | String | @unique |
| passwordHash | String | firstName         String? |
| lastName | String? | role              Role               @default(USER) |
| usdBalance | Decimal | @default(0) |
| active | Boolean | @default(true) |
| emailVerified | Boolean | @default(false) |
| emailVerifiedAt | DateTime? | lastLogin         DateTime? |
| termsAccepted | Boolean | @default(false) |
| termsAcceptedAt | DateTime? | totpSecret        String? |
| totpEnabled | Boolean | @default(false) |
| totpVerified | Boolean | @default(false) |
| backupCodes | String? | ethWalletAddress  String?            @unique |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |
| btcBalance | Decimal | @default(0) |
| ethBalance | Decimal | @default(0) |
| usdtBalance | Decimal | @default(0) |
| RPAWorkflow | RPAWorkflow | [] |
| cryptoWithdrawals | CryptoWithdrawal | [] |
| medBedsBookings | MedBedsBooking | [] |
| uploadedFiles | UploadedFile | [] |
| aiGenerations | AIGeneration | [] |
| aiUsageMetrics | AIUsageMetrics | [] |

### Transaction

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | amount      Decimal |
| type | String | description String? |
| category | String? | status      TransactionStatus @default(COMPLETED) |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |

### DebitCard

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | cardNumber     String     @unique |
| cardHolderName | String | expiryMonth    Int |
| expiryYear | Int | cvv            String |
| cardType | String | @default("virtual") |
| status | CardStatus | @default(ACTIVE) |
| balance | Decimal | @default(0) |
| dailyLimit | Decimal | @default(1000) |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |

### Session

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | token     String   @unique |
| expiresAt | DateTime | createdAt DateTime @default(now()) |

### BackupCode

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | code      String    @unique |
| isUsed | Boolean | @default(false) |
| usedAt | DateTime? | createdAt DateTime  @default(now()) |

### AuditLog

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String? | action         String |
| resourceType | String | resourceId     String |
| changes | Json? | previousValues Json? |
| newValues | Json? | metadata       Json? |
| ipAddress | String? | userAgent      String? |
| timestamp | DateTime | @default(now()) |
| createdAt | DateTime | @default(now()) |

### TokenWallet

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | @unique |
| balance | Decimal | @default(0) |
| tokenType | String | @default("ADVANCIA") |
| lockedBalance | Decimal | @default(0) |
| lifetimeEarned | Decimal | @default(0) |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |

### TokenTransaction

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| walletId | String | amount      Decimal |
| type | String | status      TransactionStatus @default(COMPLETED) |
| description | String? | toAddress   String? |
| fromAddress | String? | txHash      String? |
| metadata | String? | createdAt   DateTime          @default(now()) |

### Reward

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | type        String |
| amount | Decimal | status      RewardStatus @default(PENDING) |
| title | String | description String |
| metadata | String? | expiresAt   DateTime? |
| claimedAt | DateTime? | createdAt   DateTime     @default(now()) |

### UserTier

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | @unique |
| currentTier | String | @default("bronze") |
| points | Int | @default(0) |
| lifetimePoints | Int | @default(0) |
| lifetimeRewards | Decimal | @default(0) |
| streak | Int | @default(0) |
| longestStreak | Int | @default(0) |
| lastActiveDate | DateTime | @default(now()) |
| achievements | String? | badges          String? |
| referralCode | String? | @unique |
| referredBy | String? | totalReferrals  Int      @default(0) |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |

### HealthReading

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | heartRate        Int? |
| bloodPressureSys | Int? | bloodPressureDia Int? |
| steps | Int? | sleepHours       Decimal? |
| sleepQuality | String? | weight           Decimal? |
| temperature | Decimal? | oxygenLevel      Int? |
| stressLevel | String? | mood             String? |
| deviceId | String? | deviceType       String? |
| metadata | String? | notes            String? |
| recordedAt | DateTime | @default(now()) |
| createdAt | DateTime | @default(now()) |

### AdminSettings

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| btcAddress | String? | ethAddress           String? |
| usdtAddress | String? | ltcAddress           String? |
| otherAddresses | String? | exchangeRateBtc      Decimal? |
| exchangeRateEth | Decimal? | exchangeRateUsdt     Decimal? |
| processingFeePercent | Decimal | @default(2.5) |
| minPurchaseAmount | Decimal | @default(10) |
| debitCardPriceUSD | Decimal | @default(1000) |
| updatedAt | DateTime | @updatedAt |
| createdAt | DateTime | @default(now()) |

### CryptoOrder

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | cryptoType        String |
| usdAmount | Decimal | cryptoAmount      Decimal |
| exchangeRate | Decimal | processingFee     Decimal |
| totalUsd | Decimal | status            OrderStatus @default(PENDING) |
| adminAddress | String | txHash            String? |
| adminNotes | String? | userWalletAddress String? |
| stripeSessionId | String? | completedAt       DateTime? |
| cancelledAt | DateTime? | createdAt         DateTime    @default(now()) |
| updatedAt | DateTime | @updatedAt |

### CryptoWithdrawal

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | cryptoType        String |
| cryptoAmount | Decimal | usdEquivalent     Decimal |
| withdrawalAddress | String | status            WithdrawalStatus @default(PENDING) |
| adminApprovedBy | String? | adminNotes        String? |
| txHash | String? | networkFee        Decimal? |
| approvedAt | DateTime? | rejectedAt        DateTime? |
| completedAt | DateTime? | cancelledAt       DateTime? |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |
| user | User | @relation(fields: [userId], references: [id], onDelete: Cascade) |

### EthActivity

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String? | address           String |
| addressNormalized | String | type              EthActivityType |
| txHash | String? | @unique |
| amountEth | Decimal | status            String |
| confirmations | Int | @default(0) |
| blockNumber | Int? | note              String? |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |

### AdminPortfolio

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| currency | Currency | @unique |
| balance | Decimal | @default(0) |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |

### AdminTransfer

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| adminId | String? | userId    String? |
| currency | Currency | amount    Decimal |
| note | String? | source    String? |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |

### Loan

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | amount           Decimal |
| interestRate | Decimal | termMonths       Int |
| monthlyPayment | Decimal | remainingBalance Decimal |
| status | String | @default("pending") |
| purpose | String | startDate        DateTime  @default(now()) |
| dueDate | DateTime | approvedBy       String? |
| approvedAt | DateTime? | paidOffAt        DateTime? |
| defaultedAt | DateTime? | cancelledAt      DateTime? |
| adminNotes | String? | createdAt        DateTime  @default(now()) |
| updatedAt | DateTime | @updatedAt |

### SystemStatus

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| serviceName | String | status        String |
| responseTime | Int? | uptime        Decimal? |
| lastChecked | DateTime | @default(now()) |
| statusMessage | String? | alertLevel    String   @default("none") |
| metadata | String? | createdAt     DateTime @default(now()) |
| updatedAt | DateTime | @updatedAt |

### SystemAlert

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| alertType | String | severity    String |
| title | String | description String |
| serviceName | String? | isResolved  Boolean   @default(false) |
| resolvedAt | DateTime? | resolvedBy  String? |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |

### Notification

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(cuid()) |
| userId | String | type        String |
| priority | String | @default("normal") |
| category | String | title       String |
| message | String | data        Json? |
| isRead | Boolean | @default(false) |
| readAt | DateTime? | emailSent   Boolean   @default(false) |
| emailSentAt | DateTime? | smsSent     Boolean   @default(false) |
| smsSentAt | DateTime? | pushSent    Boolean   @default(false) |
| pushSentAt | DateTime? | createdAt   DateTime  @default(now()) |
| updatedAt | DateTime | @updatedAt |

### PushSubscription

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(cuid()) |
| userId | String | endpoint   String |
| p256dh | String | auth       String |
| deviceInfo | Json? | isActive   Boolean  @default(true) |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @default(now()) @updatedAt |

### NotificationPreference

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(cuid()) |
| userId | String | @unique |
| emailEnabled | Boolean | @default(true) |
| smsEnabled | Boolean | @default(false) |
| inAppEnabled | Boolean | @default(true) |
| pushEnabled | Boolean | @default(true) |
| transactionAlerts | Boolean | @default(true) |
| securityAlerts | Boolean | @default(true) |
| systemAlerts | Boolean | @default(true) |
| rewardAlerts | Boolean | @default(true) |
| adminAlerts | Boolean | @default(true) |
| promotionalEmails | Boolean | @default(false) |
| enableDigest | Boolean | @default(false) |
| digestFrequency | String | @default("daily") |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |

### NotificationLog

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(cuid()) |
| notificationId | String | channel        String |
| status | String | errorMessage   String? |
| sentAt | DateTime | @default(now()) |
| deliveredAt | DateTime? | metadata       Json? |

### SupportTicket

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | subject    String |
| message | String | category   String    @default("GENERAL") |
| status | String | @default("OPEN") |
| priority | String | @default("MEDIUM") |
| response | String? | resolvedBy String? |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |
| resolvedAt | DateTime? | @@index([userId]) |

### ActivityLog

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String? | action    String |
| ipAddress | String | userAgent String |
| metadata | Json? | createdAt DateTime @default(now()) |

### ChatSession

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String? | status          String   @default("open") |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |
| assignedAdminId | String? | @@map("chat_sessions") |

### ChatMessage

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| sessionId | String | senderType String |
| senderId | String? | content    String |
| metadata | Json? | createdAt  DateTime @default(now()) |

### Doctor

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| email | String | passwordHash   String |
| firstName | String | lastName       String |
| specialization | String | licenseNumber  String |
| phoneNumber | String? | status         DoctorStatus @default(PENDING) |
| verifiedAt | DateTime? | verifiedBy     String? |
| inviteCode | String | createdAt      DateTime     @default(now()) |
| updatedAt | DateTime | @updatedAt |

### Consultation

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| patientId | String | doctorId     String |
| status | ConsultationStatus | @default(SCHEDULED) |
| scheduledAt | DateTime? | startedAt    DateTime? |
| completedAt | DateTime? | symptoms     String? |
| diagnosis | String? | prescription String? |
| notes | String? | videoRoomId  String? |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |

### ConsultationMessage

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| consultationId | String | senderType     String |
| senderId | String | content        String |
| attachmentUrl | String? | createdAt      DateTime @default(now()) |

### AdminLoginLog

| Field | Type | Attributes |
|-------|------|------------|
| id | Int | @id @default(autoincrement()) |
| email | String | phone     String? |
| status | String | ipAddress String? |
| userAgent | String? | createdAt DateTime @default(now()) |

### IpBlock

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| ip | String | @unique |
| reason | String? | until     DateTime? |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |

### MedBedsBooking

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | chamberType     String |
| chamberName | String | sessionDate     DateTime |
| duration | Int | cost            Decimal |
| paymentMethod | String | paymentStatus   String   @default("pending") |
| transactionId | String? | stripeSessionId String? |
| status | String | @default("scheduled") |
| effectiveness | Int? | notes           String? |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |
| user | User | @relation(fields: [userId], references: [id], onDelete: Cascade) |

### OAL

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(cuid()) |
| object | String | action      String |
| location | String | subjectId   String? |
| metadata | Json? | status      OALStatus @default(PENDING) |
| createdById | String | updatedById String? |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |

### RPAExecution

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id |
| workflowId | String | status      RPAExecutionStatus @default(RUNNING) |
| trigger | Json | steps       Json |
| error | String? | startedAt   DateTime           @default(now()) |
| completedAt | DateTime? | RPAWorkflow RPAWorkflow        @relation(fields: [workflowId], references: [id], onDelete: Cascade) |

### RPAWorkflow

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id |
| name | String | description  String? |
| trigger | Json | actions      Json |
| enabled | Boolean | @default(true) |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | createdById  String |
| RPAExecution | RPAExecution | [] |
| users | User | @relation(fields: [createdById], references: [id]) |

### SystemConfig

| Field | Type | Attributes |
|-------|------|------------|
| id | Int | @id @default(autoincrement()) |
| key | String | @unique |
| value | String | updatedAt DateTime @updatedAt |
| createdAt | DateTime | @default(now()) |

### UploadedFile

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | user        User     @relation(fields: [userId], references: [id]) |
| category | String | @default("documents") |
| filename | String | key         String   @unique |
| url | String? | size        Int |
| contentType | String | metadata    Json? |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |

### ClickEvent

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String? | eventName  String |
| ipAddress | String | userAgent  String |
| isRobot | Boolean | @default(false) |
| confidence | Decimal? | metadata   Json? |
| createdAt | DateTime | @default(now()) |

### BotDetection

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String? | ipAddress  String |
| userAgent | String | isBot      Boolean |
| confidence | Decimal | riskScore  Decimal   @default(0) |
| signals | Json? | action     String? |
| reviewedBy | String? | reviewedAt DateTime? |
| createdAt | DateTime | @default(now()) |

### FraudScore

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | transactionId String? |
| score | Decimal | factors       Json? |
| status | String | @default("pending") |
| reviewedBy | String? | reviewedAt    DateTime? |
| createdAt | DateTime | @default(now()) |

### AITrainingData

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String? | ipAddress  String |
| userAgent | String | features   Json |
| label | Boolean | verifiedBy String? |
| verifiedAt | DateTime? | createdAt  DateTime  @default(now()) |

### AIModel

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| name | String | version         String |
| modelType | String | accuracy        Decimal? |
| precision | Decimal? | recall          Decimal? |
| f1Score | Decimal? | trainingSamples Int       @default(0) |
| modelPath | String? | isActive        Boolean   @default(false) |
| trainedBy | String? | trainedAt       DateTime? |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |

### ComplianceLog

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| jurisdiction | String | eventType        String   @map("event_type") |
| userId | String? | @map("user_id") |
| paymentId | String? | @map("payment_id") |
| payload | Json | complianceResult Json     @map("compliance_result") |
| processor | String? | riskScore        Decimal? @map("risk_score") |
| violations | Json? | autoCorrected    Boolean  @default(false) @map("auto_corrected") |
| timestamp | DateTime | @default(now()) |
| createdAt | DateTime | @default(now()) @map("created_at") |

### JurisdictionRule

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| jurisdiction | String | @unique |
| regulators | String | requirements        Json |
| allowedProcessors | String | @map("allowed_processors") |
| restrictedCountries | String | @map("restricted_countries") |
| complianceLevel | String | @map("compliance_level") |
| enabled | Boolean | @default(true) |
| lastUpdated | DateTime | @default(now()) @map("last_updated") |
| createdAt | DateTime | @default(now()) @map("created_at") |

### RiskAssessment

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | @map("user_id") |
| transactionId | String? | @map("transaction_id") |
| riskScore | Decimal | @map("risk_score") |
| riskLevel | String | @map("risk_level") |
| riskFactors | Json | @map("risk_factors") |
| assessmentReason | String? | @map("assessment_reason") |
| adaptivePolicyApplied | Boolean | @default(false) @map("adaptive_policy_applied") |
| assessedAt | DateTime | @default(now()) @map("assessed_at") |
| expiresAt | DateTime? | @map("expires_at") |
| createdAt | DateTime | @default(now()) @map("created_at") |

### ProcessorConfig

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| processorId | String | @unique @map("processor_id") |
| processorName | String | @map("processor_name") |
| jurisdictions | String | features           String |
| fees | Json | settlementTimeDays Int       @map("settlement_time_days") |
| maxAmount | Decimal | @map("max_amount") |
| rating | Decimal | @default(0.80) |
| enabled | Boolean | @default(true) |
| apiCredentials | Json? | @map("api_credentials") |
| lastHealthCheck | DateTime? | @map("last_health_check") |
| createdAt | DateTime | @default(now()) @map("created_at") |
| updatedAt | DateTime | @default(now()) @updatedAt @map("updated_at") |

### ComplianceAlert

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| alertType | String | @map("alert_type") |
| severity | String | userId          String?   @map("user_id") |
| transactionId | String? | @map("transaction_id") |
| description | String | details         Json? |
| status | String | @default("OPEN") |
| assignedTo | String? | @map("assigned_to") |
| resolutionNotes | String? | @map("resolution_notes") |
| createdAt | DateTime | @default(now()) @map("created_at") |
| resolvedAt | DateTime? | @map("resolved_at") |

### BlockchainVerification

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| manifestHash | String | @map("manifest_hash") |
| version | String | txHash       String?   @unique @map("tx_hash") |
| recordId | Int? | @map("record_id") |
| status | String | @default("PENDING") @map("status") |
| blockchain | String | @default("polygon") |
| confirmedAt | DateTime? | @map("confirmed_at") |
| createdAt | DateTime | @default(now()) @map("created_at") |

### UserPreference

| Field | Type | Attributes |
|-------|------|------------|
| userId | String | @unique @map("user_id") |
| dashboardLayout | Json? | @map("dashboard_layout") |
| features | Json? | suggestions     Json? |
| interactionLog | Json? | @map("interaction_log") |
| updatedAt | DateTime | @updatedAt @map("updated_at") |
| createdAt | DateTime | @default(now()) @map("created_at") |

### AISuggestion

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | @map("user_id") |
| type | String | // FEATURE, WORKFLOW, OPTIMIZATION |
| content | String | accepted    Boolean   @default(false) |
| dismissedAt | DateTime? | @map("dismissed_at") |
| createdAt | DateTime | @default(now()) @map("created_at") |

### MarketIntelligence

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| source | String | // COINGECKO, NEWS, TWITTER, REDDIT |
| category | String | // PRICE, SENTIMENT, NEWS, TREND |
| data | Json | sentiment  String? // POSITIVE, NEGATIVE, NEUTRAL |
| importance | Int | @default(5) // 1-10 |
| createdAt | DateTime | @default(now()) @map("created_at") |

### CrisisEvent

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| type | String | // PRICE_CRASH, FUD_SPIKE, HACK_ALERT, VOLATILITY |
| severity | Int | // 1-10 |
| description | String | indicators  Json // What triggered it |
| actions | Json? | // Recommended actions |
| resolvedAt | DateTime? | @map("resolved_at") |
| createdAt | DateTime | @default(now()) @map("created_at") |

### ScamAddress

| Field | Type | Attributes |
|-------|------|------------|
| address | String | @id |
| blockchain | String | // ETH, BTC, POLYGON, ARBITRUM |
| category | String | // PHISHING, PONZI, MIXER, FRAUD |
| severity | Int | // 1-10 |
| source | String | // Database source (EtherScamDB, ChainAbuse) |
| reportedAt | DateTime | @map("reported_at") |
| createdAt | DateTime | @default(now()) @map("created_at") |

### SecurityPatch

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| type | String | // DEPENDENCY, CODE, CONFIG |
| vulnerability | String | fix           String |
| status | String | @default("PENDING") // PENDING, APPLIED, FAILED |
| appliedBy | String? | @map("applied_by") // Agent or admin |
| appliedAt | DateTime? | @map("applied_at") |
| createdAt | DateTime | @default(now()) @map("created_at") |

### VaultSecret

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| key | String | @unique |
| encryptedValue | String | @map("encrypted_value") // AES-256-CBC encrypted |
| iv | String | // Initialization vector for encryption |
| version | Int | @default(1) // Version tracking for rotations |
| metadata | Json? | // Additional metadata |
| rotationPolicy | Json? | // { enabled: boolean, intervalDays: number |

### AppRole

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| name | String | @unique |
| token | String | @unique // Authentication token for agents |
| policies | Json | // Array of allowed secret keys |
| expiresAt | DateTime | @map("expires_at") |
| createdBy | String | @map("created_by") // Admin user ID |
| createdAt | DateTime | @default(now()) @map("created_at") |

### VaultAuditLog

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | @map("user_id") |
| action | String | // CREATE_SECRET, GET_SECRET, DELETE_SECRET, ROTATE_SECRET, CREATE_APPROLE, MFA_SETUP, etc. |
| secretKey | String | @map("secret_key") |
| timestamp | DateTime | @default(now()) |
| ipAddress | String? | @map("ip_address") |
| userAgent | String? | @map("user_agent") |
| success | Boolean | @default(true) |
| errorMessage | String? | @map("error_message") |
| mfaVerified | Boolean | @default(false) @map("mfa_verified") |

### CopilotTask

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| type | String | // code_generation, deployment, bug_fix, optimization, documentation |
| description | String | context     Json? // Additional context data |
| status | String | @default("pending") // pending, running, completed, failed |
| result | Json? | // Generated output |
| error | String? | // Error message if failed |
| createdAt | DateTime | @default(now()) |
| completedAt | DateTime? | feedback    CopilotFeedback[] |

### CopilotInteraction

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | sessionId String |
| message | String | response  String |
| timestamp | DateTime | @default(now()) |

### CopilotFeedback

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| taskId | String | userId    String |
| rating | Int | // 1-5 stars |
| comment | String? | timestamp DateTime     @default(now()) |
| task | CopilotTask | @relation(fields: [taskId], references: [id], onDelete: Cascade) |

### CodebaseIndex

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| filePath | String | @unique |
| content | String | embedding   String? // JSON array of floats |
| lastIndexed | DateTime | @default(now()) |

### AIGeneration

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | user           User      @relation(fields: [userId], references: [id], onDelete: Cascade) |
| type | String | // "text", "code", "image" |
| model | String | prompt         String |
| output | String? | imageUrl       String? |
| metadata | String? | // JSON string |
| status | String | @default("pending") // "pending", "completed", "failed" |
| error | String? | createdAt      DateTime  @default(now()) |
| lastRotated | DateTime? | @@index([userId]) |

### AIUsageMetrics

| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(uuid()) |
| userId | String | user              User     @relation(fields: [userId], references: [id], onDelete: Cascade) |
| date | DateTime | @default(now()) |
| textGenerations | Int | @default(0) |
| codeGenerations | Int | @default(0) |
| imageGenerations | Int | @default(0) |
| tokensUsed | Int | @default(0) |
| costUSD | Decimal | @default(0) |

