import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  type: 'bank' | 'cash' | 'credit_card' | 'upi' | 'digital_wallet' | 'investment';
  balance: number;
  currency: string;
  icon?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export function useWallets() {
  const queryClient = useQueryClient();

  // Fetch all wallets
  const { data: wallets, isLoading, error } = useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Wallet[];
    }
  });

  // Add new wallet
  const addWallet = useMutation({
    mutationFn: async (wallet: Partial<Wallet>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          name: wallet.name,
          type: wallet.type,
          balance: wallet.balance || 0,
          currency: wallet.currency || 'INR',
          icon: wallet.icon,
          color: wallet.color
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast.success('Wallet added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add wallet');
    }
  });

  // Update wallet
  const updateWallet = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Wallet> & { id: string }) => {
      const { data, error } = await supabase
        .from('wallets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast.success('Wallet updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update wallet');
    }
  });

  // Delete wallet (hard delete)
  const deleteWallet = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wallets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast.success('Wallet deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete wallet');
    }
  });

  // Update wallet balance
  const updateBalance = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const { data, error } = await supabase
        .from('wallets')
        .update({ balance: amount })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    }
  });

  // Get total balance across all wallets
  const totalBalance = wallets?.reduce((sum, wallet) => sum + wallet.balance, 0) || 0;

  return {
    wallets,
    isLoading,
    error,
    addWallet,
    updateWallet,
    deleteWallet,
    updateBalance,
    totalBalance
  };
}
