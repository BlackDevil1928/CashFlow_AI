import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useIncome, Income } from "@/hooks/useIncome";
import { useWallets } from "@/hooks/useWallets";
import { PlusCircle, TrendingUp, DollarSign, Calendar, Trash2, Briefcase, Building2, Coins, TrendingDown } from "lucide-react";
import { format } from "date-fns";

const sourceIcons = {
  salary: Briefcase,
  freelance: Building2,
  business: Building2,
  investment: TrendingUp,
  rental: Building2,
  side_hustle: Coins,
  passive: TrendingDown,
  other: DollarSign
};

export function IncomeTracker() {
  const { incomes, addIncome, deleteIncome, monthlyTotal, isLoading } = useIncome();
  const { wallets } = useWallets();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    source: 'salary' as const,
    description: '',
    date: new Date().toISOString().split('T')[0],
    wallet_id: '',
    is_recurring: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addIncome.mutateAsync({
      amount: parseFloat(formData.amount),
      source: formData.source,
      description: formData.description,
      date: formData.date,
      wallet_id: formData.wallet_id || undefined,
      is_recurring: formData.is_recurring
    });

    setIsOpen(false);
    setFormData({
      amount: '',
      source: 'salary',
      description: '',
      date: new Date().toISOString().split('T')[0],
      wallet_id: '',
      is_recurring: false
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this income entry?')) {
      await deleteIncome.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading income...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Income Tracker</h2>
          <p className="text-sm text-muted-foreground">Track all your income sources</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Income
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Income</DialogTitle>
              <DialogDescription>
                Record a new income transaction
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select value={formData.source} onValueChange={(value: any) => setFormData({ ...formData, source: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="rental">Rental Income</SelectItem>
                    <SelectItem value="side_hustle">Side Hustle</SelectItem>
                    <SelectItem value="passive">Passive Income</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {wallets && wallets.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="wallet">Wallet (Optional)</Label>
                  <Select value={formData.wallet_id} onValueChange={(value) => setFormData({ ...formData, wallet_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="e.g., Monthly salary from Company XYZ"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.is_recurring}
                  onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="recurring" className="cursor-pointer">
                  This is recurring income
                </Label>
              </div>

              <Button type="submit" className="w-full">
                Add Income
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-success text-white">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{monthlyTotal.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incomes?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Income transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recurring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {incomes?.filter(i => i.is_recurring).length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Regular income sources</p>
          </CardContent>
        </Card>
      </div>

      {/* Income List */}
      <Card>
        <CardHeader>
          <CardTitle>Income History</CardTitle>
          <CardDescription>All your income transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {incomes && incomes.length > 0 ? (
            <div className="space-y-4">
              {incomes.map((income) => {
                const Icon = sourceIcons[income.source];
                return (
                  <div
                    key={income.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                        <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold capitalize">
                            {income.source.replace('_', ' ')}
                          </p>
                          {income.is_recurring && (
                            <Badge variant="secondary" className="text-xs">Recurring</Badge>
                          )}
                        </div>
                        {income.description && (
                          <p className="text-sm text-muted-foreground">{income.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(income.date), 'dd MMM yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          +₹{income.amount.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => handleDelete(income.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">No income entries yet</p>
              <Button onClick={() => setIsOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Your First Income
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
