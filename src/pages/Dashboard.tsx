import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { StreakBadge } from "@/components/StreakBadge";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseCharts } from "@/components/ExpenseCharts";
import { AIChatbot } from "@/components/AIChatbot";
import { HealthScoreCard } from "@/components/HealthScoreCard";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "@/hooks/useExpenses";
import { useIncome } from "@/hooks/useIncome";
import { agentService } from "@/lib/ai/agent-service";
import { mlEngine } from "@/lib/ai/ml-engine";
import { useFinancialStore } from "@/store/useFinancialStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [healthScore, setHealthScore] = useState(0);
  const [scoreBreakdown, setScoreBreakdown] = useState({ income: 0, expense: 0, savings: 0, debt: 0, liquidity: 0 });
  const [scoreTrend, setScoreTrend] = useState<'improving' | 'stable' | 'declining'>('stable');
  const [userName, setUserName] = useState<string>('');
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const navigate = useNavigate();

  const { expenses, monthlyTotal: monthlyExpenses } = useExpenses();
  const { monthlyTotal: monthlyIncome } = useIncome();
  const { recommendations, updateRecommendations, updateScore, updateFinancials } = useFinancialStore();

  // Fetch user info and show welcome message
  useEffect(() => {
    const showWelcomeMessage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || hasShownWelcome) return;

        // Get user name from metadata or email
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'there';
        const firstName = fullName.split(' ')[0];
        setUserName(firstName);

        // Get current time for greeting
        const hour = new Date().getHours();
        let greeting = 'Good morning';
        if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
        else if (hour >= 17) greeting = 'Good evening';

        // AI welcome messages based on time of day and user data
        const welcomeMessages = [
          `${greeting}, ${firstName}! 🌟 Ready to take control of your finances today?`,
          `Welcome back, ${firstName}! 💰 Let's make smart money moves together.`,
          `${greeting}! 👋 I'm here to help you achieve your financial goals, ${firstName}.`,
          `Hey ${firstName}! 🚀 Your financial journey continues. Let's see what we can accomplish today!`,
        ];

        const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

        // Show welcome toast after a short delay
        setTimeout(() => {
          toast.success(randomMessage, {
            description: 'Track expenses, monitor budgets, and earn rewards as you manage your money.',
            duration: 5000,
          });
        }, 500);

        setHasShownWelcome(true);
      } catch (error) {
        console.error('Error showing welcome message:', error);
      }
    };

    showWelcomeMessage();
  }, [hasShownWelcome]);

  useEffect(() => {
    updateFinancials(monthlyIncome, monthlyExpenses);
  }, [monthlyIncome, monthlyExpenses]);

  // Calculate health score and get recommendations
  useEffect(() => {
    const calculateHealthAndRecommendations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Calculate cashflow health score only if user has data
        const scoreData = mlEngine.calculateCashflowScore({
          monthlyIncome: monthlyIncome || 0,
          monthlyExpenses: monthlyExpenses || 0,
          savings: Math.max(0, (monthlyIncome || 0) - (monthlyExpenses || 0)),
          debts: 0,
          liquidity: Math.max(0, (monthlyIncome || 0) - (monthlyExpenses || 0)) * 3
        });

        setHealthScore(scoreData.score);
        setScoreBreakdown(scoreData.breakdown);
        setScoreTrend(scoreData.trend);
        updateScore(scoreData.score, scoreData.trend);

        // Generate AI recommendations
        await agentService.initialize(user.id);
        const recs = await agentService.generateRecommendations();
        updateRecommendations(recs);
      } catch (error) {
        console.log('AI features will be available once you add more data', error);
      }
    };

    // Always calculate initial score
    calculateHealthAndRecommendations();
  }, [monthlyIncome, monthlyExpenses]);

  const handleExpenseAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const stats = {
    monthlyExpenses: monthlyExpenses || 0,
    monthlyIncome: monthlyIncome || 0,
    savingsRate: monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0,
    budgetUsed: monthlyIncome > 0 ? Math.round((monthlyExpenses / monthlyIncome) * 100) : 0,
    weeklyChange: 0,
  };

  const recentTransactions = expenses?.slice(0, 4).map(e => ({
    id: e.id,
    description: e.description || e.category,
    amount: e.amount,
    category: e.category,
    date: new Date(e.date).toLocaleDateString()
  })) || [];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">
              {userName ? (
                <>
                  Welcome back, <span className="bg-gradient-primary bg-clip-text text-transparent">{userName}</span>! 👋
                </>
              ) : (
                <>
                  Welcome to <span className="bg-gradient-primary bg-clip-text text-transparent">CashFlow AI</span>
                </>
              )}
            </h1>
            <p className="text-muted-foreground">
              Track your expenses, earn streaks, and get AI-powered insights
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-scale-in">
            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.monthlyExpenses.toLocaleString()}</div>
                {stats.weeklyChange !== 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    {stats.weeklyChange < 0 ? (
                      <>
                        <TrendingDown className="h-3 w-3 text-green-500" />
                        <span className="text-green-500">{Math.abs(stats.weeklyChange)}% vs last week</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-3 w-3 text-red-500" />
                        <span className="text-red-500">+{stats.weeklyChange}% vs last week</span>
                      </>
                    )}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.budgetUsed}%</div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all" 
                    style={{ width: `${stats.budgetUsed}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats.savingsRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">Of monthly income</p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => navigate("/analytics")}
                >
                  View Analytics
                  <ArrowRight className="ml-auto h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* AI Health Score and Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <HealthScoreCard
              score={healthScore || 0}
              trend={scoreTrend}
              breakdown={scoreBreakdown}
              recommendations={mlEngine.calculateCashflowScore({
                monthlyIncome: stats.monthlyIncome,
                monthlyExpenses: stats.monthlyExpenses,
                savings: Math.max(0, stats.monthlyIncome - stats.monthlyExpenses),
                debts: 0,
                liquidity: Math.max(0, stats.monthlyIncome - stats.monthlyExpenses) * 3
              }).recommendations}
            />
            <RecommendationsPanel recommendations={recommendations} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <StreakBadge />
              <ExpenseForm onSuccess={handleExpenseAdded} />
              
              {/* Recent Transactions */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Recent Transactions</CardTitle>
                      <CardDescription>Your latest spending activity</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate("/analytics")}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                        <div className="flex-1">
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.category} · {transaction.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${transaction.amount.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div key={refreshKey}>
                <ExpenseCharts />
              </div>
            </div>

            <div className="lg:col-span-1">
              <AIChatbot />
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
