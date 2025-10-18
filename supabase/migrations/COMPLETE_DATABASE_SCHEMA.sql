-- ============================================
-- EXPENSEMUSE AI - COMPLETE DATABASE SCHEMA
-- ============================================
-- Run this entire script in Supabase SQL Editor
-- This creates all tables, RLS policies, indexes, and triggers
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE FINANCIAL TABLES
-- ============================================

-- Wallets/Accounts Table
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank', 'cash', 'credit_card', 'upi', 'digital_wallet', 'investment')),
  balance NUMERIC(15, 2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Income Table
CREATE TABLE IF NOT EXISTS public.income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
  amount NUMERIC(15, 2) NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('salary', 'freelance', 'business', 'investment', 'rental', 'side_hustle', 'passive', 'other')),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  next_occurrence DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
  amount NUMERIC(15, 2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food', 'transport', 'entertainment', 'bills', 'shopping', 'health', 'education', 'investment', 'emi', 'insurance', 'travel', 'groceries', 'utilities', 'personal_care', 'gifts', 'other')),
  subcategory TEXT,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'upi', 'net_banking', 'wallet', 'emi')),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  tags TEXT[],
  location TEXT,
  merchant TEXT,
  is_anomaly BOOLEAN DEFAULT false,
  confidence_score NUMERIC(3, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets Table
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  spent NUMERIC(15, 2) DEFAULT 0,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  alert_threshold NUMERIC(3, 2) DEFAULT 0.80,
  alert_enabled BOOLEAN DEFAULT true,
  alert_sent BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals Table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC(15, 2) NOT NULL,
  current_amount NUMERIC(15, 2) DEFAULT 0,
  goal_type TEXT CHECK (goal_type IN ('short_term', 'long_term', 'emergency', 'investment')),
  category TEXT,
  deadline DATE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  icon TEXT,
  color TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
  auto_contribution BOOLEAN DEFAULT false,
  contribution_amount NUMERIC(15, 2),
  ai_suggested_amount NUMERIC(15, 2),
  ai_adjustment_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Bills & EMIs Table
CREATE TABLE IF NOT EXISTS public.bills_emis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('bill', 'emi', 'subscription', 'loan')),
  name TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  category TEXT,
  due_date DATE NOT NULL,
  recurrence TEXT NOT NULL CHECK (recurrence IN ('one_time', 'monthly', 'quarterly', 'yearly')),
  reminder_days INTEGER DEFAULT 3,
  auto_debit BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  loan_principal NUMERIC(15, 2),
  interest_rate NUMERIC(5, 2),
  remaining_amount NUMERIC(15, 2),
  tenure_months INTEGER,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER PREFERENCES & SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  currency TEXT DEFAULT 'INR',
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb,
  theme TEXT DEFAULT 'dark',
  financial_year_start TEXT DEFAULT 'april',
  monthly_income NUMERIC(15, 2),
  employment_type TEXT CHECK (employment_type IN ('salaried', 'self_employed', 'freelancer', 'business', 'student', 'retired')),
  risk_tolerance TEXT CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  financial_goals TEXT[],
  ai_insights_enabled BOOLEAN DEFAULT true,
  auto_categorization_enabled BOOLEAN DEFAULT true,
  gamification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GAMIFICATION SYSTEM
-- ============================================

-- User Gamification Stats
CREATE TABLE IF NOT EXISTS public.user_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  badges TEXT[],
  achievements JSONB DEFAULT '{}'::jsonb,
  challenges_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges & Achievements
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  points INTEGER DEFAULT 0,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  criteria JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Challenges
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT CHECK (challenge_type IN ('savings', 'budget', 'streak', 'goal', 'community')),
  target_value NUMERIC(15, 2),
  duration_days INTEGER,
  start_date DATE,
  end_date DATE,
  reward_points INTEGER,
  reward_badge TEXT,
  is_active BOOLEAN DEFAULT true,
  participants_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Challenge Participation
CREATE TABLE IF NOT EXISTS public.user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  progress NUMERIC(5, 2) DEFAULT 0,
  current_value NUMERIC(15, 2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, challenge_id)
);

-- ============================================
-- AI & ANALYTICS TABLES
-- ============================================

-- AI Model Predictions & Insights
CREATE TABLE IF NOT EXISTS public.ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prediction_type TEXT NOT NULL CHECK (prediction_type IN ('spending_forecast', 'income_forecast', 'cashflow_health', 'anomaly_detection', 'goal_adjustment', 'budget_recommendation', 'tax_saving', 'investment_suggestion')),
  category TEXT,
  predicted_value NUMERIC(15, 2),
  confidence_score NUMERIC(3, 2),
  prediction_date DATE NOT NULL,
  actual_value NUMERIC(15, 2),
  model_version TEXT,
  features JSONB,
  explanation TEXT,
  is_accurate BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cashflow Health Scores
CREATE TABLE IF NOT EXISTS public.cashflow_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  score_date DATE NOT NULL,
  income_score INTEGER,
  expense_score INTEGER,
  savings_score INTEGER,
  debt_score INTEGER,
  liquidity_score INTEGER,
  trend TEXT CHECK (trend IN ('improving', 'stable', 'declining')),
  factors JSONB,
  recommendations TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Learning Data (for adaptive learning)
CREATE TABLE IF NOT EXISTS public.ai_learning_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  context JSONB,
  user_action TEXT,
  feedback_score INTEGER CHECK (feedback_score BETWEEN -1 AND 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Alerts & Notifications
CREATE TABLE IF NOT EXISTS public.financial_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('budget_exceeded', 'bill_due', 'goal_milestone', 'anomaly_detected', 'low_balance', 'credit_alert', 'opportunity', 'risk_warning')),
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TAX & INVESTMENT TABLES
-- ============================================

-- Tax Records
CREATE TABLE IF NOT EXISTS public.tax_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  financial_year TEXT NOT NULL,
  total_income NUMERIC(15, 2),
  taxable_income NUMERIC(15, 2),
  deductions NUMERIC(15, 2),
  tax_paid NUMERIC(15, 2),
  estimated_tax NUMERIC(15, 2),
  tax_saving_opportunities JSONB,
  deductible_expenses JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investment Simulations
CREATE TABLE IF NOT EXISTS public.investment_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  simulation_name TEXT,
  investment_amount NUMERIC(15, 2) NOT NULL,
  duration_years INTEGER NOT NULL,
  expected_return_rate NUMERIC(5, 2) NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  investment_type TEXT,
  projected_value NUMERIC(15, 2),
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Core financial tables indexes
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_income_user_id ON public.income(user_id);
CREATE INDEX IF NOT EXISTS idx_income_date ON public.income(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_active ON public.budgets(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON public.bills_emis(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON public.bills_emis(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_status ON public.bills_emis(user_id, status);

-- AI & analytics indexes
CREATE INDEX IF NOT EXISTS idx_ai_predictions_user_type ON public.ai_predictions(user_id, prediction_type);
CREATE INDEX IF NOT EXISTS idx_cashflow_user_date ON public.cashflow_scores(user_id, score_date DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_user_unread ON public.financial_alerts(user_id, is_read);

-- Gamification indexes
CREATE INDEX IF NOT EXISTS idx_user_gamification_user_id ON public.user_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON public.user_challenges(user_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills_emis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashflow_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_simulations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - CORE TABLES
-- ============================================

-- Wallets Policies
DROP POLICY IF EXISTS "Users can view their own wallets" ON public.wallets;
CREATE POLICY "Users can view their own wallets" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own wallets" ON public.wallets;
CREATE POLICY "Users can insert their own wallets" ON public.wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own wallets" ON public.wallets;
CREATE POLICY "Users can update their own wallets" ON public.wallets
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own wallets" ON public.wallets;
CREATE POLICY "Users can delete their own wallets" ON public.wallets
  FOR DELETE USING (auth.uid() = user_id);

-- Income Policies
DROP POLICY IF EXISTS "Users can view their own income" ON public.income;
CREATE POLICY "Users can view their own income" ON public.income
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own income" ON public.income;
CREATE POLICY "Users can insert their own income" ON public.income
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own income" ON public.income;
CREATE POLICY "Users can update their own income" ON public.income
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own income" ON public.income;
CREATE POLICY "Users can delete their own income" ON public.income
  FOR DELETE USING (auth.uid() = user_id);

-- Expenses Policies
DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;
CREATE POLICY "Users can view their own expenses" ON public.expenses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own expenses" ON public.expenses;
CREATE POLICY "Users can insert their own expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
CREATE POLICY "Users can update their own expenses" ON public.expenses
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;
CREATE POLICY "Users can delete their own expenses" ON public.expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Budgets Policies
DROP POLICY IF EXISTS "Users can view their own budgets" ON public.budgets;
CREATE POLICY "Users can view their own budgets" ON public.budgets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own budgets" ON public.budgets;
CREATE POLICY "Users can insert their own budgets" ON public.budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own budgets" ON public.budgets;
CREATE POLICY "Users can update their own budgets" ON public.budgets
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own budgets" ON public.budgets;
CREATE POLICY "Users can delete their own budgets" ON public.budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Goals Policies
DROP POLICY IF EXISTS "Users can view their own goals" ON public.goals;
CREATE POLICY "Users can view their own goals" ON public.goals
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own goals" ON public.goals;
CREATE POLICY "Users can insert their own goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own goals" ON public.goals;
CREATE POLICY "Users can update their own goals" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own goals" ON public.goals;
CREATE POLICY "Users can delete their own goals" ON public.goals
  FOR DELETE USING (auth.uid() = user_id);

-- Bills & EMIs Policies
DROP POLICY IF EXISTS "Users can view their own bills" ON public.bills_emis;
CREATE POLICY "Users can view their own bills" ON public.bills_emis
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own bills" ON public.bills_emis;
CREATE POLICY "Users can insert their own bills" ON public.bills_emis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bills" ON public.bills_emis;
CREATE POLICY "Users can update their own bills" ON public.bills_emis
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bills" ON public.bills_emis;
CREATE POLICY "Users can delete their own bills" ON public.bills_emis
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - USER SETTINGS & GAMIFICATION
-- ============================================

-- User Preferences Policies
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- User Gamification Policies
DROP POLICY IF EXISTS "Users can view their own gamification" ON public.user_gamification;
CREATE POLICY "Users can view their own gamification" ON public.user_gamification
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own gamification" ON public.user_gamification;
CREATE POLICY "Users can insert their own gamification" ON public.user_gamification
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own gamification" ON public.user_gamification;
CREATE POLICY "Users can update their own gamification" ON public.user_gamification
  FOR UPDATE USING (auth.uid() = user_id);

-- Challenges Policies (public read access)
DROP POLICY IF EXISTS "Users can view all challenges" ON public.challenges;
CREATE POLICY "Users can view all challenges" ON public.challenges
  FOR SELECT USING (true);

-- User Challenges Policies
DROP POLICY IF EXISTS "Users can view own challenge participation" ON public.user_challenges;
CREATE POLICY "Users can view own challenge participation" ON public.user_challenges
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own challenge participation" ON public.user_challenges;
CREATE POLICY "Users can insert own challenge participation" ON public.user_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own challenge participation" ON public.user_challenges;
CREATE POLICY "Users can update own challenge participation" ON public.user_challenges
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - AI & ANALYTICS
-- ============================================

-- AI Predictions Policies
DROP POLICY IF EXISTS "Users can view own predictions" ON public.ai_predictions;
CREATE POLICY "Users can view own predictions" ON public.ai_predictions
  FOR SELECT USING (auth.uid() = user_id);

-- Cashflow Scores Policies
DROP POLICY IF EXISTS "Users can view own cashflow scores" ON public.cashflow_scores;
CREATE POLICY "Users can view own cashflow scores" ON public.cashflow_scores
  FOR SELECT USING (auth.uid() = user_id);

-- Financial Alerts Policies
DROP POLICY IF EXISTS "Users can view own alerts" ON public.financial_alerts;
CREATE POLICY "Users can view own alerts" ON public.financial_alerts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own alerts" ON public.financial_alerts;
CREATE POLICY "Users can update own alerts" ON public.financial_alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Tax Records Policies
DROP POLICY IF EXISTS "Users can view own tax records" ON public.tax_records;
CREATE POLICY "Users can view own tax records" ON public.tax_records
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tax records" ON public.tax_records;
CREATE POLICY "Users can insert own tax records" ON public.tax_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tax records" ON public.tax_records;
CREATE POLICY "Users can update own tax records" ON public.tax_records
  FOR UPDATE USING (auth.uid() = user_id);

-- Investment Simulations Policies
DROP POLICY IF EXISTS "Users can view own simulations" ON public.investment_simulations;
CREATE POLICY "Users can view own simulations" ON public.investment_simulations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own simulations" ON public.investment_simulations;
CREATE POLICY "Users can insert own simulations" ON public.investment_simulations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-updating timestamps
DROP TRIGGER IF EXISTS update_wallets_updated_at ON public.wallets;
CREATE TRIGGER update_wallets_updated_at 
  BEFORE UPDATE ON public.wallets 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_income_updated_at ON public.income;
CREATE TRIGGER update_income_updated_at 
  BEFORE UPDATE ON public.income 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at 
  BEFORE UPDATE ON public.expenses 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_budgets_updated_at ON public.budgets;
CREATE TRIGGER update_budgets_updated_at 
  BEFORE UPDATE ON public.budgets 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals;
CREATE TRIGGER update_goals_updated_at 
  BEFORE UPDATE ON public.goals 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bills_updated_at ON public.bills_emis;
CREATE TRIGGER update_bills_updated_at 
  BEFORE UPDATE ON public.bills_emis 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_preferences_updated_at 
  BEFORE UPDATE ON public.user_preferences 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_gamification_updated_at ON public.user_gamification;
CREATE TRIGGER update_gamification_updated_at 
  BEFORE UPDATE ON public.user_gamification 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tax_records_updated_at ON public.tax_records;
CREATE TRIGGER update_tax_records_updated_at 
  BEFORE UPDATE ON public.tax_records 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Function to update expense streaks
CREATE OR REPLACE FUNCTION public.update_expense_streak()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user gamification streak when expense is added
  UPDATE public.user_gamification
  SET 
    last_activity_date = NEW.date,
    current_streak = CASE 
      WHEN last_activity_date = NEW.date - INTERVAL '1 day' THEN current_streak + 1
      WHEN last_activity_date = NEW.date THEN current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(longest_streak, 
      CASE 
        WHEN last_activity_date = NEW.date - INTERVAL '1 day' THEN current_streak + 1
        WHEN last_activity_date = NEW.date THEN current_streak
        ELSE 1
      END
    ),
    total_points = total_points + 10,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  -- Insert record if it doesn't exist
  INSERT INTO public.user_gamification (user_id, last_activity_date, current_streak, longest_streak, total_points)
  VALUES (NEW.user_id, NEW.date, 1, 1, 10)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update streak on expense insert
DROP TRIGGER IF EXISTS trigger_update_expense_streak ON public.expenses;
CREATE TRIGGER trigger_update_expense_streak
  AFTER INSERT ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_expense_streak();

-- ============================================
-- SEED DATA - BADGES
-- ============================================

-- Insert default badges
INSERT INTO public.badges (code, name, description, icon, category, points, rarity) VALUES
  ('first_expense', 'First Step', 'Added your first expense', '🎯', 'beginner', 10, 'common'),
  ('streak_7', 'Week Warrior', '7-day tracking streak', '🔥', 'streak', 50, 'rare'),
  ('streak_30', 'Monthly Master', '30-day tracking streak', '🏆', 'streak', 150, 'epic'),
  ('budget_keeper', 'Budget Guardian', 'Stayed within budget for a month', '💰', 'budget', 100, 'rare'),
  ('savings_star', 'Savings Star', 'Reached your first savings goal', '⭐', 'savings', 200, 'epic'),
  ('expense_ninja', 'Expense Ninja', 'Tracked 100 expenses', '🥷', 'tracking', 300, 'legendary')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- FORCE SCHEMA RELOAD
-- ============================================

NOTIFY pgrst, 'reload schema';

-- ============================================
-- VERIFICATION & SUCCESS MESSAGE
-- ============================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public' 
    AND table_name IN ('wallets', 'income', 'expenses', 'budgets', 'goals', 'bills_emis', 
                       'user_preferences', 'user_gamification', 'badges', 'challenges', 
                       'user_challenges', 'ai_predictions', 'cashflow_scores', 
                       'financial_alerts', 'tax_records', 'investment_simulations');
  
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '✅ Tables created: %', table_count;
  RAISE NOTICE '✅ RLS policies applied';
  RAISE NOTICE '✅ Indexes created';
  RAISE NOTICE '✅ Triggers configured';
  RAISE NOTICE '✅ Default badges seeded';
  RAISE NOTICE '🎉 ExpenseMuse AI database is ready!';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next Steps:';
  RAISE NOTICE '1. Refresh your application (Ctrl + Shift + R)';
  RAISE NOTICE '2. Check Supabase Table Editor to verify tables';
  RAISE NOTICE '3. Test adding expenses, income, and other features';
END $$;
