import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly' | 'daily';
  spent: number;
  alert_threshold: number;
  alert_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetAlert {
  category: string;
  percentage: number;
  spent: number;
  budget: number;
  severity: 'warning' | 'critical';
}

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);

  // Load budgets
  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setBudgets(data);
        calculateAlerts(data);
      }
    } catch (error) {
      console.error('Error loading budgets:', error);
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  // Calculate spending alerts
  const calculateAlerts = (budgetList: Budget[]) => {
    const newAlerts: BudgetAlert[] = [];

    budgetList.forEach((budget) => {
      const percentage = (budget.spent / budget.amount) * 100;

      if (budget.alert_enabled) {
        if (percentage >= 100) {
          newAlerts.push({
            category: budget.category,
            percentage,
            spent: budget.spent,
            budget: budget.amount,
            severity: 'critical',
          });
        } else if (percentage >= (budget.alert_threshold * 100)) {
          newAlerts.push({
            category: budget.category,
            percentage,
            spent: budget.spent,
            budget: budget.amount,
            severity: 'warning',
          });
        }
      }
    });

    setAlerts(newAlerts);
  };

  // Add new budget
  const addBudget = async (
    category: string,
    amount: number,
    period: 'monthly' | 'weekly' | 'yearly' = 'monthly',
    alertThreshold: number = 80
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Calculate start and end dates based on period
      const startDate = new Date();
      const endDate = new Date();
      if (period === 'weekly') {
        endDate.setDate(endDate.getDate() + 7);
      } else if (period === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      const { data, error } = await supabase
        .from('budgets')
        .insert([
          {
            user_id: user.id,
            category,
            amount,
            period,
            spent: 0,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            alert_threshold: alertThreshold / 100,
            alert_enabled: true,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setBudgets([data, ...budgets]);
        toast.success('Budget created successfully');
      }
    } catch (error) {
      console.error('Error adding budget:', error);
      toast.error('Failed to create budget');
    }
  };

  // Update budget
  const updateBudget = async (
    id: string,
    updates: Partial<Omit<Budget, 'id' | 'user_id' | 'created_at'>>
  ) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setBudgets(budgets.map((b) => (b.id === id ? data : b)));
        calculateAlerts(budgets.map((b) => (b.id === id ? data : b)));
        toast.success('Budget updated');
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget');
    }
  };

  // Delete budget
  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase.from('budgets').delete().eq('id', id);

      if (error) throw error;

      setBudgets(budgets.filter((b) => b.id !== id));
      toast.success('Budget deleted');
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
    }
  };

  // Update spent amount for a category
  const updateSpent = async (category: string, spent: number) => {
    try {
      const budget = budgets.find((b) => b.category === category);
      if (!budget) return;

      await updateBudget(budget.id, { spent });
    } catch (error) {
      console.error('Error updating spent amount:', error);
    }
  };

  // Reset all budgets (for new month)
  const resetBudgets = async () => {
    try {
      const updates = budgets.map((budget) => ({
        id: budget.id,
        spent: 0,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('budgets').upsert(updates);

      if (error) throw error;

      await loadBudgets();
      toast.success('All budgets reset for new period');
    } catch (error) {
      console.error('Error resetting budgets:', error);
      toast.error('Failed to reset budgets');
    }
  };

  // Get budget by category
  const getBudgetByCategory = (category: string) => {
    return budgets.find((b) => b.category === category);
  };

  // Calculate totals
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  return {
    budgets,
    loading,
    alerts,
    addBudget,
    updateBudget,
    deleteBudget,
    updateSpent,
    resetBudgets,
    getBudgetByCategory,
    totalBudget,
    totalSpent,
    totalRemaining,
    reloadBudgets: loadBudgets,
  };
}
