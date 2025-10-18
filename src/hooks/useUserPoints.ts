import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserGamification {
  id: string;
  user_id: string;
  level: number;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  badges: string[] | null;
  achievements: any;
  challenges_completed: number;
  created_at: string;
  updated_at: string;
}

interface RedemptionHistory {
  id: string;
  voucher_id: string;
  points_spent: number;
  redeemed_at: string;
}

export const useUserPoints = () => {
  const [gamification, setGamification] = useState<UserGamification | null>(null);
  const [loading, setLoading] = useState(true);
  const [redemptionHistory, setRedemptionHistory] = useState<RedemptionHistory[]>([]);
  const { toast } = useToast();

  const fetchUserGamification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch or create gamification record
      let { data, error } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code === "PGRST116") {
        // No record exists, create one
        const { data: newData, error: insertError } = await supabase
          .from("user_gamification")
          .insert([
            {
              user_id: user.id,
              level: 1,
              total_points: 0,
              current_streak: 0,
              longest_streak: 0,
              badges: [],
              achievements: {},
              challenges_completed: 0,
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        data = newData;
      } else if (error) {
        throw error;
      }

      setGamification(data);

      // Fetch redemption history from localStorage for now
      const storedHistory = localStorage.getItem(`redemption_history_${user.id}`);
      if (storedHistory) {
        setRedemptionHistory(JSON.parse(storedHistory));
      }
    } catch (error: any) {
      console.error("Error fetching gamification:", error);
      toast({
        title: "Error",
        description: "Failed to load points data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const redeemVoucher = async (voucherId: string, pointsCost: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      if (!gamification) throw new Error("Gamification data not loaded");

      if (gamification.total_points < pointsCost) {
        toast({
          title: "Insufficient Points",
          description: `You need ${pointsCost - gamification.total_points} more points`,
          variant: "destructive",
        });
        return false;
      }

      // Update points in database
      const { error } = await supabase
        .from("user_gamification")
        .update({
          total_points: gamification.total_points - pointsCost,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // Add to redemption history
      const newRedemption: RedemptionHistory = {
        id: crypto.randomUUID(),
        voucher_id: voucherId,
        points_spent: pointsCost,
        redeemed_at: new Date().toISOString(),
      };

      const updatedHistory = [...redemptionHistory, newRedemption];
      setRedemptionHistory(updatedHistory);
      localStorage.setItem(`redemption_history_${user.id}`, JSON.stringify(updatedHistory));

      // Update local state
      setGamification({
        ...gamification,
        total_points: gamification.total_points - pointsCost,
      });

      return true;
    } catch (error: any) {
      console.error("Error redeeming voucher:", error);
      toast({
        title: "Error",
        description: "Failed to redeem voucher",
        variant: "destructive",
      });
      return false;
    }
  };

  const addPoints = async (points: number, reason: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      if (!gamification) throw new Error("Gamification data not loaded");

      const { error } = await supabase
        .from("user_gamification")
        .update({
          total_points: gamification.total_points + points,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setGamification({
        ...gamification,
        total_points: gamification.total_points + points,
      });

      toast({
        title: "Points Earned! 🎉",
        description: `+${points} points for ${reason}`,
      });

      return true;
    } catch (error: any) {
      console.error("Error adding points:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchUserGamification();
  }, []);

  return {
    gamification,
    loading,
    redemptionHistory,
    redeemVoucher,
    addPoints,
    refreshPoints: fetchUserGamification,
  };
};
