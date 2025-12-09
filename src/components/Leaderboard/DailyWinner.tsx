import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../Effects/GlassCard';
import type { DailyStats } from '../../types';

interface DailyWinnerProps {
  stats: DailyStats;
}

export const DailyWinner: React.FC<DailyWinnerProps> = ({ stats }) => {
  if (!stats.isFinalized || !stats.winner) {
    return null;
  }

  const isLeft = stats.winner === 'LEFT';
  const winnerConfig = isLeft
    ? { emoji: '🎅', name: 'Team Left', color: 'red', score: stats.leftScore }
    : { emoji: '🦌', name: 'Team Right', color: 'green', score: stats.rightScore };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <GlassCard 
        variant={isLeft ? 'red' : 'green'} 
        className="p-6 text-center"
        glow
      >
        <motion.div
          className="text-6xl mb-4"
          animate={{ 
            rotate: [0, -5, 5, -5, 5, 0],
            y: [0, -10, 0],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🏆
        </motion.div>
        
        <h2 className="text-2xl font-bold font-display mb-2">
          Today's Winner!
        </h2>
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-4xl">{winnerConfig.emoji}</span>
          <span className="text-3xl font-bold">{winnerConfig.name}</span>
        </div>
        
        <p className="text-lg text-white/60">
          Final Score: <span className="font-bold text-white">{winnerConfig.score}</span> points
        </p>
        
        <p className="text-sm text-white/40 mt-4">
          📅 {new Date(stats.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </GlassCard>
    </motion.div>
  );
};

export default DailyWinner;

