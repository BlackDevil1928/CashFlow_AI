import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Gift, Star, ShoppingBag, Percent, TrendingUp, Crown, Zap, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUserPoints } from "@/hooks/useUserPoints";

interface Voucher {
  id: string;
  brand: string;
  value: number;
  pointsCost: number;
  image: string;
  category: string;
  discount?: string;
  stock: number;
}

const vouchers: Voucher[] = [
  {
    id: "1",
    brand: "Amazon",
    value: 25,
    pointsCost: 2500,
    image: "🛒",
    category: "E-commerce",
    discount: "10% off",
    stock: 50
  },
  {
    id: "2",
    brand: "Starbucks",
    value: 15,
    pointsCost: 1500,
    image: "☕",
    category: "Food & Beverage",
    stock: 100
  },
  {
    id: "3",
    brand: "Netflix",
    value: 20,
    pointsCost: 2000,
    image: "🎬",
    category: "Entertainment",
    discount: "1 Month Free",
    stock: 75
  },
  {
    id: "4",
    brand: "Spotify",
    value: 10,
    pointsCost: 1000,
    image: "🎵",
    category: "Entertainment",
    discount: "Premium Upgrade",
    stock: 120
  },
  {
    id: "5",
    brand: "Uber",
    value: 30,
    pointsCost: 3000,
    image: "🚗",
    category: "Transportation",
    stock: 60
  },
  {
    id: "6",
    brand: "Nike",
    value: 50,
    pointsCost: 5000,
    image: "👟",
    category: "Fashion",
    discount: "15% off",
    stock: 30
  },
  {
    id: "7",
    brand: "Apple Store",
    value: 100,
    pointsCost: 10000,
    image: "🍎",
    category: "Electronics",
    stock: 20
  },
  {
    id: "8",
    brand: "Zomato",
    value: 20,
    pointsCost: 2000,
    image: "🍕",
    category: "Food & Beverage",
    discount: "20% off",
    stock: 80
  },
  {
    id: "9",
    brand: "BookMyShow",
    value: 15,
    pointsCost: 1500,
    image: "🎭",
    category: "Entertainment",
    stock: 90
  }
];

export default function Redemption() {
  const { gamification, loading, redemptionHistory, redeemVoucher, addPoints } = useUserPoints();
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeemVoucher = async (voucher: Voucher) => {
    setIsRedeeming(true);
    const success = await redeemVoucher(voucher.id, voucher.pointsCost);
    
    if (success) {
      toast.success(`Successfully redeemed ${voucher.brand} voucher!`, {
        description: `You've spent ${voucher.pointsCost} points for a $${voucher.value} voucher`,
        duration: 5000
      });
      setIsDialogOpen(false);
      setSelectedVoucher(null);
    }
    setIsRedeeming(false);
  };

  const categories = Array.from(new Set(vouchers.map(v => v.category)));
  
  // Calculate points data from gamification
  const totalPoints = gamification?.total_points || 0;
  const spentPoints = redemptionHistory.reduce((sum, r) => sum + r.points_spent, 0);
  const availablePoints = totalPoints;
  const redeemedVoucherIds = redemptionHistory.map(r => r.voucher_id);

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-500" />
              <p className="text-muted-foreground">Loading your rewards...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="animate-fade-in flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-primary bg-clip-text text-transparent">Rewards</span> Center
              </h1>
              <p className="text-muted-foreground">
                Redeem your points for exciting vouchers and gift cards
              </p>
            </div>
            {/* Demo: Add points button (remove in production) */}
            <Button 
              variant="outline"
              onClick={() => addPoints(1000, "demo test")}
              className="border-purple-500/50 hover:bg-purple-500/10"
            >
              <Star className="mr-2 h-4 w-4" />
              Add 1000 Points (Demo)
            </Button>
          </div>

          {/* Points Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-scale-in">
            <Card className="shadow-elegant hover-lift border-2 border-purple-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Points</CardTitle>
                <Crown className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {availablePoints.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Ready to redeem</p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalPoints.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Lifetime points</p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Points Spent</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{spentPoints.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">{redemptionHistory.length} vouchers redeemed</p>
              </CardContent>
            </Card>
          </div>

          {/* How to Earn Points */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                How to Earn More Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-purple-500/5 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-sm">Daily Check-in</p>
                    <p className="text-xs text-muted-foreground">+50 points</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-500/5 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-sm">Track Expenses</p>
                    <p className="text-xs text-muted-foreground">+10 points each</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-500/5 rounded-lg">
                  <Check className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-sm">Complete Goals</p>
                    <p className="text-xs text-muted-foreground">+500 points</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-500/5 rounded-lg">
                  <Crown className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-sm">Monthly Streak</p>
                    <p className="text-xs text-muted-foreground">+1000 points</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voucher Categories */}
          {categories.map(category => {
            const categoryVouchers = vouchers.filter(v => v.category === category);
            
            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{category}</h2>
                  <Badge variant="secondary">{categoryVouchers.length} vouchers</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryVouchers.map(voucher => {
                    const isRedeemed = redeemedVoucherIds.includes(voucher.id);
                    const canAfford = availablePoints >= voucher.pointsCost;
                    
                    return (
                      <Card 
                        key={voucher.id} 
                        className={`shadow-elegant hover-lift transition-all ${
                          isRedeemed ? 'opacity-60' : ''
                        } ${canAfford ? 'border-purple-500/30' : 'border-muted'}`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-4xl">{voucher.image}</div>
                              <div>
                                <CardTitle className="text-lg">{voucher.brand}</CardTitle>
                                <CardDescription className="text-xs">{voucher.category}</CardDescription>
                              </div>
                            </div>
                            {voucher.discount && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                                <Percent className="h-3 w-3 mr-1" />
                                {voucher.discount}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold">${voucher.value}</p>
                              <p className="text-xs text-muted-foreground">Value</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-purple-600">{voucher.pointsCost}</p>
                              <p className="text-xs text-muted-foreground">Points needed</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">In Stock: {voucher.stock}</span>
                            {isRedeemed && (
                              <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                                <Check className="h-3 w-3 mr-1" />
                                Redeemed
                              </Badge>
                            )}
                          </div>

                          <Dialog open={isDialogOpen && selectedVoucher?.id === voucher.id} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                className="w-full bg-gradient-primary hover:opacity-90"
                                disabled={!canAfford || isRedeemed}
                                onClick={() => {
                                  setSelectedVoucher(voucher);
                                  setIsDialogOpen(true);
                                }}
                              >
                                {isRedeemed ? 'Already Redeemed' : canAfford ? 'Redeem Now' : 'Insufficient Points'}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Redemption</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to redeem this voucher?
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 pt-4">
                                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                                  <div className="text-5xl">{selectedVoucher?.image}</div>
                                  <div className="flex-1">
                                    <h3 className="font-bold text-lg">{selectedVoucher?.brand}</h3>
                                    <p className="text-sm text-muted-foreground">${selectedVoucher?.value} Value</p>
                                  </div>
                                </div>
                                
                                <div className="border-t border-b py-4 space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Points Cost:</span>
                                    <span className="font-bold">{selectedVoucher?.pointsCost}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Your Available Points:</span>
                                    <span className="font-bold">{availablePoints}</span>
                                  </div>
                                  <div className="flex justify-between text-purple-600">
                                    <span className="font-medium">After Redemption:</span>
                                    <span className="font-bold">{availablePoints - (selectedVoucher?.pointsCost || 0)}</span>
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => {
                                      setIsDialogOpen(false);
                                      setSelectedVoucher(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    className="flex-1 bg-gradient-primary hover:opacity-90"
                                    onClick={() => selectedVoucher && handleRedeemVoucher(selectedVoucher)}
                                    disabled={isRedeeming}
                                  >
                                    {isRedeeming ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Redeeming...
                                      </>
                                    ) : (
                                      "Confirm Redemption"
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </main>
      </div>
    </AuthGuard>
  );
}
