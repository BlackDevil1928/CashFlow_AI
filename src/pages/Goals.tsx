import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Target, Trophy, Star, PlusCircle, Calendar, DollarSign, TrendingUp, Lightbulb } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useGoals } from "@/hooks/useGoals";
import { GoalCardSkeleton, DashboardCardSkeleton } from "@/components/SkeletonLoaders";

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

const initialGoals: Goal[] = [
  { id: "1", title: "Emergency Fund", targetAmount: 10000, currentAmount: 6500, deadline: "2025-12-31", icon: "🏦", color: "#6366F1" },
  { id: "2", title: "Vacation to Japan", targetAmount: 5000, currentAmount: 3200, deadline: "2026-06-30", icon: "✈️", color: "#8B5CF6" },
  { id: "3", title: "New Laptop", targetAmount: 2000, currentAmount: 1800, deadline: "2025-11-15", icon: "💻", color: "#EC4899" },
];

const achievements: Achievement[] = [
  { id: "1", title: "First Step", description: "Created your first expense", icon: "🎯", unlocked: true, unlockedDate: "2025-09-01" },
  { id: "2", title: "Week Warrior", description: "Tracked expenses for 7 days straight", icon: "🔥", unlocked: true, unlockedDate: "2025-09-15" },
  { id: "3", title: "Budget Master", description: "Stayed under budget for a month", icon: "🏆", unlocked: true, unlockedDate: "2025-10-01" },
  { id: "4", title: "Savings Star", description: "Saved $1000 in a month", icon: "⭐", unlocked: false },
  { id: "5", title: "Goal Crusher", description: "Completed your first savings goal", icon: "🎉", unlocked: false },
  { id: "6", title: "Century Club", description: "Logged 100 expenses", icon: "💯", unlocked: false },
];

export default function Goals() {
  const { activeGoals, completedGoals, loading, recommendations, addGoal, addContribution, deleteGoal, totalSaved, totalTarget, overallProgress } = useGoals();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isContribDialogOpen, setIsContribDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalAmount, setNewGoalAmount] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");

  const calculatePercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const handleAddGoal = async () => {
    if (!newGoalTitle || !newGoalAmount || !newGoalDeadline) {
      toast.error("Please fill in all fields");
      return;
    }

    await addGoal(
      newGoalTitle,
      parseFloat(newGoalAmount),
      newGoalDeadline,
      'general',
      'medium'
    );

    setNewGoalTitle("");
    setNewGoalAmount("");
    setNewGoalDeadline("");
    setIsDialogOpen(false);
  };

  const handleAddContribution = async () => {
    if (!selectedGoal || !contributionAmount) return;

    await addContribution(selectedGoal, parseFloat(contributionAmount));
    setContributionAmount("");
    setIsContribDialogOpen(false);
    setSelectedGoal(null);
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);
  const goals = [...activeGoals, ...completedGoals];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          <div className="flex justify-between items-start animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-primary bg-clip-text text-transparent">Goals</span> & Achievements
              </h1>
              <p className="text-muted-foreground">
                Set savings goals and unlock achievements as you progress
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:opacity-90">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Savings Goal</DialogTitle>
                  <DialogDescription>
                    Set a new financial goal to work towards
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Goal Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., New Car, Home Down Payment"
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Target Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="5000"
                      value={newGoalAmount}
                      onChange={(e) => setNewGoalAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Target Date</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={newGoalDeadline}
                      onChange={(e) => setNewGoalDeadline(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddGoal} className="w-full">
                    Create Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* AI Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <Alert key={idx} variant={rec.type === 'at_risk' ? 'destructive' : 'default'}>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>{rec.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-scale-in">
            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeGoals.length}</div>
                <p className="text-xs text-muted-foreground">{completedGoals.length} completed</p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Progress</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalSaved.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">of ${totalTarget.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unlockedAchievements.length}/{achievements.length}</div>
                <p className="text-xs text-muted-foreground">Unlocked</p>
              </CardContent>
            </Card>
          </div>

          {/* Savings Goals */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Target className="h-6 w-6" />
              Savings Goals
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {loading ? (
                <>
                  <GoalCardSkeleton />
                  <GoalCardSkeleton />
                </>
              ) : goals.length === 0 ? (
                <Card className="col-span-2">
                  <CardContent className="py-12 text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-4">No goals created yet</p>
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-primary">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Your First Goal
                    </Button>
                  </CardContent>
                </Card>
              ) : goals.map((goal) => {
                const percentage = calculatePercentage(goal.current_amount, goal.target_amount);
                const remaining = goal.target_amount - goal.current_amount;
                const daysRemaining = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

                return (
                  <Card key={goal.id} className="shadow-elegant hover-lift">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">🎯</div>
                          <div>
                            <CardTitle>{goal.name}</CardTitle>
                            <CardDescription>
                              ₹{goal.current_amount.toLocaleString()} of ₹{goal.target_amount.toLocaleString()}
                            </CardDescription>
                          </div>
                        </div>
                        {goal.status === 'completed' && (
                          <Badge className="bg-green-500">Completed!</Badge>
                        )}
                        {goal.status === 'paused' && (
                          <Badge variant="secondary">Paused</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Progress value={percentage} className="h-3" />
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Progress</p>
                          <p className="font-bold">{percentage.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Remaining</p>
                          <p className="font-bold">₹{remaining.toLocaleString()}</p>
                        </div>
                      </div>

                      {goal.deadline && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {daysRemaining > 0 
                              ? `${daysRemaining} days remaining`
                              : "Deadline passed"}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {percentage < 100 && goal.status === 'active' && (
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              setSelectedGoal(goal.id);
                              setIsContribDialogOpen(true);
                            }}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Add Contribution
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500"
                          onClick={() => {
                            if (confirm('Delete this goal?')) {
                              deleteGoal(goal.id);
                            }
                          }}
                        >
                          <Target className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Achievements */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              Achievements
            </h2>
            
            <div className="space-y-6">
              {unlockedAchievements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-500">
                    Unlocked ({unlockedAchievements.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unlockedAchievements.map((achievement) => (
                      <Card key={achievement.id} className="shadow-elegant hover-lift bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{achievement.icon}</div>
                            <div className="flex-1">
                              <CardTitle className="text-base flex items-center gap-2">
                                {achievement.title}
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {achievement.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        {achievement.unlockedDate && (
                          <CardContent className="pt-0">
                            <p className="text-xs text-muted-foreground">
                              Unlocked: {new Date(achievement.unlockedDate).toLocaleDateString()}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {lockedAchievements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-muted-foreground">
                    Locked ({lockedAchievements.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lockedAchievements.map((achievement) => (
                      <Card key={achievement.id} className="shadow-elegant opacity-60 hover:opacity-80 transition-opacity">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="text-3xl grayscale">{achievement.icon}</div>
                            <div className="flex-1">
                              <CardTitle className="text-base">{achievement.title}</CardTitle>
                              <CardDescription className="text-xs">
                                {achievement.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Add Contribution Dialog */}
          <Dialog open={isContribDialogOpen} onOpenChange={setIsContribDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Contribution</DialogTitle>
                <DialogDescription>
                  Add money toward your goal
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="contribution">Amount (₹)</Label>
                  <Input
                    id="contribution"
                    type="number"
                    placeholder="1000"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddContribution} className="w-full">
                  Add Contribution
                </Button>
              </div>
            </DialogContent>
          </Dialog>
      </main>
    </div>
    </AuthGuard>
  );
}
