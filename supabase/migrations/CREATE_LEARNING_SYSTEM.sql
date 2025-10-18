-- Create user learning progress table
CREATE TABLE IF NOT EXISTS public.user_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  concept_id TEXT NOT NULL,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'quiz_taken', 'completed')),
  quiz_score INTEGER DEFAULT 0,
  quiz_attempts INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, concept_id)
);

-- Create quiz results table
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  concept_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_taken_seconds INTEGER,
  answers JSONB,
  passed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_learning_progress
CREATE POLICY "Users can view own learning progress"
  ON public.user_learning_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning progress"
  ON public.user_learning_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning progress"
  ON public.user_learning_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for quiz_results
CREATE POLICY "Users can view own quiz results"
  ON public.quiz_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results"
  ON public.quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_learning_user_id ON public.user_learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_concept ON public.user_learning_progress(user_id, concept_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_concept ON public.quiz_results(user_id, concept_id);

-- Trigger for updated_at
CREATE TRIGGER update_learning_progress_updated_at
  BEFORE UPDATE ON public.user_learning_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Learning system tables created!';
  RAISE NOTICE '✅ Quiz tracking enabled';
  RAISE NOTICE '✅ User progress tracking ready';
END $$;
