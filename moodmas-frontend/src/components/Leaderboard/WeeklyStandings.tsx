import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../Effects/GlassCard';
import type { WeeklyStats } from '../../types';

interface WeeklyStandingsProps {
  stats: WeeklyStats;
}

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const WeeklyStandings: React.FC<WeeklyStandingsProps> = ({ stats }) => {
  const totalGames = stats.leftWins + stats.rightWins;
  const leftPercent = totalGames > 0 ? (stats.leftWins / totalGames) * 100 : 50;

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
        <span>📊</span>
        <span>Weekly Standings</span>
      </h3>

      {/* Win comparison bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-red-400">🎅 {stats.leftWins} wins</span>
          <span className="text-green-400">{stats.rightWins} wins 🦌</span>
        </div>
        <div className="h-4 bg-white/10 rounded-full overflow-hidden flex">
          <motion.div
            className="h-full bg-gradient-to-r from-red-600 to-red-400"
            initial={{ width: 0 }}
            animate={{ width: `${leftPercent}%` }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 flex-1"
            initial={{ width: 0 }}
            animate={{ width: `${100 - leftPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Daily results */}
      <div className="grid grid-cols-7 gap-2">
        {stats.dailyResults.map((day, index) => {
          const isToday = day.date === new Date().toISOString().split('T')[0];
          const hasResult = day.isFinalized && day.winner;
          
          return (
            <motion.div
              key={day.date}
              className={`
                text-center p-2 rounded-lg
                ${isToday ? 'ring-2 ring-yellow-400' : ''}
                ${hasResult 
                  ? day.winner === 'LEFT' ? 'bg-red-500/20' : 'bg-green-500/20'
                  : 'bg-white/5'
                }
              `}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <p className="text-xs text-white/50 mb-1">{dayNames[index]}</p>
              <span className="text-lg">
                {hasResult 
                  ? day.winner === 'LEFT' ? '🎅' : '🦌'
                  : isToday ? '⏳' : '—'
                }
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Streak info */}
      {(stats.leftStreak > 1 || stats.rightStreak > 1) && (
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          {stats.leftStreak > 1 && (
            <p className="text-red-400">
              🔥 Team Left on a {stats.leftStreak}-day win streak!
            </p>
          )}
          {stats.rightStreak > 1 && (
            <p className="text-green-400">
              🔥 Team Right on a {stats.rightStreak}-day win streak!
            </p>
          )}
        </div>
      )}
    </GlassCard>
  );
};

export default WeeklyStandings;

