-- ============================================================
-- EcoSphere AI — Seed Data
-- Run AFTER schema.sql
-- ============================================================

-- Default ESG weights
INSERT INTO esg_weights (env_weight, social_weight, gov_weight) VALUES (40.00, 30.00, 30.00);

-- Users (password = "admin123" bcrypt hash)
INSERT INTO users (name, email, password_hash, role, department, xp) VALUES
  ('Admin User',         'admin@eco.com',         '$2a$10$j/q2iOLLorDXkqfznaILneik2iWNgW9LfHGOjlDwL/k0zlPBnwKUy', 'admin',                  'Management',      500),
  ('Sarah Chen',         'sustain@eco.com',       '$2a$10$j/q2iOLLorDXkqfznaILneik2iWNgW9LfHGOjlDwL/k0zlPBnwKUy', 'sustainability_manager', 'Sustainability',  340),
  ('James Patel',        'hr@eco.com',            '$2a$10$j/q2iOLLorDXkqfznaILneik2iWNgW9LfHGOjlDwL/k0zlPBnwKUy', 'hr_manager',             'Human Resources', 210),
  ('Amara Osei',         'compliance@eco.com',    '$2a$10$j/q2iOLLorDXkqfznaILneik2iWNgW9LfHGOjlDwL/k0zlPBnwKUy', 'compliance_officer',     'Legal',           280),
  ('David Kim',          'employee@eco.com',      '$2a$10$j/q2iOLLorDXkqfznaILneik2iWNgW9LfHGOjlDwL/k0zlPBnwKUy', 'employee',               'Engineering',     150),
  ('Priya Sharma',       'priya@eco.com',         '$2a$10$j/q2iOLLorDXkqfznaILneik2iWNgW9LfHGOjlDwL/k0zlPBnwKUy', 'employee',               'Marketing',       90),
  ('Marcus Williams',    'marcus@eco.com',        '$2a$10$j/q2iOLLorDXkqfznaILneik2iWNgW9LfHGOjlDwL/k0zlPBnwKUy', 'employee',               'Executive',       600),
  ('Lena Mueller',       'lena@eco.com',          '$2a$10$j/q2iOLLorDXkqfznaILneik2iWNgW9LfHGOjlDwL/k0zlPBnwKUy', 'employee',               'Operations',      175);

-- Emission Factors
INSERT INTO emission_factors (name, value, unit, category) VALUES
  ('Electricity (Grid)',         0.4330, 'kg CO2/kWh',  'Energy'),
  ('Natural Gas',                2.0400, 'kg CO2/m³',   'Energy'),
  ('Diesel',                     2.6800, 'kg CO2/litre','Transport'),
  ('Petrol',                     2.3100, 'kg CO2/litre','Transport'),
  ('Air Travel (Short Haul)',    0.2550, 'kg CO2/km',   'Transport'),
  ('Air Travel (Long Haul)',     0.1950, 'kg CO2/km',   'Transport'),
  ('Waste to Landfill',          0.4670, 'kg CO2/kg',   'Waste'),
  ('Water Usage',                0.0003, 'kg CO2/litre','Water');

-- Carbon Transactions
INSERT INTO carbon_transactions (user_id, department, emission_factor_id, emission_factor_value, quantity, co2_value, transaction_date, notes) VALUES
  (2, 'Engineering',    1, 0.4330, 5000, 2165.00, '2026-07-01', 'Monthly server room electricity'),
  (2, 'Operations',     2, 2.0400, 800,  1632.00, '2026-07-01', 'Office gas heating'),
  (3, 'Human Resources',4, 2.3100, 200,  462.00,  '2026-07-02', 'Fleet vehicles petrol'),
  (2, 'Marketing',      5, 0.2550, 1200, 306.00,  '2026-07-03', 'Team travel to conference'),
  (2, 'Engineering',    1, 0.4330, 3500, 1515.50, '2026-06-01', 'June electricity'),
  (2, 'Operations',     7, 0.4670, 500,  233.50,  '2026-06-15', 'Waste disposal'),
  (2, 'Engineering',    1, 0.4330, 4800, 2078.40, '2026-05-01', 'May electricity'),
  (2, 'Marketing',      6, 0.1950, 8000, 1560.00, '2026-05-10', 'International conference');

-- Sustainability Goals
INSERT INTO sustainability_goals (title, description, target_value, current_value, unit, deadline, status, created_by) VALUES
  ('Reduce Carbon Emissions by 20%',    'Reduce total CO2 emissions vs 2025 baseline',  8000.00, 6128.00, 'kg CO2',    '2026-12-31', 'active',   2),
  ('100% Renewable Energy',             'Switch to 100% renewable energy sources',       100.00,  45.00,   '%',         '2027-06-30', 'active',   2),
  ('Zero Waste to Landfill',            'Eliminate all waste going to landfill',         0.00,    233.50,  'kg',        '2026-12-31', 'active',   2),
  ('Plant 1000 Trees',                  'Offset program via tree plantation initiative', 1000.00, 420.00,  'trees',     '2026-09-30', 'active',   2);

-- CSR Activities
INSERT INTO csr_activities (title, description, category, status, start_date, end_date, target_participants, xp_reward, created_by, approved_by) VALUES
  ('Community Tree Plantation Drive',   'Plant trees in local parks and community areas',  'Environment', 'active',    '2026-07-15', '2026-07-15', 50, 150, 2, 1),
  ('Annual Blood Donation Camp',        'Organize blood donation with local hospitals',    'Health',      'approved',  '2026-07-20', '2026-07-20', 100, 100, 3, 1),
  ('Rural School Digital Literacy',     'Teach digital skills to rural school students',  'Education',   'active',    '2026-07-01', '2026-07-31', 30,  200, 3, 1),
  ('Beach Cleanup Campaign',            'Clean local beach with volunteer employees',     'Environment', 'completed', '2026-06-01', '2026-06-01', 60,  120, 2, 1),
  ('Employee Sustainability Workshop',  'Workshop on personal sustainability practices',  'Education',   'pending',   '2026-08-01', '2026-08-01', 80,  80,  2, NULL);

-- CSR Participants
INSERT INTO csr_participants (activity_id, user_id) VALUES
  (1, 5), (1, 6), (1, 8),
  (3, 5), (3, 6),
  (4, 5), (4, 6), (4, 7), (4, 8);

-- Training Programs
INSERT INTO training_programs (title, description, category, duration_hours, completion_rate, status) VALUES
  ('ESG Fundamentals',              'Introduction to ESG principles and metrics',       'ESG',           4.0,  85.5, 'active'),
  ('Carbon Accounting Basics',      'How to measure and report carbon emissions',       'Environmental', 6.0,  62.0, 'active'),
  ('Anti-Bribery & Corruption',     'Compliance training for anti-bribery policies',   'Governance',    3.0,  91.0, 'completed'),
  ('Diversity & Inclusion',         'Building inclusive workplace practices',           'Social',        5.0,  78.5, 'active'),
  ('Data Privacy & GDPR',          'Understanding data protection obligations',        'Governance',    4.5,  55.0, 'active');

-- Diversity Metrics
INSERT INTO diversity_metrics (department, total_employees, female_count, minority_count, gender_ratio, minority_percentage) VALUES
  ('Engineering',    45, 14, 18, 31.11, 40.00),
  ('Marketing',      20, 12,  8, 60.00, 40.00),
  ('Human Resources',15, 10,  5, 66.67, 33.33),
  ('Operations',     30, 11, 10, 36.67, 33.33),
  ('Legal',          10,  5,  4, 50.00, 40.00),
  ('Executive',       8,  3,  3, 37.50, 37.50);

-- Policies
INSERT INTO policies (title, content, category, version, effective_date, status, created_by) VALUES
  ('Environmental Management Policy',   'This policy defines our commitment to reducing environmental impact, achieving carbon neutrality by 2030, and reporting ESG metrics transparently.', 'Environmental', '2.0', '2026-01-01', 'active', 1),
  ('Code of Business Conduct',          'All employees must adhere to ethical business practices including anti-corruption, fair competition, and honest communication with stakeholders.', 'Governance',    '3.1', '2025-07-01', 'active', 1),
  ('Data Privacy & Protection Policy',  'We are committed to protecting personal data in accordance with GDPR and applicable local regulations. All data must be processed lawfully.', 'Governance',    '1.5', '2025-01-01', 'active', 4),
  ('Diversity & Inclusion Policy',      'We foster a workplace where everyone is valued regardless of gender, ethnicity, religion, or background. Zero tolerance for discrimination.', 'Social',        '1.2', '2024-06-01', 'active', 3),
  ('Whistleblower Protection Policy',   'Employees who report misconduct in good faith are protected from retaliation. Anonymous reporting channels are available 24/7.', 'Governance',    '1.0', '2025-03-01', 'active', 4);

-- Policy Acknowledgements
INSERT INTO policy_acknowledgements (policy_id, user_id) VALUES
  (1, 2), (1, 3), (1, 5), (1, 6), (1, 7), (1, 8),
  (2, 2), (2, 3), (2, 4), (2, 5), (2, 7),
  (3, 2), (3, 4), (3, 5),
  (4, 3), (4, 5), (4, 6), (4, 7), (4, 8);

-- Audits
INSERT INTO audits (title, description, auditor, audit_date, status, findings, risk_level, created_by) VALUES
  ('Q2 Environmental Audit 2026',      'Quarterly review of carbon emissions and waste management', 'GreenAudit Ltd',     '2026-06-30', 'completed', 'Emissions within target. Minor waste reporting gap found and rectified.', 'low',    1),
  ('Annual Governance Compliance Audit','Full review of governance policies and compliance posture', 'Deloitte & Touche', '2026-07-01', 'completed', 'Two compliance issues identified: outdated data-sharing agreement, pending policy update.', 'medium', 1),
  ('ISO 14001 Pre-Assessment',         'Readiness check for ISO 14001 environmental certification', 'SGS Group',         '2026-08-15', 'planned',   NULL, 'low',    2);

-- Compliance Issues
INSERT INTO compliance_issues (title, description, owner_id, severity, status, due_date, created_by) VALUES
  ('Outdated Data Sharing Agreement',      'Third-party data sharing agreement expired. Renewal required immediately.',         4, 'high',     'in_progress', '2026-07-20', 4),
  ('Missing Carbon Report for May',        'Carbon emissions report for May 2026 not submitted to regulatory authority.',       2, 'medium',   'open',        '2026-07-15', 2),
  ('Supplier ESG Disclosure Gap',          'Key supplier has not provided ESG disclosure for the current year.',                2, 'medium',   'open',        '2026-07-31', 2),
  ('GDPR Training Overdue - 5 Employees', 'Five employees have not completed mandatory GDPR training (deadline passed).',      3, 'low',      'open',        '2026-07-10', 4),
  ('Annual ESG Report Publication',        'Publish annual ESG report on company website per regulatory requirement.',          7, 'high',     'in_progress', '2026-08-31', 1);

-- Challenges
INSERT INTO challenges (title, description, category, xp, deadline, status) VALUES
  ('30-Day No Single-Use Plastic',       'Eliminate all single-use plastic for 30 days and share tips with the team', 'Environmental', 200, '2026-07-31', 'active'),
  ('Cycle to Work Week',                 'Use bicycle or public transport to commute for an entire week',             'Environmental', 150, '2026-07-20', 'active'),
  ('Complete ESG Fundamentals Course',   'Finish the ESG Fundamentals training module on the learning portal',        'Learning',      100, '2026-07-31', 'active'),
  ('Recruit 5 CSR Volunteers',           'Recruit 5 colleagues to join any active CSR activity',                     'Social',        250, '2026-08-15', 'active'),
  ('Energy Audit Your Department',       'Conduct a mini energy audit and submit reduction recommendations',          'Environmental', 300, '2026-08-31', 'active');

-- User Challenges
INSERT INTO user_challenges (user_id, challenge_id, status) VALUES
  (5, 1, 'in_progress'),
  (5, 3, 'completed'),
  (6, 1, 'in_progress'),
  (6, 2, 'completed'),
  (8, 3, 'in_progress');

-- Badges
INSERT INTO badges (name, description, icon, badge_type, xp_threshold) VALUES
  ('Green Starter',     'Earned your first 50 XP',                  'Leaf',         'xp',       50),
  ('Eco Warrior',       'Reached 200 XP — sustainability champion',  'Shield',       'xp',       200),
  ('Carbon Crusher',    'Reached 500 XP — leading by example',       'Award',        'xp',       500),
  ('CSR Champion',      'Participated in 3+ CSR activities',         'Heart',        'activity', NULL),
  ('Challenger',        'Completed your first challenge',            'Trophy',       'challenge',NULL),
  ('Policy Pro',        'Acknowledged all active policies',          'CheckCircle',  'special',  NULL);

-- User Badges
INSERT INTO user_badges (user_id, badge_id) VALUES
  (2, 1), (2, 2), (2, 4), (2, 5),
  (3, 1), (3, 2), (3, 4),
  (5, 1), (5, 5),
  (6, 1),
  (7, 1), (7, 2), (7, 3), (7, 5), (7, 6),
  (8, 1), (8, 2);

-- Rewards
INSERT INTO rewards (title, description, points_required, stock, category) VALUES
  ('Extra Day Off',            '1 additional paid leave day',                     500, 10, 'Leave'),
  ('Amazon Voucher ₹500',      '₹500 Amazon gift card',                          200, 50, 'Voucher'),
  ('Sustainability Book Set',  'Curated collection of 3 sustainability books',    150, 20, 'Learning'),
  ('Green Coffee Mug',         'Eco-friendly reusable coffee mug with logo',      75,  100,'Merchandise'),
  ('Movie Ticket Pair',        '2 movie tickets (any cinema)',                    100, 30, 'Entertainment'),
  ('Work From Home Week',      'A full week of approved WFH',                    300, 15, 'Perk');

-- Reward Redemptions
INSERT INTO reward_redemptions (user_id, reward_id, points_spent) VALUES
  (5, 4, 75),
  (6, 5, 100),
  (7, 1, 500);
