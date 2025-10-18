import { Flame, Trophy, Star, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useQueryClient } from '@tanstack/react-query';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  total_points: number;
  last_activity_date: string;
}

export const StreakBadge = () => {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchOrCreateStreak();
    
    // Listen for streak updates
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey?.[0] === 'streaks') {
        fetchOrCreateStreak();
      }
    });
    
    return () => unsubscribe();
  }, [queryClient]);

  const fetchOrCreateStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      // Try to fetch existing streak from user_gamification
      const { data, error: fetchError } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching streak:", fetchError);
        // Table might not exist, show default values
        setStreak({
          current_streak: 0,
          longest_streak: 0,
          total_points: 0,
          last_activity_date: new Date().toISOString()
        });
        setError(null);
      } else if (!data) {
        // No streak record exists, try to create one
        const { data: newStreak, error: createError } = await supabase
          .from("user_gamification")
          .insert({
            user_id: user.id,
            current_streak: 0,
            longest_streak: 0,
            total_points: 0,
            last_activity_date: new Date().toISOString().split('T')[0]
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating streak:", createError);
          // If can't create, show default values
          setStreak({
            current_streak: 0,
            longest_streak: 0,
            total_points: 0,
            last_activity_date: new Date().toISOString()
          });
        } else {
          setStreak(newStreak);
        }
        setError(null);
      } else {
        setStreak(data);
        setError(null);
      }
    } catch (error) {
      console.error("Error in streak operation:", error);
      // Show default values on any error
      setStreak({
        current_streak: 0,
        longest_streak: 0,
        total_points: 0,
        last_activity_date: new Date().toISOString()
      });
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 animate-pulse bg-gradient-card">
        <div className="h-32 bg-muted rounded"></div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800 shadow-elegant relative overflow-hidden">
        {/* Animated background effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Flame className="h-6 w-6 text-orange-500" />
                </motion.div>
                <h3 className="text-lg font-semibold">Current Streak</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <motion.span 
                  className="text-4xl font-bold text-orange-600 dark:text-orange-400"
                  animate={{
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {streak?.current_streak || 0}
                </motion.span>
                <span className="text-muted-foreground">days</span>
                {(streak?.current_streak || 0) > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <Zap className="h-5 w-5 text-yellow-500" />
                  </motion.div>
                )}
              </div>
            </div>

            <div className="text-right space-y-2">
              <div className="flex items-center gap-2 justify-end">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Best</span>
              </div>
              <motion.div 
                className="text-2xl font-bold text-foreground"
                whileHover={{ scale: 1.1 }}
              >
                {streak?.longest_streak || 0}
              </motion.div>
            </div>
          </div>

          <motion.div 
            className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-800"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="h-5 w-5 text-yellow-500" />
                </motion.div>
                <span className="text-sm font-medium">Total Points</span>
              </div>
              <motion.span 
                className="text-lg font-bold text-yellow-600 dark:text-yellow-400"
                animate={{
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {streak?.total_points || 0}
              </motion.span>
            </div>
          </motion.div>

          {error && (
            <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
              Note: Streak tracking starting fresh
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
