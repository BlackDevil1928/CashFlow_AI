import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Income {
  id: string;
  user_id: string;
  wallet_id?: string;
  amount: number;
  source: 'salary' | 'freelance' | 'business' | 'investment' | 'rental' | 'side_hustle' | 'passive' | 'other';
  description?: string;
  date: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  next_occurrence?: string;
  created_at: string;
  updated_at: string;
}

export function useIncome() {
  const queryClient = useQueryClient();

  const { data: incomes, isLoading, error } = useQuery({
    queryKey: ['income'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .order('date', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as Income[];
    }
  });

  const addIncome = useMutation({
    mutationFn: async (income: Partial<Income>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('income')
        .insert({
          user_id: user.id,
          wallet_id: income.wallet_id,
          amount: income.amount,
          source: income.source,
          description: income.description,
          date: income.date || new Date().toISOString().split('T')[0],
          is_recurring: income.is_recurring || false,
          recurrence_pattern: income.recurrence_pattern,
          next_occurrence: income.next_occurrence
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      toast.success('Income added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add income');
    }
  });

  const updateIncome = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Income> & { id: string }) => {
      const { data, error } = await supabase
        .from('income')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      toast.success('Income updated successfully!');
    }
  });

  const deleteIncome = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('income')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      toast.success('Income deleted successfully!');
    }
  });

  const totalIncome = incomes?.reduce((sum, income) => sum + income.amount, 0) || 0;

  const currentMonthIncome = incomes?.filter(i => {
    const incomeDate = new Date(i.date);
    const now = new Date();
    return incomeDate.getMonth() === now.getMonth() && 
           incomeDate.getFullYear() === now.getFullYear();
  }) || [];

  const monthlyTotal = currentMonthIncome.reduce((sum, i) => sum + i.amount, 0);

  return {
    incomes,
    isLoading,
    error,
    addIncome,
    updateIncome,
    deleteIncome,
    totalIncome,
    currentMonthIncome,
    monthlyTotal
  };
}
