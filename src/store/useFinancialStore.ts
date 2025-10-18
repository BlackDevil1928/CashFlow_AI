import { create } from 'zustand';
import { AgentRecommendation } from '@/lib/ai/agent-service';

interface FinancialStore {
  // Cashflow health score
  cashflowScore: number;
  cashflowTrend: 'improving' | 'stable' | 'declining';
  
  // AI Recommendations
  recommendations: AgentRecommendation[];
  unreadRecommendations: number;
  
  // Alerts
  alerts: any[];
  unreadAlerts: number;
  
  // User context
  monthlyIncome: number;
  monthlyExpenses: number;
  
  // Actions
  updateScore: (score: number, trend: 'improving' | 'stable' | 'declining') => void;
  updateRecommendations: (recs: AgentRecommendation[]) => void;
  updateAlerts: (alerts: any[]) => void;
  markRecommendationRead: (index: number) => void;
  markAlertRead: (id: string) => void;
  updateFinancials: (income: number, expenses: number) => void;
}

export const useFinancialStore = create<FinancialStore>((set) => ({
  cashflowScore: 0,
  cashflowTrend: 'stable',
  recommendations: [],
  unreadRecommendations: 0,
  alerts: [],
  unreadAlerts: 0,
  monthlyIncome: 0,
  monthlyExpenses: 0,
  
  updateScore: (score, trend) => set({ cashflowScore: score, cashflowTrend: trend }),
  
  updateRecommendations: (recs) => set({ 
    recommendations: recs,
    unreadRecommendations: recs.length 
  }),
  
  updateAlerts: (alerts) => set({ 
    alerts,
    unreadAlerts: alerts.filter((a: any) => !a.is_read).length 
  }),
  
  markRecommendationRead: (index) => set((state) => ({
    unreadRecommendations: Math.max(0, state.unreadRecommendations - 1)
  })),
  
  markAlertRead: (id) => set((state) => ({
    alerts: state.alerts.map((a: any) => 
      a.id === id ? { ...a, is_read: true } : a
    ),
    unreadAlerts: Math.max(0, state.unreadAlerts - 1)
  })),
  
  updateFinancials: (income, expenses) => set({ 
    monthlyIncome: income,
    monthlyExpenses: expenses 
  }),
}));
