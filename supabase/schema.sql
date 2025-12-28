-- Money Manager Database Schema
-- Run this SQL in Supabase SQL Editor

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('weekly', 'monthly')),
  payment_day INTEGER,
  expected_amount NUMERIC DEFAULT 0,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incomes table
CREATE TABLE IF NOT EXISTS incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  payment_date DATE,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received')),
  received_date DATE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  raw_input TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  billing_day INTEGER NOT NULL CHECK (billing_day >= 1 AND billing_day <= 31),
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (for demo purposes)
-- In production, you should use proper authentication

CREATE POLICY "Allow all for companies" ON companies
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for incomes" ON incomes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for expenses" ON expenses
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for subscriptions" ON subscriptions
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_incomes_company_id ON incomes(company_id);
CREATE INDEX IF NOT EXISTS idx_incomes_period ON incomes(period);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_active ON subscriptions(is_active);
