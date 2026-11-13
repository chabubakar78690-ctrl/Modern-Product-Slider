-- ==============================================================================
-- Modern Product Slider SaaS - Production Database Schema
-- Compatible with: PostgreSQL, Supabase, Neon Serverless, Render, Railway
-- ==============================================================================

-- 1. USERS & PRO LICENSES TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL DEFAULT '',
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer', -- 'customer' | 'admin'
    provider VARCHAR(20) NOT NULL DEFAULT 'email', -- 'email' | 'google'
    picture VARCHAR(500) DEFAULT '',
    plan_id VARCHAR(30) NOT NULL DEFAULT 'free', -- 'free' | 'single' | 'unlimited'
    plan_name VARCHAR(60) NOT NULL DEFAULT 'Free Edition ($0/mo)',
    price INT NOT NULL DEFAULT 0,
    api_key VARCHAR(120) UNIQUE,
    max_sites INT NOT NULL DEFAULT 0, -- 0 for free, 1 for single, -1 for unlimited
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active' | 'suspended'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ACTIVATED WORDPRESS DOMAINS TABLE
CREATE TABLE IF NOT EXISTS active_domains (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    activated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_domain UNIQUE (user_id, domain)
);

-- 3. ONE-TIME PASSWORDS (OTP) FOR GMAIL VERIFICATION
CREATE TABLE IF NOT EXISTS otps (
    email VARCHAR(255) PRIMARY KEY,
    code_hash VARCHAR(64) NOT NULL,
    name VARCHAR(120) DEFAULT '',
    attempts INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TRANSACTIONS & STRIPE / CARD PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    plan VARCHAR(60) NOT NULL,
    amount INT NOT NULL,
    method VARCHAR(60) NOT NULL DEFAULT 'Card',
    status VARCHAR(20) NOT NULL DEFAULT 'Paid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. AUDIT & SECURITY LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    event VARCHAR(80) NOT NULL,
    detail TEXT NOT NULL,
    client_ip VARCHAR(60) DEFAULT '',
    ok BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- HIGH-PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_active_domains_domain ON active_domains(domain);
CREATE INDEX IF NOT EXISTS idx_transactions_email ON transactions(email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ==============================================================================
-- INITIAL DEFAULT SEED DATA
-- ==============================================================================
INSERT INTO users (id, name, email, role, provider, plan_id, plan_name, price, api_key, max_sites, status)
VALUES 
    ('usr_admin_01', 'Founder & Admin', 'admin@modernproductslider.com', 'admin', 'email', 'unlimited', 'Unlimited Sites ($10/mo)', 10, 'mps_live_un_founder_key_2026', -1, 'active'),
    ('usr_02', 'Sarah Jenkins', 'sarah.boutique@gmail.com', 'customer', 'google', 'single', 'Single Site ($3/mo)', 3, 'mps_test_single_3usd', 1, 'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO active_domains (user_id, domain)
VALUES 
    ('usr_admin_01', 'modern-product-slider.vercel.app'),
    ('usr_02', 'sarahstreetwear.com')
ON CONFLICT DO NOTHING;
