import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../Effects/GlassCard';
import type { TeamType, MoodBreakdown } from '../../types';

interface TeamScoreProps {
  team: TeamType;
  score: number;
  checkins: number;
  moodBreakdown: MoodBreakdown;
  isLeading: boolean;
  difference?: number;
}

const teamConfig = {
  LEFT: {
    name: 'Team Left',
    emoji: '🎅',
    color: 'red',
    gradient: 'from-red-500 to-rose-600',
    bgGlow: 'shadow-red-500/30',
    variant: 'red' as const,
  },
  RIGHT: {
    name: 'Team Right',
    emoji: '🦌',
    color: 'green',
    gradient: 'from-green-500 to-emerald-600',
    bgGlow: 'shadow-green-500/30',
    variant: 'green' as const,
  },
};

export const TeamScore: React.FC<TeamScoreProps> = ({
  team,
  score,
  checkins,
  moodBreakdown,
  isLeading,
  difference = 0,
}) => {
  const config = teamConfig[team];
  const totalMoods = moodBreakdown.happy + moodBreakdown.neutral + moodBreakdown.tired;

  const getMoodPercent = (value: number) => {
    if (totalMoods === 0) return 0;
    return Math.round((value / totalMoods) * 100);
  };

  return (
    <GlassCard
      variant={config.variant}
      className="p-6"
      glow={isLeading}
    >

      {/* Team header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.span
            className="text-4xl"
            animate={{ rotate: isLeading ? [0, -10, 10, 0] : 0 }}
            transition={{ duration: 0.5, repeat: isLeading ? Infinity : 0, repeatDelay: 2 }}
          >
            {config.emoji}
          </motion.span>
          <div>
            <h3 className="text-xl font-bold font-display">{config.name}</h3>
            <p className="text-xs text-white/50">☕ {checkins} check-ins</p>
          </div>
        </div>
      </div>

      {/* Participant Count display */}
      <div className="text-center mb-6">
        <motion.div
          className={`text-6xl font-bold font-display bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
          key={checkins}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {checkins}
        </motion.div>
        <p className="text-xs text-white/50 mt-1">PARTICIPANTS</p>
      </div>

      {/* Mood breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider">
          Mood Breakdown
        </h4>

        {/* Happy */}
        <div className="flex items-center gap-3">
          <span className="text-lg">😊</span>
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span>Happy</span>
              <span className="font-bold">{getMoodPercent(moodBreakdown.happy)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-400"
                initial={{ width: 0 }}
                animate={{ width: `${getMoodPercent(moodBreakdown.happy)}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
            </div>
          </div>
        </div>

        {/* Neutral */}
        <div className="flex items-center gap-3">
          <span className="text-lg">😐</span>
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span>Neutral</span>
              <span className="font-bold">{getMoodPercent(moodBreakdown.neutral)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-yellow-400"
                initial={{ width: 0 }}
                animate={{ width: `${getMoodPercent(moodBreakdown.neutral)}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          </div>
        </div>

        {/* Tired */}
        <div className="flex items-center gap-3">
          <span className="text-lg">😫</span>
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span>Tired</span>
              <span className="font-bold">{getMoodPercent(moodBreakdown.tired)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-red-400"
                initial={{ width: 0 }}
                animate={{ width: `${getMoodPercent(moodBreakdown.tired)}%` }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default TeamScore;

