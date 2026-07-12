-- ============================================================
-- EcoSphere AI — PostgreSQL Database Schema
-- ============================================================

-- Drop existing tables (order matters for FK constraints)
DROP TABLE IF EXISTS reward_redemptions CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS user_challenges CASCADE;
DROP TABLE IF EXISTS policy_acknowledgements CASCADE;
DROP TABLE IF EXISTS csr_participants CASCADE;
DROP TABLE IF EXISTS compliance_issues CASCADE;
DROP TABLE IF EXISTS audits CASCADE;
DROP TABLE IF EXISTS policies CASCADE;
DROP TABLE IF EXISTS diversity_metrics CASCADE;
DROP TABLE IF EXISTS training_programs CASCADE;
DROP TABLE IF EXISTS csr_activities CASCADE;
DROP TABLE IF EXISTS sustainability_goals CASCADE;
DROP TABLE IF EXISTS emission_factors CASCADE;
DROP TABLE IF EXISTS carbon_transactions CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS esg_weights CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'employee'
    CHECK (role IN ('admin', 'sustainability_manager', 'hr_manager', 'compliance_officer', 'employee')),
  department VARCHAR(100),
  xp INTEGER DEFAULT 0,
  avatar_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ESG WEIGHTS (configurable per organisation)
-- ============================================================
CREATE TABLE esg_weights (
  id SERIAL PRIMARY KEY,
  env_weight NUMERIC(5,2) DEFAULT 40.00,
  social_weight NUMERIC(5,2) DEFAULT 30.00,
  gov_weight NUMERIC(5,2) DEFAULT 30.00,
  updated_by INTEGER REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ENVIRONMENTAL MODULE
-- ============================================================
CREATE TABLE emission_factors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  value NUMERIC(10,4) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE carbon_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  department VARCHAR(100) NOT NULL,
  emission_factor_id INTEGER REFERENCES emission_factors(id),
  emission_factor_value NUMERIC(10,4) NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  co2_value NUMERIC(10,4) NOT NULL CHECK (co2_value >= 0),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sustainability_goals (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  target_value NUMERIC(10,2) NOT NULL,
  current_value NUMERIC(10,2) DEFAULT 0,
  unit VARCHAR(50),
  deadline DATE,
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'achieved', 'overdue', 'cancelled')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SOCIAL MODULE
-- ============================================================
CREATE TABLE csr_activities (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'active', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  target_participants INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 50,
  created_by INTEGER REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE csr_participants (
  id SERIAL PRIMARY KEY,
  activity_id INTEGER REFERENCES csr_activities(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

CREATE TABLE training_programs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  duration_hours NUMERIC(5,1),
  completion_rate NUMERIC(5,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE diversity_metrics (
  id SERIAL PRIMARY KEY,
  department VARCHAR(100) NOT NULL,
  total_employees INTEGER DEFAULT 0,
  female_count INTEGER DEFAULT 0,
  minority_count INTEGER DEFAULT 0,
  gender_ratio NUMERIC(5,2),
  minority_percentage NUMERIC(5,2),
  recorded_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GOVERNANCE MODULE
-- ============================================================
CREATE TABLE policies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  version VARCHAR(20) DEFAULT '1.0',
  effective_date DATE,
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'archived')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE policy_acknowledgements (
  id SERIAL PRIMARY KEY,
  policy_id INTEGER REFERENCES policies(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  acknowledged_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(policy_id, user_id)
);

CREATE TABLE audits (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  auditor VARCHAR(100),
  audit_date DATE,
  status VARCHAR(50) DEFAULT 'planned'
    CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  findings TEXT,
  risk_level VARCHAR(50) DEFAULT 'low'
    CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE compliance_issues (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  owner_id INTEGER REFERENCES users(id),
  severity VARCHAR(50) DEFAULT 'medium'
    CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(50) DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved', 'overdue')),
  due_date DATE,
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GAMIFICATION MODULE
-- ============================================================
CREATE TABLE challenges (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  xp INTEGER DEFAULT 100,
  deadline DATE,
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_challenges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  UNIQUE(user_id, challenge_id)
);

CREATE TABLE badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  badge_type VARCHAR(50) DEFAULT 'xp'
    CHECK (badge_type IN ('xp', 'activity', 'challenge', 'special')),
  xp_threshold INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_badges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE rewards (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  stock INTEGER DEFAULT 0,
  category VARCHAR(100),
  image_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reward_redemptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reward_id INTEGER REFERENCES rewards(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_carbon_transactions_department ON carbon_transactions(department);
CREATE INDEX idx_carbon_transactions_date ON carbon_transactions(transaction_date);
CREATE INDEX idx_compliance_issues_status ON compliance_issues(status);
CREATE INDEX idx_compliance_issues_due_date ON compliance_issues(due_date);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_csr_participants_user ON csr_participants(user_id);
CREATE INDEX idx_user_challenges_user ON user_challenges(user_id);
