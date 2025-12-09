import React from 'react';
import { motion } from 'framer-motion';
import { TeamScore } from './TeamScore';
import { CountdownTimer } from './CountdownTimer';
import { MoodBreakdown } from './MoodBreakdown';
import type { DailyStats, WeeklyStats, MoodCheck } from '../../types';

interface DashboardProps {
  todayStats: DailyStats;
  weeklyStats: WeeklyStats;
  recentCheckins: MoodCheck[];
  lastCheckIn: MoodCheck | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  todayStats,
  weeklyStats,
  recentCheckins,
  lastCheckIn,
}) => {
  const leftLeading = todayStats.leftScore > todayStats.rightScore;
  const rightLeading = todayStats.rightScore > todayStats.leftScore;
  const difference = Math.abs(todayStats.leftScore - todayStats.rightScore);

  return (
    <div className="space-y-6">
      {/* Countdown Timer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <CountdownTimer />
      </motion.div>

      {/* Team Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TeamScore
            team="LEFT"
            score={todayStats.leftScore}
            checkins={todayStats.leftCheckins}
            moodBreakdown={todayStats.leftMoodBreakdown}
            isLeading={leftLeading}
            difference={leftLeading ? difference : 0}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TeamScore
            team="RIGHT"
            score={todayStats.rightScore}
            checkins={todayStats.rightCheckins}
            moodBreakdown={todayStats.rightMoodBreakdown}
            isLeading={rightLeading}
            difference={rightLeading ? difference : 0}
          />
        </motion.div>
      </div>

      {/* Weekly Stats Banner */}
      <motion.div
        className="glass-card p-4 flex items-center justify-center gap-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider">Weekly Score</p>
          <p className="text-lg font-bold">
            <span className="text-red-400">🎅 {weeklyStats.leftWins}</span>
            <span className="text-white/30 mx-2">vs</span>
            <span className="text-green-400">{weeklyStats.rightWins} 🦌</span>
          </p>
        </div>
        
        {(weeklyStats.leftStreak > 0 || weeklyStats.rightStreak > 0) && (
          <div className="border-l border-white/20 pl-8">
            <p className="text-xs text-white/50 uppercase tracking-wider">Win Streak</p>
            <p className="text-lg font-bold">
              {weeklyStats.leftStreak > 0 && (
                <span className="text-red-400">🔥 Left: {weeklyStats.leftStreak} days</span>
              )}
              {weeklyStats.rightStreak > 0 && (
                <span className="text-green-400">🔥 Right: {weeklyStats.rightStreak} days</span>
              )}
            </p>
          </div>
        )}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <MoodBreakdown
          recentCheckins={recentCheckins}
          lastCheckIn={lastCheckIn}
        />
      </motion.div>
    </div>
  );
};

export default Dashboard;

