import { Flame, Trophy, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const StreakBadge = () => {
  const [streak, setStreak] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setStreak(data);
    } catch (error) {
      console.error("Error fetching streak:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 animate-pulse bg-gradient-card">
        <div className="h-20 bg-muted rounded"></div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card border-primary/20 shadow-elegant">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-warning animate-pulse-glow" />
            <h3 className="text-lg font-semibold">Current Streak</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary animate-counter">
              {streak?.current_streak || 0}
            </span>
            <span className="text-muted-foreground">days</span>
          </div>
        </div>

        <div className="text-right space-y-2">
          <div className="flex items-center gap-2 justify-end">
            <Trophy className="h-5 w-5 text-warning" />
            <span className="text-sm text-muted-foreground">Best</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {streak?.longest_streak || 0}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium">Total Points</span>
          </div>
          <span className="text-lg font-bold text-accent">
            {streak?.total_points || 0}
          </span>
        </div>
      </div>
    </Card>
  );
};
