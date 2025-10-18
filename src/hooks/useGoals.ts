import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused';
  auto_contribution: boolean;
  contribution_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface GoalRecommendation {
  goalId: string;
  type: 'increase_contribution' | 'adjust_deadline' | 'on_track' | 'at_risk';
  message: string;
  suggestedAmount?: number;
  suggestedDate?: string;
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<GoalRecommendation[]>([]);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setGoals(data);
        generateRecommendations(data);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  // Generate AI recommendations for goals
  const generateRecommendations = (goalsList: Goal[]) => {
    const recs: GoalRecommendation[] = [];

    goalsList.forEach((goal) => {
      if (goal.status !== 'active') return;

      const daysRemaining = Math.ceil(
        (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      const remaining = goal.target_amount - goal.current_amount;
      const progress = (goal.current_amount / goal.target_amount) * 100;

      // Calculate required daily/monthly savings
      const monthsRemaining = daysRemaining / 30;
      const requiredMonthly = remaining / monthsRemaining;

      if (daysRemaining < 0) {
        recs.push({
          goalId: goal.id,
          type: 'at_risk',
          message: `${goal.name}: Deadline has passed. Consider extending the deadline or adjusting the target.`,
          suggestedDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
      } else if (progress < 25 && daysRemaining < 60) {
        recs.push({
          goalId: goal.id,
          type: 'at_risk',
          message: `${goal.name}: You're behind schedule. Increase monthly contribution to ₹${Math.ceil(requiredMonthly)} to stay on track.`,
          suggestedAmount: Math.ceil(requiredMonthly),
        });
      } else if (progress < 50 && monthsRemaining < 3) {
        recs.push({
          goalId: goal.id,
          type: 'increase_contribution',
          message: `${goal.name}: Consider increasing contributions to ₹${Math.ceil(requiredMonthly)}/month to meet your deadline.`,
          suggestedAmount: Math.ceil(requiredMonthly),
        });
      } else if (progress >= 75) {
        recs.push({
          goalId: goal.id,
          type: 'on_track',
          message: `${goal.name}: Great progress! You're on track to reach your goal ${daysRemaining} days.`,
        });
      }
    });

    setRecommendations(recs);
  };

  // Add new goal
  const addGoal = async (
    name: string,
    targetAmount: number,
    deadline: string,
    category: string = 'general',
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('goals')
        .insert([
          {
            user_id: user.id,
            name,
            target_amount: targetAmount,
            current_amount: 0,
            deadline,
            category,
            priority,
            status: 'active',
            auto_contribution: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setGoals([data, ...goals]);
        generateRecommendations([data, ...goals]);
        toast.success('Goal created successfully');
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('Failed to create goal');
    }
  };

  // Update goal
  const updateGoal = async (
    id: string,
    updates: Partial<Omit<Goal, 'id' | 'user_id' | 'created_at'>>
  ) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newGoals = goals.map((g) => (g.id === id ? data : g));
        setGoals(newGoals);
        generateRecommendations(newGoals);
        toast.success('Goal updated');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
    }
  };

  // Add contribution to goal
  const addContribution = async (id: string, amount: number) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;

    const newAmount = goal.current_amount + amount;
    const completed = newAmount >= goal.target_amount;

    await updateGoal(id, {
      current_amount: newAmount,
      status: completed ? 'completed' : 'active',
    });

    if (completed) {
      toast.success(`🎉 Congratulations! You've completed ${goal.name}!`);
    }
  };

  // Delete goal
  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase.from('goals').delete().eq('id', id);

      if (error) throw error;

      setGoals(goals.filter((g) => g.id !== id));
      toast.success('Goal deleted');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  // Pause/Resume goal
  const toggleGoalStatus = async (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;

    const newStatus = goal.status === 'active' ? 'paused' : 'active';
    await updateGoal(id, { status: newStatus });
  };

  // Calculate statistics
  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalTarget = activeGoals.reduce((sum, g) => sum + g.target_amount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return {
    goals,
    activeGoals,
    completedGoals,
    loading,
    recommendations,
    addGoal,
    updateGoal,
    addContribution,
    deleteGoal,
    toggleGoalStatus,
    totalSaved,
    totalTarget,
    overallProgress,
    reloadGoals: loadGoals,
  };
}
