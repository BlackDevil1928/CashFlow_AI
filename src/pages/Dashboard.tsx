import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { StreakBadge } from "@/components/StreakBadge";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseCharts } from "@/components/ExpenseCharts";
import { AIChatbot } from "@/components/AIChatbot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const handleExpenseAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Mock data for quick stats - in production, fetch from Supabase
  const stats = {
    monthlyExpenses: 2450,
    budgetUsed: 68,
    savingsRate: 22,
    weeklyChange: -12,
  };

  const recentTransactions = [
    { id: 1, description: "Grocery Store", amount: 85.50, category: "Food", date: "Today" },
    { id: 2, description: "Gas Station", amount: 45.00, category: "Transport", date: "Yesterday" },
    { id: 3, description: "Netflix Subscription", amount: 15.99, category: "Entertainment", date: "2 days ago" },
    { id: 4, description: "Restaurant", amount: 67.80, category: "Food", date: "3 days ago" },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">
              Welcome to <span className="bg-gradient-primary bg-clip-text text-transparent">ExpenseMuse AI</span>
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
