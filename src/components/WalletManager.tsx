import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useWallets, Wallet } from "@/hooks/useWallets";
import { PlusCircle, Wallet as WalletIcon, CreditCard, Smartphone, Building, TrendingUp, Trash2, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

const walletIcons = {
  bank: Building,
  cash: WalletIcon,
  credit_card: CreditCard,
  upi: Smartphone,
  digital_wallet: Smartphone,
  investment: TrendingUp
};

const walletColors = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#14B8A6'
];

export function WalletManager() {
  const { wallets, addWallet, updateWallet, deleteWallet, totalBalance, isLoading } = useWallets();
  const [isOpen, setIsOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank' as const,
    balance: '',
    color: walletColors[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingWallet) {
      await updateWallet.mutateAsync({
        id: editingWallet.id,
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance),
        color: formData.color
      });
    } else {
      await addWallet.mutateAsync({
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance),
        color: formData.color
      });
    }

    setIsOpen(false);
    setEditingWallet(null);
    setFormData({ name: '', type: 'bank', balance: '', color: walletColors[0] });
  };

  const handleEdit = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setFormData({
      name: wallet.name,
      type: wallet.type,
      balance: wallet.balance.toString(),
      color: wallet.color || walletColors[0]
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this wallet?')) {
      await deleteWallet.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading wallets...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Wallets & Accounts</h2>
          <p className="text-sm text-muted-foreground">Manage your financial accounts</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingWallet ? 'Edit Wallet' : 'Add New Wallet'}</DialogTitle>
              <DialogDescription>
                {editingWallet ? 'Update your wallet details' : 'Create a new wallet or account to track'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Wallet Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., HDFC Savings"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Account Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Account</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="upi">UPI/Digital Wallet</SelectItem>
                    <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                    <SelectItem value="investment">Investment Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="balance">Current Balance (₹)</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {walletColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        formData.color === color ? "border-foreground scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingWallet ? 'Update Wallet' : 'Create Wallet'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total Balance Card */}
      <Card className="bg-gradient-primary text-white">
        <CardHeader>
          <CardTitle className="text-white">Total Balance</CardTitle>
          <CardDescription className="text-white/80">Across all accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">₹{totalBalance.toLocaleString()}</div>
          <p className="text-sm text-white/80 mt-2">{wallets?.length || 0} active accounts</p>
        </CardContent>
      </Card>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets?.map((wallet) => {
          const Icon = walletIcons[wallet.type];
          return (
            <Card key={wallet.id} className="hover-lift">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: wallet.color + '20' }}
                    >
                      <Icon className="h-5 w-5" style={{ color: wallet.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{wallet.name}</CardTitle>
                      <CardDescription className="capitalize">
                        {wallet.type.replace('_', ' ')}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">{wallet.currency}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold">₹{wallet.balance.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((wallet.balance / totalBalance) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEdit(wallet)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => handleDelete(wallet.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {wallets?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <WalletIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No wallets added yet</p>
            <Button onClick={() => setIsOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Your First Wallet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
