-- ============================================
-- STEP 1: DROP EXISTING TABLES (Clean Slate)
-- ============================================
-- This ensures no conflicts with old tables

DROP TABLE IF EXISTS public.investment_simulations CASCADE;
DROP TABLE IF EXISTS public.tax_records CASCADE;
DROP TABLE IF EXISTS public.financial_alerts CASCADE;
DROP TABLE IF EXISTS public.ai_learning_data CASCADE;
DROP TABLE IF EXISTS public.cashflow_scores CASCADE;
DROP TABLE IF EXISTS public.ai_predictions CASCADE;
DROP TABLE IF EXISTS public.user_challenges CASCADE;
DROP TABLE IF EXISTS public.challenges CASCADE;
DROP TABLE IF EXISTS public.badges CASCADE;
DROP TABLE IF EXISTS public.user_gamification CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.bills_emis CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.budgets CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.income CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;

-- ============================================
-- STEP 2: CREATE CORE TABLES
-- ============================================

-- Wallets Table
CREATE TABLE public.wallets (
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
CREATE TABLE public.income (
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
CREATE TABLE public.expenses (
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
CREATE TABLE public.budgets (
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
CREATE TABLE public.goals (
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
CREATE TABLE public.bills_emis (
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

-- User Gamification
CREATE TABLE public.user_gamification (
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

-- ============================================
-- STEP 3: CREATE INDEXES
-- ============================================

CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX idx_income_user_id ON public.income(user_id);
CREATE INDEX idx_income_date ON public.income(date DESC);
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX idx_expenses_date ON public.expenses(date DESC);
CREATE INDEX idx_expenses_category ON public.expenses(category);
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_budgets_active ON public.budgets(user_id, is_active);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_status ON public.goals(user_id, status);
CREATE INDEX idx_bills_user_id ON public.bills_emis(user_id);
CREATE INDEX idx_bills_due_date ON public.bills_emis(due_date);
CREATE INDEX idx_user_gamification_user_id ON public.user_gamification(user_id);

-- ============================================
-- STEP 4: ENABLE RLS
-- ============================================

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills_emis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: CREATE RLS POLICIES
-- ============================================

-- Wallets
CREATE POLICY "Users can manage their own wallets" ON public.wallets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Income
CREATE POLICY "Users can manage their own income" ON public.income
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Expenses
CREATE POLICY "Users can manage their own expenses" ON public.expenses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Budgets
CREATE POLICY "Users can manage their own budgets" ON public.budgets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Goals
CREATE POLICY "Users can manage their own goals" ON public.goals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Bills & EMIs
CREATE POLICY "Users can manage their own bills" ON public.bills_emis
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User Gamification
CREATE POLICY "Users can manage their own gamification" ON public.user_gamification
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STEP 6: CREATE TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 7: CREATE TRIGGERS
-- ============================================

CREATE TRIGGER update_wallets_updated_at 
  BEFORE UPDATE ON public.wallets 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_income_updated_at 
  BEFORE UPDATE ON public.income 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at 
  BEFORE UPDATE ON public.expenses 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at 
  BEFORE UPDATE ON public.budgets 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at 
  BEFORE UPDATE ON public.goals 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bills_updated_at 
  BEFORE UPDATE ON public.bills_emis 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gamification_updated_at 
  BEFORE UPDATE ON public.user_gamification 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- STEP 8: STREAK TRACKING FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.update_expense_streak()
RETURNS TRIGGER AS $$
BEGIN
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
  
  INSERT INTO public.user_gamification (user_id, last_activity_date, current_streak, longest_streak, total_points)
  VALUES (NEW.user_id, NEW.date, 1, 1, 10)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_expense_streak
  AFTER INSERT ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_expense_streak();

-- ============================================
-- STEP 9: FORCE SCHEMA RELOAD (CRITICAL!)
-- ============================================

-- This forces PostgREST to reload and recognize the tables
NOTIFY pgrst, 'reload schema';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ============================================
-- STEP 10: VERIFICATION
-- ============================================

DO $$
DECLARE
  table_count INTEGER;
  wallets_exists BOOLEAN;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public' 
    AND table_name IN ('wallets', 'income', 'expenses', 'budgets', 'goals', 'bills_emis', 'user_gamification');
  
  -- Check if wallets table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'wallets'
  ) INTO wallets_exists;
  
  -- Report results
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ DATABASE SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created: % / 7', table_count;
  RAISE NOTICE 'Wallets table exists: %', wallets_exists;
  RAISE NOTICE '';
  RAISE NOTICE '✅ RLS policies applied';
  RAISE NOTICE '✅ Indexes created';
  RAISE NOTICE '✅ Triggers configured';
  RAISE NOTICE '✅ Schema cache reloaded';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📝 NEXT STEPS:';
  RAISE NOTICE '========================================';
  RAISE NOTICE '1. Check Table Editor - verify all tables exist';
  RAISE NOTICE '2. Hard refresh your app (Ctrl + Shift + R)';
  RAISE NOTICE '3. Restart your dev server';
  RAISE NOTICE '4. Try adding a wallet';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Ready to use!';
  RAISE NOTICE '';
END $$;
