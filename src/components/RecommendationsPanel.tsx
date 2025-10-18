import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, Target, AlertTriangle, Lightbulb, DollarSign, ArrowRight } from "lucide-react";
import { AgentRecommendation } from "@/lib/ai/agent-service";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface RecommendationsPanelProps {
  recommendations: AgentRecommendation[];
  onDismiss?: (index: number) => void;
}

export function RecommendationsPanel({ recommendations, onDismiss }: RecommendationsPanelProps) {
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'savings':
        return <DollarSign className="h-5 w-5" />;
      case 'budget':
        return <AlertTriangle className="h-5 w-5" />;
      case 'goal':
        return <Target className="h-5 w-5" />;
      case 'risk':
        return <AlertCircle className="h-5 w-5" />;
      case 'opportunity':
        return <Lightbulb className="h-5 w-5" />;
      case 'tax':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 hover:bg-red-600';
      case 'high':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'medium':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'default' as const;
      default:
        return 'secondary' as const;
    }
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            AI Recommendations
          </CardTitle>
          <CardDescription>Proactive insights from your financial agent</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No recommendations at this time.</p>
            <p className="text-sm mt-1">Keep tracking your expenses and the AI will provide insights!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-500" />
              AI Recommendations
            </CardTitle>
            <CardDescription>Proactive insights from your financial agent</CardDescription>
          </div>
          <Badge variant="secondary">{recommendations.length} insights</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => (
          <div 
            key={index}
            className={cn(
              "p-4 rounded-lg border-l-4 space-y-3 bg-card hover:bg-accent/50 transition-colors",
              rec.priority === 'critical' && "border-l-red-500",
              rec.priority === 'high' && "border-l-orange-500",
              rec.priority === 'medium' && "border-l-yellow-500",
              rec.priority === 'low' && "border-l-blue-500"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className={cn(
                  "p-2 rounded-lg",
                  rec.priority === 'critical' && "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
                  rec.priority === 'high' && "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
                  rec.priority === 'medium' && "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
                  rec.priority === 'low' && "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                )}>
                  {getIcon(rec.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{rec.title}</h4>
                    <Badge variant={getPriorityBadgeVariant(rec.priority)} className="text-xs">
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.message}</p>
                  
                  {rec.impact && (
                    <div className="mt-2 p-2 bg-accent/30 rounded text-sm">
                      <span className="font-medium">{rec.impact.category}:</span> {rec.impact.description}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {rec.action && (
                <Button
                  size="sm"
                  onClick={() => navigate(rec.action!.url)}
                  className={cn("text-white", getPriorityColor(rec.priority))}
                >
                  {rec.action.label}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
              {onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDismiss(index)}
                >
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
