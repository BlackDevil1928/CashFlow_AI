import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Calendar, PieChartIcon, Loader2 } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { useIncome } from "@/hooks/useIncome";
import { useBudgets } from "@/hooks/useBudgets";
import { useMemo } from "react";
import { AnalyticsMetricSkeleton, ChartSkeleton } from "@/components/SkeletonLoaders";

const CATEGORY_COLORS: Record<string, string> = {
  food: "#8B5CF6",
  transport: "#6366F1",
  entertainment: "#D946EF",
  bills: "#F59E0B",
  shopping: "#EC4899",
  health: "#EF4444",
  education: "#3B82F6",
  investment: "#10B981",
  emi: "#F97316",
  insurance: "#14B8A6",
  travel: "#06B6D4",
  groceries: "#84CC16",
  utilities: "#EAB308",
  personal_care: "#A855F7",
  gifts: "#EC4899",
  other: "#6B7280"
};

export default function Analytics() {
  const { expenses, isLoading: expensesLoading, categoryBreakdown } = useExpenses();
  const { incomes, isLoading: incomeLoading, monthlyTotal: currentMonthIncome } = useIncome();
  const { budgets } = useBudgets();

  // Calculate monthly data for last 6 months
  const monthlyData = useMemo(() => {
    // Always generate 6-month structure, even with no data
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      
      let monthExpenses = 0;
      let monthIncome = 0;
      
      // Only calculate if data exists
      if (expenses && expenses.length > 0) {
        monthExpenses = expenses.filter(e => {
          const expDate = new Date(e.date);
          return expDate.getMonth() === monthDate.getMonth() && 
                 expDate.getFullYear() === monthDate.getFullYear();
        }).reduce((sum, e) => sum + e.amount, 0);
      }
      
      if (incomes && incomes.length > 0) {
        monthIncome = incomes.filter(i => {
          const incDate = new Date(i.date);
          return incDate.getMonth() === monthDate.getMonth() && 
                 incDate.getFullYear() === monthDate.getFullYear();
        }).reduce((sum, i) => sum + i.amount, 0);
      }
      
      last6Months.push({
        month: monthName,
        expenses: monthExpenses,
        income: monthIncome,
        savings: monthIncome - monthExpenses
      });
    }
    
    return last6Months;
  }, [expenses, incomes]);

  // Calculate category data from actual expenses
  const categoryData = useMemo(() => {
    if (!categoryBreakdown) return [];
    
    const total = Object.values(categoryBreakdown).reduce((sum, val) => sum + val, 0);
    if (total === 0) return [];
    
    return Object.entries(categoryBreakdown)
      .map(([category, amount]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
        value: amount,
        percentage: ((amount / total) * 100).toFixed(1),
        color: CATEGORY_COLORS[category] || "#6B7280"
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories
  }, [categoryBreakdown]);

  // Calculate weekly trend (last 7 days)
  const weeklyTrend = useMemo(() => {
    if (!expenses) return [];
    
    const last7Days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date(now);
      dayDate.setDate(now.getDate() - i);
      const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayExpenses = expenses.filter(e => {
        const expDate = new Date(e.date);
        return expDate.toDateString() === dayDate.toDateString();
      }).reduce((sum, e) => sum + e.amount, 0);
      
      last7Days.push({
        day: dayName,
        amount: dayExpenses
      });
    }
    
    return last7Days;
  }, [expenses]);

  // Calculate metrics
  const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const avgMonthly = monthlyData.length > 0 
    ? monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthlyData.length 
    : 0;
  const highestCategory = categoryData.length > 0 ? categoryData[0].name : "N/A";
  const highestCategoryPercent = categoryData.length > 0 ? categoryData[0].percentage : 0;
  
  // Calculate trend (compare last 2 months)
  const trend = monthlyData.length >= 2 
    ? monthlyData[monthlyData.length - 1].expenses < monthlyData[monthlyData.length - 2].expenses 
      ? "down" 
      : "up"
    : "neutral";
  
  const trendPercent = monthlyData.length >= 2
    ? Math.abs(
        ((monthlyData[monthlyData.length - 1].expenses - monthlyData[monthlyData.length - 2].expenses) / 
        monthlyData[monthlyData.length - 2].expenses) * 100
      ).toFixed(0)
    : 0;

  if (expensesLoading || incomeLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8 space-y-8">
            <div className="animate-fade-in">
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-primary bg-clip-text text-transparent">Analytics</span> Dashboard
              </h1>
              <p className="text-muted-foreground">
                Deep insights into your spending patterns and financial health
              </p>
            </div>
            
            {/* Skeleton Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-scale-in">
              <AnalyticsMetricSkeleton />
              <AnalyticsMetricSkeleton />
              <AnalyticsMetricSkeleton />
              <AnalyticsMetricSkeleton />
            </div>

            {/* Skeleton Charts */}
            <ChartSkeleton />
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-primary bg-clip-text text-transparent">Analytics</span> Dashboard
            </h1>
            <p className="text-muted-foreground">
              Deep insights into your spending patterns and financial health
            </p>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-scale-in">
            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{Math.round(avgMonthly).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Last 6 months avg</p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                <PieChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{highestCategory}</div>
                <p className="text-xs text-muted-foreground">{highestCategoryPercent}% of total</p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Spending Trend</CardTitle>
                {trend === "down" ? (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${trend === 'down' ? 'text-green-500' : 'text-red-500'}`}>
                  {trend === 'down' ? '-' : '+'}{trendPercent}%
                </div>
                <p className="text-xs text-muted-foreground">vs last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Monthly Expenses vs Income</CardTitle>
                  <CardDescription>Comparison of your monthly cash flow</CardDescription>
                </CardHeader>
                <CardContent>
                  {(expenses?.length === 0 && incomes?.length === 0) ? (
                    <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
                      <DollarSign className="h-12 w-12 mb-4 opacity-50" />
                      <p className="text-lg font-medium">No financial data yet</p>
                      <p className="text-sm">Start by adding expenses and income to see your analytics</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="expenses" fill="#8B5CF6" name="Expenses" />
                        <Bar dataKey="income" fill="#10B981" name="Income" />
                        <Bar dataKey="savings" fill="#6366F1" name="Savings" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle>Expense Distribution</CardTitle>
                    <CardDescription>Breakdown by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ percentage }) => `${percentage}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                        No expense data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle>Category Details</CardTitle>
                    <CardDescription>Spending by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoryData.length > 0 ? (
                      <div className="space-y-4">
                        {categoryData.map((category) => (
                          <div key={category.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="font-medium">{category.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-muted-foreground">{category.percentage}%</span>
                              <span className="font-bold">₹{category.value.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 text-muted-foreground">
                        No expense data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Weekly Spending Trend</CardTitle>
                  <CardDescription>Your spending pattern over the last week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={weeklyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={{ fill: "#8B5CF6", r: 6 }}
                        name="Daily Expenses (₹)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  );
}
