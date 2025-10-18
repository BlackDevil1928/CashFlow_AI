import { supabase } from '@/integrations/supabase/client';

interface StreakData {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  total_points: number;
  last_activity_date: string;
}

export const streakService = {
  /**
   * Update user's streak when they perform an activity (add expense, income, etc.)
   */
  async updateStreak(userId: string): Promise<void> {
    try {
      console.log('🔥 Updating streak for user:', userId);
      const today = new Date().toISOString().split('T')[0];

      // Get existing streak data
      const { data: existingStreak, error: fetchError } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Error fetching streak:', fetchError);
        return;
      }

      if (!existingStreak) {
        console.log('📝 Creating new streak record');
        // Create new streak record
        const { data: newStreak, error: insertError } = await supabase
          .from('streaks')
          .insert({
            user_id: userId,
            current_streak: 1,
            longest_streak: 1,
            total_points: 10,
            last_activity_date: today,
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Error creating streak:', insertError);
        } else {
          console.log('✅ Streak created:', newStreak);
        }
        return;
      }

      console.log('📊 Existing streak:', existingStreak);

      const lastActivityDate = existingStreak.last_activity_date;
      
      if (!lastActivityDate) {
        // First time activity
        console.log('🎯 First activity, setting streak to 1');
        const { error: updateError } = await supabase
          .from('streaks')
          .update({
            current_streak: 1,
            longest_streak: 1,
            total_points: 10,
            last_activity_date: today,
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('❌ Error updating streak:', updateError);
        } else {
          console.log('✅ First activity streak set');
        }
        return;
      }

      const lastDate = new Date(lastActivityDate);
      const todayDate = new Date(today);

      // Calculate days difference
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      console.log('📅 Days since last activity:', diffDays);

      let newStreak = existingStreak.current_streak;
      let newLongest = existingStreak.longest_streak;
      let newPoints = existingStreak.total_points;

      if (diffDays === 0) {
        // Same day - no streak change
        console.log('⏰ Same day, no update needed');
        return;
      } else if (diffDays === 1) {
        // Consecutive day - increment streak
        newStreak += 1;
        newPoints += newStreak * 10;
        
        if (newStreak > newLongest) {
          newLongest = newStreak;
        }
        console.log('🔥 Streak increased to:', newStreak);
      } else if (diffDays > 1) {
        // Streak broken - reset to 1
        newStreak = 1;
        newPoints += 10;
        console.log('💔 Streak broken, resetting to 1');
      }

      // Update streak in database
      const { data: updatedStreak, error: updateError } = await supabase
        .from('streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          total_points: newPoints,
          last_activity_date: today,
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating streak:', updateError);
      } else {
        console.log('✅ Streak updated successfully:', updatedStreak);
      }
    } catch (error) {
      console.error('❌ Error in streak service:', error);
    }
  },

  /**
   * Get current streak data for a user
   */
  async getStreak(userId: string): Promise<StreakData | null> {
    try {
      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error getting streak:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getStreak:', error);
      return null;
    }
  },

  /**
   * Award bonus points for achievements
   */
  async awardBonusPoints(userId: string, points: number): Promise<void> {
    try {
      const { data: streak } = await supabase
        .from('streaks')
        .select('total_points')
        .eq('user_id', userId)
        .single();

      if (streak) {
        await supabase
          .from('streaks')
          .update({
            total_points: streak.total_points + points,
          })
          .eq('user_id', userId);
      }
    } catch (error) {
      console.error('Error awarding bonus points:', error);
    }
  },
};
