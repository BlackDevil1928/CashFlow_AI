import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mlEngine } from '@/lib/ai/ml-engine';
import { streakService } from '@/lib/streak-service';
import { toast } from 'sonner';

export interface Expense {
  id: string;
  user_id: string;
  wallet_id?: string;
  amount: number;
  category: string;
  subcategory?: string;
  description?: string;
  date: string;
  payment_method?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  tags?: string[];
  location?: string;
  merchant?: string;
  is_anomaly: boolean;
  confidence_score?: number;
  created_at: string;
  updated_at: string;
}

export function useExpenses() {
  const queryClient = useQueryClient();

  // Fetch all expenses
  const { data: expenses, isLoading, error } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as Expense[];
    }
  });

  // Add new expense with AI features
  const addExpense = useMutation({
    mutationFn: async (expense: Partial<Expense>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let finalCategory = expense.category;
      let confidence = 0;

      // Auto-categorize if description provided and no category selected
      if (expense.description && !expense.category) {
        const categorization = await mlEngine.categorizeExpense(
          expense.description,
          expense.amount || 0
        );
        finalCategory = categorization.category;
        confidence = categorization.confidence;
      }

      // Detect anomaly
      let isAnomaly = false;
      if (finalCategory) {
        const anomalyResult = await mlEngine.detectAnomaly({
          amount: expense.amount || 0,
          category: finalCategory,
          dayOfWeek: new Date(expense.date || Date.now()).getDay(),
          hourOfDay: new Date().getHours()
        });
        isAnomaly = anomalyResult.isAnomaly;
        
        if (isAnomaly) {
          toast.warning(`Unusual ${finalCategory} expense detected! ${anomalyResult.explanation}`);
        }
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          wallet_id: expense.wallet_id,
          amount: expense.amount,
          category: finalCategory,
          subcategory: expense.subcategory,
          description: expense.description,
          date: expense.date || new Date().toISOString().split('T')[0],
          payment_method: expense.payment_method,
          is_recurring: expense.is_recurring || false,
          recurrence_pattern: expense.recurrence_pattern,
          tags: expense.tags,
          location: expense.location,
          merchant: expense.merchant,
          is_anomaly: isAnomaly,
          confidence_score: confidence
        })
        .select()
        .single();

      if (error) throw error;

      // Log prediction for adaptive learning
      if (user.id && finalCategory) {
        await mlEngine.logPrediction(
          user.id,
          'spending_forecast',
          expense.amount || 0
        );
      }

      // Update streak for adding expense
      if (user.id) {
        await streakService.updateStreak(user.id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['streaks'] });
      toast.success('Expense added successfully! 🔥 Streak updated!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add expense');
    }
  });

  // Update expense
  const updateExpense = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Expense> & { id: string }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update expense');
    }
  });

  // Delete expense
  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete expense');
    }
  });

  // Get expenses by category
  const getExpensesByCategory = (category: string) => {
    return expenses?.filter(e => e.category === category) || [];
  };

  // Get total expenses
  const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

  // Get expenses for current month
  const currentMonthExpenses = expenses?.filter(e => {
    const expenseDate = new Date(e.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && 
           expenseDate.getFullYear() === now.getFullYear();
  }) || [];

  const monthlyTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown
  const categoryBreakdown = expenses?.reduce((acc, expense) => {
    const category = expense.category || 'other';
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    expenses,
    isLoading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpensesByCategory,
    totalExpenses,
    currentMonthExpenses,
    monthlyTotal,
    categoryBreakdown
  };
}
