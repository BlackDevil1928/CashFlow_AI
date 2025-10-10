import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, AlertCircle, CheckCircle, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BudgetItem {
  id: string;
  category: string;
  budget: number;
  spent: number;
  icon: string;
  color: string;
}

const initialBudgets: BudgetItem[] = [
  { id: "1", category: "Food & Dining", budget: 600, spent: 450, icon: "🍔", color: "#8B5CF6" },
  { id: "2", category: "Transportation", budget: 200, spent: 180, icon: "🚗", color: "#6366F1" },
  { id: "3", category: "Shopping", budget: 300, spent: 320, icon: "🛍️", color: "#D946EF" },
  { id: "4", category: "Entertainment", budget: 150, spent: 95, icon: "🎬", color: "#EC4899" },
  { id: "5", category: "Bills & Utilities", budget: 400, spent: 380, icon: "📄", color: "#F59E0B" },
];

export default function Budget() {
  const [budgets, setBudgets] = useState<BudgetItem[]>(initialBudgets);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newBudget, setNewBudget] = useState("");

  const calculatePercentage = (spent: number, budget: number) => {
    return Math.min((spent / budget) * 100, 100);
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

  const totalBudget = budgets.reduce((sum, item) => sum + item.budget, 0);
  const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  const handleAddBudget = () => {
    if (!newCategory || !newBudget) {
      toast.error("Please fill in all fields");
      return;
    }

    const newBudgetItem: BudgetItem = {
      id: Date.now().toString(),
      category: newCategory,
      budget: parseFloat(newBudget),
      spent: 0,
      icon: "💰",
      color: "#6366F1",
    };

    setBudgets([...budgets, newBudgetItem]);
    setNewCategory("");
    setNewBudget("");
    setIsDialogOpen(false);
    toast.success("Budget added successfully!");
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
                Track and manage your spending limits by category
              </p>
            </div>

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
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Travel">Travel</SelectItem>
                        <SelectItem value="Fitness">Fitness</SelectItem>
                        <SelectItem value="Personal Care">Personal Care</SelectItem>
                        <SelectItem value="Gifts">Gifts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Monthly Budget ($)</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="500"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddBudget} className="w-full">
                    Create Budget
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-scale-in">
            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
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
                  ${Math.abs(totalRemaining).toLocaleString()}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {budgets.map((item) => {
                const percentage = calculatePercentage(item.spent, item.budget);
                const remaining = item.budget - item.spent;

                return (
                  <Card key={item.id} className="shadow-elegant hover-lift">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{item.icon}</div>
                          <div>
                            <CardTitle>{item.category}</CardTitle>
                            <CardDescription>
                              ${item.spent.toLocaleString()} of ${item.budget.toLocaleString()}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusIcon(item.spent, item.budget)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Progress value={percentage} className="h-3" style={{ 
                        backgroundColor: `${item.color}20`,
                      }} />
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {percentage.toFixed(0)}% used
                        </span>
                        <span className={getStatusColor(item.spent, item.budget)}>
                          ${Math.abs(remaining).toLocaleString()} {remaining >= 0 ? 'left' : 'over'}
                        </span>
                      </div>

                      {percentage >= 80 && (
                        <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
                          <AlertCircle className="h-4 w-4" />
                          <span>
                            {percentage >= 100 ? 'Budget exceeded!' : 'Approaching budget limit'}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
