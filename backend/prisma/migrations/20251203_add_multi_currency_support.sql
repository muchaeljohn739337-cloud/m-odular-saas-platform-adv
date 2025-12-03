-- Multi-Currency Support Migration
-- Adds support for USD, EUR, GBP, CAD with bank compliance tracking

-- Currency rates table for real-time exchange rates
CREATE TABLE IF NOT EXISTS currency_rates (
    id TEXT PRIMARY KEY,
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    rate REAL NOT NULL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    source TEXT DEFAULT 'manual',
    UNIQUE(from_currency, to_currency)
);

-- User balances in multiple currencies
CREATE TABLE IF NOT EXISTS user_balances (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    currency TEXT NOT NULL,
    balance REAL DEFAULT 0.0,
    locked_balance REAL DEFAULT 0.0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, currency)
);

-- Currency conversion audit trail
CREATE TABLE IF NOT EXISTS currency_conversions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    from_amount REAL NOT NULL,
    to_amount REAL NOT NULL,
    exchange_rate REAL NOT NULL,
    fee REAL DEFAULT 0.0,
    status TEXT DEFAULT 'completed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Crypto purchase transactions with compliance tracking
CREATE TABLE IF NOT EXISTS crypto_purchases (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    crypto_type TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL,
    fiat_amount REAL NOT NULL,
    exchange_rate REAL NOT NULL,
    status TEXT DEFAULT 'pending_compliance',
    compliance_check_passed BOOLEAN DEFAULT 0,
    requires_kyc BOOLEAN DEFAULT 0,
    requires_manual_approval BOOLEAN DEFAULT 0,
    risk_level TEXT DEFAULT 'LOW',
    wire_reference TEXT,
    wire_verified BOOLEAN DEFAULT 0,
    wire_verified_at DATETIME,
    wire_verified_by TEXT,
    admin_approved BOOLEAN DEFAULT 0,
    admin_approved_at DATETIME,
    admin_approved_by TEXT,
    completed_at DATETIME,
    failure_reason TEXT,
    compliance_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Compliance audit logs for regulatory reporting
CREATE TABLE IF NOT EXISTS compliance_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    transaction_id TEXT,
    event_type TEXT NOT NULL,
    currency TEXT,
    amount REAL,
    risk_level TEXT,
    requires_reporting BOOLEAN DEFAULT 0,
    reporting_threshold_type TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add currency fields to users table
ALTER TABLE users ADD COLUMN preferred_currency TEXT DEFAULT 'USD';
ALTER TABLE users ADD COLUMN country TEXT;
ALTER TABLE users ADD COLUMN detected_currency TEXT;
ALTER TABLE users ADD COLUMN kyc_verified BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN kyc_level TEXT DEFAULT 'none';
ALTER TABLE users ADD COLUMN annual_transaction_volume REAL DEFAULT 0.0;
ALTER TABLE users ADD COLUMN last_transaction_date DATETIME;

-- Insert default exchange rates (to be updated via API)
INSERT OR IGNORE INTO currency_rates (id, from_currency, to_currency, rate, source) VALUES
    ('usd-eur', 'USD', 'EUR', 0.92, 'manual'),
    ('usd-gbp', 'USD', 'GBP', 0.79, 'manual'),
    ('usd-cad', 'USD', 'CAD', 1.36, 'manual'),
    ('eur-usd', 'EUR', 'USD', 1.09, 'manual'),
    ('gbp-usd', 'GBP', 'USD', 1.27, 'manual'),
    ('cad-usd', 'CAD', 'USD', 0.74, 'manual'),
    ('eur-gbp', 'EUR', 'GBP', 0.86, 'manual'),
    ('gbp-eur', 'GBP', 'EUR', 1.16, 'manual'),
    ('eur-cad', 'EUR', 'CAD', 1.48, 'manual'),
    ('cad-eur', 'CAD', 'EUR', 0.68, 'manual'),
    ('gbp-cad', 'GBP', 'CAD', 1.72, 'manual'),
    ('cad-gbp', 'CAD', 'GBP', 0.58, 'manual');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_balances_currency ON user_balances(currency);
CREATE INDEX IF NOT EXISTS idx_currency_conversions_user_id ON currency_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_currency_conversions_created_at ON currency_conversions(created_at);
CREATE INDEX IF NOT EXISTS idx_crypto_purchases_user_id ON crypto_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_purchases_status ON crypto_purchases(status);
CREATE INDEX IF NOT EXISTS idx_crypto_purchases_created_at ON crypto_purchases(created_at);
CREATE INDEX IF NOT EXISTS idx_compliance_logs_user_id ON compliance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_logs_event_type ON compliance_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_compliance_logs_created_at ON compliance_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_users_kyc_verified ON users(kyc_verified);
