-- ===================================
-- ADD TEST EMAIL ACCOUNTS TO LOGIN_CREDENTIALS
-- ===================================
-- These allow personal Gmail accounts to authenticate with their assigned roles

INSERT INTO login_credentials (email, role, staffId) VALUES
-- Admin
('vthirthankar@gmail.com', 'admin', NULL),

-- Parent
('ngvt200@gmail.com', 'parent', NULL),

-- Head of Department
('majhaavibushi@gmail.com', 'hod', NULL),

-- Dean of Residents
('vksresidents@gmail.com', 'dean', NULL),

-- Gate Pass Faculty
('kasavi643@gmail.com', 'gatepass', NULL),

-- Warden
('kaavyasuper@gmail.com', 'warden', NULL),

-- Security
('visakamama@gmail.com', 'security', NULL);

-- Verify the insertions (run this to check)
SELECT email, role FROM login_credentials WHERE email LIKE '%gmail.com' ORDER BY role;
