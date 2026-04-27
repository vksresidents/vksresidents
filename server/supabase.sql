-- Create gmail_accounts table (admin creates these)
CREATE TABLE IF NOT EXISTS gmail_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reg_no VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create parent_profiles table
CREATE TABLE IF NOT EXISTS parent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  parent_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  relation VARCHAR(50) NOT NULL,
  student_reg_no VARCHAR(50) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  student_hostel VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE
);

-- Create otp_verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  attempts INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_gmail_accounts_email ON gmail_accounts(email);
CREATE INDEX idx_parent_profiles_email ON parent_profiles(email);
CREATE INDEX idx_otp_verifications_email ON otp_verifications(email);
CREATE INDEX idx_otp_verifications_expires_at ON otp_verifications(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE gmail_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gmail_accounts (only admins can view)
CREATE POLICY "Admin can view all gmail accounts" ON gmail_accounts
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can insert gmail accounts" ON gmail_accounts
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can delete gmail accounts" ON gmail_accounts
  FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for parent_profiles
CREATE POLICY "Parents can view own profile" ON parent_profiles
  FOR SELECT USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Parents can insert own profile" ON parent_profiles
  FOR INSERT WITH CHECK (email = auth.jwt() ->> 'email');

CREATE POLICY "Parents can update own profile" ON parent_profiles
  FOR UPDATE USING (email = auth.jwt() ->> 'email');

-- RLS Policies for otp_verifications
CREATE POLICY "Allow anyone to insert OTP" ON otp_verifications
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow users to view own OTP" ON otp_verifications
  FOR SELECT USING (email = auth.jwt() ->> 'email' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow OTP updates" ON otp_verifications
  FOR UPDATE USING (TRUE);
