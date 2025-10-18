import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthScoreCardProps {
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  breakdown: {
    income: number;
    expense: number;
    savings: number;
    debt: number;
    liquidity: number;
  };
  recommendations?: string[];
}

export function HealthScoreCard({ score, trend, breakdown, recommendations }: HealthScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'improving':
        return 'text-green-500';
      case 'declining':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card className="shadow-elegant hover-lift">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Cashflow Health Score</CardTitle>
            <CardDescription>AI-powered financial health analysis</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={cn("text-sm font-medium", getTrendColor())}>
              {trend.charAt(0).toUpperCase() + trend.slice(1)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score */}
        <div className="text-center space-y-2">
          <div className={cn("text-6xl font-bold", getScoreColor(score))}>
            {score}
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
          <Badge 
            variant={score >= 60 ? 'default' : 'destructive'}
            className="text-sm"
          >
            {getScoreLabel(score)}
          </Badge>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-muted-foreground">Score Breakdown</h4>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Income Stability</span>
                <span className="font-medium">{breakdown.income}/25</span>
              </div>
              <Progress value={(breakdown.income / 25) * 100} className="h-2" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Expense Efficiency</span>
                <span className="font-medium">{breakdown.expense}/25</span>
              </div>
              <Progress value={(breakdown.expense / 25) * 100} className="h-2" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Savings Rate</span>
                <span className="font-medium">{breakdown.savings}/20</span>
              </div>
              <Progress value={(breakdown.savings / 20) * 100} className="h-2" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Debt Management</span>
                <span className="font-medium">{breakdown.debt}/15</span>
              </div>
              <Progress value={(breakdown.debt / 15) * 100} className="h-2" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Liquidity</span>
                <span className="font-medium">{breakdown.liquidity}/15</span>
              </div>
              <Progress value={(breakdown.liquidity / 15) * 100} className="h-2" />
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              AI Recommendations
            </h4>
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
