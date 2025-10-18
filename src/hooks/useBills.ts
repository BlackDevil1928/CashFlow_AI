import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Bill {
  id: string;
  user_id: string;
  type: 'bill' | 'emi' | 'subscription' | 'loan';
  name: string;
  amount: number;
  category: string;
  due_date: string;
  recurrence: 'one_time' | 'monthly' | 'quarterly' | 'yearly';
  reminder_days: number;
  auto_debit: boolean;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface BillReminder {
  billId: string;
  billName: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
  urgency: 'critical' | 'warning' | 'info';
}

export function useBills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<BillReminder[]>([]);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('bills_emis')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;

      if (data) {
        setBills(data);
        generateReminders(data);
      }
    } catch (error) {
      console.error('Error loading bills:', error);
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  // Generate reminders for upcoming bills
  const generateReminders = (billsList: Bill[]) => {
    const now = new Date();
    const rems: BillReminder[] = [];

    billsList.forEach((bill) => {
      if (bill.status === 'paid') return;

      const dueDate = new Date(bill.due_date);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilDue < 0) {
        // Overdue
        rems.push({
          billId: bill.id,
          billName: bill.name,
          amount: bill.amount,
          dueDate: bill.due_date,
          daysUntilDue,
          urgency: 'critical',
        });
      } else if (daysUntilDue <= 3) {
        // Due in 3 days or less
        rems.push({
          billId: bill.id,
          billName: bill.name,
          amount: bill.amount,
          dueDate: bill.due_date,
          daysUntilDue,
          urgency: 'critical',
        });
      } else if (daysUntilDue <= bill.reminder_days) {
        // Within reminder window
        rems.push({
          billId: bill.id,
          billName: bill.name,
          amount: bill.amount,
          dueDate: bill.due_date,
          daysUntilDue,
          urgency: 'warning',
        });
      }
    });

    setReminders(rems);
  };

  // Add new bill
  const addBill = async (
    name: string,
    amount: number,
    dueDate: string,
    recurrence: Bill['recurrence'],
    category: string = 'utility',
    reminderDays: number = 3,
    type: Bill['type'] = 'bill'
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('bills_emis')
        .insert([
          {
            user_id: user.id,
            type,
            name,
            amount,
            category,
            due_date: dueDate,
            recurrence,
            reminder_days: reminderDays,
            auto_debit: false,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setBills([...bills, data]);
        generateReminders([...bills, data]);
        toast.success('Bill added successfully');
      }
    } catch (error: any) {
      console.error('Error adding bill:', error);
      toast.error(error.message || 'Failed to add bill');
    }
  };

  // Update bill
  const updateBill = async (
    id: string,
    updates: Partial<Omit<Bill, 'id' | 'user_id' | 'created_at'>>
  ) => {
    try {
      const { data, error } = await supabase
        .from('bills_emis')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newBills = bills.map((b) => (b.id === id ? data : b));
        setBills(newBills);
        generateReminders(newBills);
        toast.success('Bill updated');
      }
    } catch (error) {
      console.error('Error updating bill:', error);
      toast.error('Failed to update bill');
    }
  };

  // Mark bill as paid
  const markAsPaid = async (id: string) => {
    const bill = bills.find((b) => b.id === id);
    if (!bill) return;

    const updates: Partial<Bill> = {
      status: 'paid',
    };

    // If recurring, schedule next payment
    if (bill.recurrence !== 'one_time') {
      const nextDueDate = calculateNextDueDate(new Date(bill.due_date), bill.recurrence);
      updates.due_date = nextDueDate.toISOString().split('T')[0];
      updates.status = 'pending';
    }

    await updateBill(id, updates);
    toast.success(`${bill.name} marked as paid`);
  };

  // Calculate next due date for recurring bills
  const calculateNextDueDate = (currentDue: Date, recurrence: Bill['recurrence']): Date => {
    const next = new Date(currentDue);
    
    switch (recurrence) {
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
    
    return next;
  };

  // Delete bill
  const deleteBill = async (id: string) => {
    try {
      const { error } = await supabase.from('bills_emis').delete().eq('id', id);

      if (error) throw error;

      setBills(bills.filter((b) => b.id !== id));
      toast.success('Bill deleted');
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast.error('Failed to delete bill');
    }
  };

  // Calculate statistics
  const pendingBills = bills.filter((b) => b.status === 'pending');
  const overdueBills = bills.filter((b) => {
    if (b.status !== 'pending') return false;
    const dueDate = new Date(b.due_date);
    return dueDate < new Date();
  });
  const totalPending = pendingBills.reduce((sum, b) => sum + b.amount, 0);
  const totalOverdue = overdueBills.reduce((sum, b) => sum + b.amount, 0);

  return {
    bills,
    loading,
    reminders,
    pendingBills,
    overdueBills,
    totalPending,
    totalOverdue,
    addBill,
    updateBill,
    markAsPaid,
    deleteBill,
    reloadBills: loadBills,
  };
}
