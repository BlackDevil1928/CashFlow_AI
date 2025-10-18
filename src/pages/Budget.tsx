import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlusCircle, AlertCircle, CheckCircle, TrendingUp, Wallet, RefreshCw, Trash2, Bell, BellOff } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useBudgets } from '@/hooks/useBudgets';
import { useExpenses } from '@/hooks/useExpenses';

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍔',
  transport: '🚗',
  shopping: '🛍️',
  entertainment: '🎬',
  bills: '📄',
  health: '🏥',
  education: '📚',
  travel: '✈️',
  fitness: '💪',
  personal: '👤',
  gifts: '🎁',
  other: '💰',
};

const CATEGORY_COLORS: Record<string, string> = {
  food: '#8B5CF6',
  transport: '#6366F1',
  shopping: '#D946EF',
  entertainment: '#EC4899',
  bills: '#F59E0B',
  health: '#EF4444',
  education: '#3B82F6',
  travel: '#10B981',
  fitness: '#F97316',
  personal: '#8B5CF6',
  gifts: '#EC4899',
  other: '#6B7280',
};

export default function Budget() {
  const { budgets, loading, alerts, addBudget, updateBudget, deleteBudget, resetBudgets, totalBudget, totalSpent, totalRemaining } = useBudgets();
  const { expenses, categoryBreakdown } = useExpenses();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newPeriod, setNewPeriod] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [alertThreshold, setAlertThreshold] = useState("80");

  // Sync spent amounts with actual expenses
  useEffect(() => {
    if (budgets.length > 0 && categoryBreakdown) {
      budgets.forEach((budget) => {
        const actualSpent = categoryBreakdown[budget.category.toLowerCase()] || 0;
        if (actualSpent !== budget.spent) {
          updateBudget(budget.id, { spent: actualSpent });
        }
      });
    }
  }, [categoryBreakdown]);

  const calculatePercentage = (spent: number, budget: number) => {
    return (spent / budget) * 100;
  };

  const getStatusColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return "text-red-500";
    if (percentage >= 80) return "text-yellow-500";
    return "text-green-500";
  };

  const getStatusIcon = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (percentage >= 80) return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getCategoryIcon = (category: string) => {
    return CATEGORY_ICONS[category.toLowerCase()] || '💰';
  };

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category.toLowerCase()] || '#6B7280';
  };

  const handleAddBudget = async () => {
    if (!newCategory || !newAmount) {
      toast.error("Please fill in all fields");
      return;
    }

    await addBudget(
      newCategory,
      parseFloat(newAmount),
      newPeriod,
      parseFloat(alertThreshold)
    );

    setNewCategory("");
    setNewAmount("");
    setNewPeriod('monthly');
    setAlertThreshold("80");
    setIsDialogOpen(false);
  };

  const handleToggleAlerts = async (id: string, currentValue: boolean) => {
    await updateBudget(id, { alert_enabled: !currentValue });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      await deleteBudget(id);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          <div className="flex justify-between items-start animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-primary bg-clip-text text-transparent">Budget</span> Management
              </h1>
              <p className="text-muted-foreground">
                Track and manage your spending limits by category with AI alerts
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={resetBudgets} disabled={loading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Period
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary hover:opacity-90">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Budget
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Budget</DialogTitle>
                  <DialogDescription>
                    Set a spending limit for a new category
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food">Food & Dining</SelectItem>
                        <SelectItem value="transport">Transportation</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="bills">Bills & Utilities</SelectItem>
                        <SelectItem value="health">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="personal">Personal Care</SelectItem>
                        <SelectItem value="gifts">Gifts</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Budget Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="5000"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period">Period</Label>
                    <Select value={newPeriod} onValueChange={(v: any) => setNewPeriod(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="threshold">Alert Threshold (%)</Label>
                    <Input
                      id="threshold"
                      type="number"
                      placeholder="80"
                      value={alertThreshold}
                      onChange={(e) => setAlertThreshold(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Get notified when spending reaches this percentage
                    </p>
                  </div>
                  <Button onClick={handleAddBudget} className="w-full">
                    Create Budget
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          </div>

          {/* AI Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-3 animate-fade-in">
              {alerts.map((alert, idx) => (
                <Alert key={idx} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{alert.category}</strong>: {alert.percentage.toFixed(0)}% of budget used
                    (₹{alert.spent.toLocaleString()} / ₹{alert.budget.toLocaleString()})
                    {alert.severity === 'critical' ? ' - Budget exceeded!' : ' - Approaching limit'}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-scale-in">
            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalBudget.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{budgets[0]?.period || 'monthly'} total</p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</div>
                <Progress value={(totalSpent / totalBudget) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                <CheckCircle className={`h-4 w-4 ${totalRemaining > 0 ? 'text-green-500' : 'text-red-500'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalRemaining > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ₹{Math.abs(totalRemaining).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalRemaining > 0 ? 'Under budget' : 'Over budget'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Budget Items */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Budget Categories</h2>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading budgets...</div>
            ) : budgets.length === 0 ? (
              <Card className="shadow-elegant">
                <CardContent className="py-12 text-center">
                  <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No budgets created yet</p>
                  <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-primary">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Budget
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {budgets.map((item) => {
                  const percentage = calculatePercentage(item.spent, item.amount);
                  const remaining = item.amount - item.spent;
                  const color = getCategoryColor(item.category);

                  return (
                    <Card key={item.id} className="shadow-elegant hover-lift">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{getCategoryIcon(item.category)}</div>
                            <div>
                              <CardTitle className="capitalize">{item.category}</CardTitle>
                              <CardDescription>
                                ₹{item.spent.toLocaleString()} of ₹{item.amount.toLocaleString()}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleToggleAlerts(item.id, item.alert_enabled)}
                              title={item.alert_enabled ? 'Disable alerts' : 'Enable alerts'}
                            >
                              {item.alert_enabled ? (
                                <Bell className="h-4 w-4 text-blue-500" />
                              ) : (
                                <BellOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(item.id)}
                              title="Delete budget"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                            {getStatusIcon(item.spent, item.amount)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Progress value={Math.min(percentage, 100)} className="h-3" style={{ 
                          backgroundColor: `${color}20`,
                        }} />
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {percentage.toFixed(0)}% used • {item.period}
                          </span>
                          <span className={getStatusColor(item.spent, item.amount)}>
                            ₹{Math.abs(remaining).toLocaleString()} {remaining >= 0 ? 'left' : 'over'}
                          </span>
                        </div>

                        {percentage >= (item.alert_threshold * 100) && item.alert_enabled && (
                          <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                            percentage >= 100
                              ? 'text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-950'
                              : 'text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                          }`}>
                            <AlertCircle className="h-4 w-4" />
                            <span>
                              {percentage >= 100 ? 'Budget exceeded!' : `Approaching ${item.alert_threshold}% limit`}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
