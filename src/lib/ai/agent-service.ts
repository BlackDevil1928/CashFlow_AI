import { supabase } from '@/integrations/supabase/client';
import { mlEngine } from './ml-engine';

export interface AgentRecommendation {
  type: 'savings' | 'budget' | 'goal' | 'risk' | 'opportunity' | 'tax';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  action?: {
    label: string;
    url: string;
  };
  impact: {
    category: string;
    value: number;
    description: string;
  };
}

export interface FinancialContext {
  userId: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  debts: number;
  goals: any[];
  budgets: any[];
  recentTransactions: any[];
}

/**
 * Agentic AI Service - Proactive Financial Agent
 * Continuously monitors user's financial health and provides intelligent recommendations
 */
export class AgentService {
  private context: FinancialContext | null = null;

  /**
   * Initialize agent with user's financial context
   */
  async initialize(userId: string): Promise<void> {
    this.context = await this.loadFinancialContext(userId);
  }

  /**
   * Load complete financial context for the user
   */
  private async loadFinancialContext(userId: string): Promise<FinancialContext> {
    const [income, expenses, goals, budgets, preferences] = await Promise.all([
      this.getMonthlyIncome(userId),
      this.getMonthlyExpenses(userId),
      this.getGoals(userId),
      this.getBudgets(userId),
      this.getUserPreferences(userId)
    ]);

    const { data: transactions } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(50);

    return {
      userId,
      monthlyIncome: income,
      monthlyExpenses: expenses.total,
      savings: income - expenses.total,
      debts: await this.getTotalDebts(userId),
      goals,
      budgets,
      recentTransactions: transactions || []
    };
  }

  /**
   * Generate proactive recommendations
   */
  async generateRecommendations(): Promise<AgentRecommendation[]> {
    if (!this.context) {
      throw new Error('Agent not initialized');
    }

    const recommendations: AgentRecommendation[] = [];

    // Check budget health
    const budgetRecommendations = await this.analyzeBudgets();
    recommendations.push(...budgetRecommendations);

    // Check goal progress
    const goalRecommendations = await this.analyzeGoals();
    recommendations.push(...goalRecommendations);

    // Check for savings opportunities
    const savingsRecommendations = await this.analyzeSavingsOpportunities();
    recommendations.push(...savingsRecommendations);

    // Check for spending anomalies
    const anomalyRecommendations = await this.analyzeAnomalies();
    recommendations.push(...anomalyRecommendations);

    // Tax optimization suggestions
    const taxRecommendations = await this.analyzeTaxOpportunities();
    recommendations.push(...taxRecommendations);

    // Sort by priority
    return recommendations.sort((a, b) => {
      const priorityMap = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityMap[b.priority] - priorityMap[a.priority];
    });
  }

  /**
   * Analyze budget health and generate alerts
   */
  private async analyzeBudgets(): Promise<AgentRecommendation[]> {
    const recommendations: AgentRecommendation[] = [];
    
    for (const budget of this.context!.budgets) {
      const percentage = (budget.spent / budget.amount) * 100;

      if (percentage >= 90) {
        recommendations.push({
          type: 'budget',
          priority: 'critical',
          title: `${budget.category} Budget Exceeded`,
          message: `You've spent ${percentage.toFixed(0)}% of your ${budget.category} budget. Consider reducing spending.`,
          action: {
            label: 'View Budget',
            url: '/budget'
          },
          impact: {
            category: budget.category,
            value: budget.spent - budget.amount,
            description: `₹${(budget.spent - budget.amount).toFixed(2)} over budget`
          }
        });
      } else if (percentage >= 80) {
        recommendations.push({
          type: 'budget',
          priority: 'high',
          title: `${budget.category} Budget Alert`,
          message: `You're at ${percentage.toFixed(0)}% of your ${budget.category} budget. Be mindful of spending.`,
          action: {
            label: 'View Budget',
            url: '/budget'
          },
          impact: {
            category: budget.category,
            value: budget.amount - budget.spent,
            description: `₹${(budget.amount - budget.spent).toFixed(2)} remaining`
          }
        });
      }
    }

    return recommendations;
  }

  /**
   * Analyze goal progress and suggest adjustments
   */
  private async analyzeGoals(): Promise<AgentRecommendation[]> {
    const recommendations: AgentRecommendation[] = [];
    const now = new Date();

    for (const goal of this.context!.goals) {
      if (goal.status !== 'active') continue;

      const deadline = new Date(goal.deadline);
      const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const progress = (goal.current_amount / goal.target_amount) * 100;
      const expectedProgress = ((now.getTime() - new Date(goal.created_at).getTime()) / 
                              (deadline.getTime() - new Date(goal.created_at).getTime())) * 100;

      if (progress < expectedProgress - 10 && daysRemaining > 0) {
        const monthlyRequired = (goal.target_amount - goal.current_amount) / (daysRemaining / 30);
        
        recommendations.push({
          type: 'goal',
          priority: 'high',
          title: `${goal.title} - Behind Schedule`,
          message: `Your goal is ${(expectedProgress - progress).toFixed(0)}% behind. Save ₹${monthlyRequired.toFixed(0)}/month to catch up.`,
          action: {
            label: 'Adjust Goal',
            url: '/goals'
          },
          impact: {
            category: goal.title,
            value: monthlyRequired,
            description: `Increase monthly saving to ₹${monthlyRequired.toFixed(0)}`
          }
        });
      } else if (progress >= 100) {
        recommendations.push({
          type: 'goal',
          priority: 'low',
          title: `${goal.title} - Goal Achieved! 🎉`,
          message: `Congratulations! You've reached your goal of ₹${goal.target_amount}.`,
          action: {
            label: 'Set New Goal',
            url: '/goals'
          },
          impact: {
            category: goal.title,
            value: goal.current_amount,
            description: 'Goal completed'
          }
        });
      }
    }

    return recommendations;
  }

  /**
   * Identify savings opportunities
   */
  private async analyzeSavingsOpportunities(): Promise<AgentRecommendation[]> {
    const recommendations: AgentRecommendation[] = [];
    const { monthlyIncome, monthlyExpenses, savings } = this.context!;

    const savingsRate = (savings / monthlyIncome) * 100;

    if (savingsRate < 20) {
      // Analyze categories to find optimization opportunities
      const categorySpending = await this.getCategoryBreakdown();
      const highSpendingCategories = Object.entries(categorySpending)
        .filter(([_, amount]) => (amount as number) / monthlyExpenses > 0.25)
        .sort(([_, a], [__, b]) => (b as number) - (a as number));

      if (highSpendingCategories.length > 0) {
        const [category, amount] = highSpendingCategories[0];
        const potentialSavings = (amount as number) * 0.15; // 15% reduction potential

        recommendations.push({
          type: 'savings',
          priority: 'medium',
          title: 'Optimize Your Spending',
          message: `Your ${category} spending is high at ₹${(amount as number).toFixed(0)}/month. Reducing by 15% could save ₹${potentialSavings.toFixed(0)}/month.`,
          action: {
            label: 'View Analytics',
            url: '/analytics'
          },
          impact: {
            category,
            value: potentialSavings,
            description: `Potential monthly savings: ₹${potentialSavings.toFixed(0)}`
          }
        });
      }
    }

    return recommendations;
  }

  /**
   * Detect and alert on spending anomalies
   */
  private async analyzeAnomalies(): Promise<AgentRecommendation[]> {
    const recommendations: AgentRecommendation[] = [];
    const recentTransactions = this.context!.recentTransactions.slice(0, 10);

    for (const transaction of recentTransactions) {
      if (transaction.is_anomaly) {
        recommendations.push({
          type: 'risk',
          priority: 'medium',
          title: 'Unusual Spending Detected',
          message: `Your recent ${transaction.category} expense of ₹${transaction.amount} is unusually high.`,
          action: {
            label: 'Review Transaction',
            url: '/analytics'
          },
          impact: {
            category: transaction.category,
            value: transaction.amount,
            description: 'Anomalous transaction detected'
          }
        });
      }
    }

    return recommendations;
  }

  /**
   * Analyze tax saving opportunities
   */
  private async analyzeTaxOpportunities(): Promise<AgentRecommendation[]> {
    const recommendations: AgentRecommendation[] = [];
    const { monthlyIncome } = this.context!;
    const annualIncome = monthlyIncome * 12;

    // Indian tax slabs (simplified)
    if (annualIncome > 1000000) { // > 10L
      const potentialTaxSavings = 150000 * 0.3; // Max 80C deduction at 30% tax rate

      recommendations.push({
        type: 'tax',
        priority: 'high',
        title: 'Tax Saving Opportunity',
        message: `You could save up to ₹${potentialTaxSavings.toFixed(0)} in taxes with 80C investments.`,
        action: {
          label: 'Explore Tax Savings',
          url: '/settings'
        },
        impact: {
          category: 'Tax',
          value: potentialTaxSavings,
          description: `Potential tax savings: ₹${potentialTaxSavings.toFixed(0)}`
        }
      });
    }

    return recommendations;
  }

  /**
   * Calculate cashflow health score
   */
  async calculateHealthScore(): Promise<number> {
    if (!this.context) {
      await this.initialize(this.context?.userId || '');
    }

    const { monthlyIncome, monthlyExpenses, savings, debts } = this.context!;
    const liquidity = savings;

    const scoreData = mlEngine.calculateCashflowScore({
      monthlyIncome,
      monthlyExpenses,
      savings,
      debts,
      liquidity
    });

    // Store score in database
    await supabase.from('cashflow_scores').insert({
      user_id: this.context!.userId,
      score: scoreData.score,
      income_score: scoreData.breakdown.income,
      expense_score: scoreData.breakdown.expense,
      savings_score: scoreData.breakdown.savings,
      debt_score: scoreData.breakdown.debt,
      liquidity_score: scoreData.breakdown.liquidity,
      trend: scoreData.trend,
      recommendations: scoreData.recommendations,
      score_date: new Date().toISOString().split('T')[0]
    });

    return scoreData.score;
  }

  // Helper methods
  private async getMonthlyIncome(userId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const { data } = await supabase
      .from('income')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', startOfMonth.toISOString().split('T')[0]);

    return (data || []).reduce((sum, item) => sum + item.amount, 0);
  }

  private async getMonthlyExpenses(userId: string): Promise<{ total: number; byCategory: Record<string, number> }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const { data } = await supabase
      .from('expenses')
      .select('amount, category')
      .eq('user_id', userId)
      .gte('date', startOfMonth.toISOString().split('T')[0]);

    const byCategory: Record<string, number> = {};
    let total = 0;

    (data || []).forEach(item => {
      total += item.amount;
      byCategory[item.category] = (byCategory[item.category] || 0) + item.amount;
    });

    return { total, byCategory };
  }

  private async getGoals(userId: string): Promise<any[]> {
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    return data || [];
  }

  private async getBudgets(userId: string): Promise<any[]> {
    const { data } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    return data || [];
  }

  private async getTotalDebts(userId: string): Promise<number> {
    const { data } = await supabase
      .from('bills_emis')
      .select('remaining_amount')
      .eq('user_id', userId)
      .in('type', ['loan', 'emi']);

    return (data || []).reduce((sum, item) => sum + (item.remaining_amount || 0), 0);
  }

  private async getUserPreferences(userId: string): Promise<any> {
    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    return data;
  }

  private async getCategoryBreakdown(): Promise<Record<string, number>> {
    const { byCategory } = await this.getMonthlyExpenses(this.context!.userId);
    return byCategory;
  }
}

// Singleton instance
export const agentService = new AgentService();
