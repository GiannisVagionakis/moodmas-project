import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../Effects/GlassCard';
import type { MoodCheck } from '../../types';

interface MoodBreakdownProps {
  recentCheckins: MoodCheck[];
  lastCheckIn: MoodCheck | null;
}

const emotionEmoji: Record<string, string> = {
  happy: '😊',
  neutral: '😐',
  sad: '😢',
  surprised: '😲',
  angry: '😠',
  fearful: '😨',
  disgusted: '🤢',
};

const emotionColors: Record<string, string> = {
  happy: 'bg-green-500',
  neutral: 'bg-yellow-500',
  sad: 'bg-blue-500',
  surprised: 'bg-purple-500',
  angry: 'bg-red-500',
  fearful: 'bg-indigo-500',
  disgusted: 'bg-orange-500',
};

export const MoodBreakdown: React.FC<MoodBreakdownProps> = ({
  recentCheckins,
  lastCheckIn,
}) => {
  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
        <span>📊</span>
        <span>Recent Activity</span>
      </h3>

      {/* Last check-in highlight */}
      {lastCheckIn && (
        <motion.div
          className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.span
                className="text-3xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                {emotionEmoji[lastCheckIn.dominantEmotion]}
              </motion.span>
              <div>
                <p className="font-semibold">Latest Check-in</p>
                <p className="text-xs text-white/50">
                  Team {lastCheckIn.team} • {lastCheckIn.happinessScore} pts
                </p>
              </div>
            </div>
            <div className="text-right">
              <motion.div
                className={`text-2xl font-bold ${lastCheckIn.happinessScore > 0 ? 'text-green-400' :
                  lastCheckIn.happinessScore < 0 ? 'text-red-400' :
                    'text-yellow-400'
                  }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                {lastCheckIn.happinessScore > 0 ? '+' : ''}{lastCheckIn.happinessScore} pts
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent check-ins list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {recentCheckins.length === 0 ? (
          <p className="text-center text-white/40 py-8">
            No check-ins yet today. Be the first! 🎯
          </p>
        ) : (
          recentCheckins.slice().reverse().map((checkin, index) => (
            <motion.div
              key={checkin.id}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{emotionEmoji[checkin.dominantEmotion]}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${checkin.team === 'LEFT' ? 'bg-red-500' : 'bg-green-500'
                      }`} />
                    <span className="text-sm font-medium">Team {checkin.team}</span>
                  </div>
                  <span className="text-xs text-white/40">
                    {new Date(checkin.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className={`text-base font-bold ${checkin.happinessScore > 0 ? 'text-green-400' :
                  checkin.happinessScore < 0 ? 'text-red-400' :
                    'text-yellow-400'
                }`}>
                {checkin.happinessScore > 0 ? '+' : ''}{checkin.happinessScore} pts
              </div>
            </motion.div>
          ))
        )}
      </div>
    </GlassCard>
  );
};

export default MoodBreakdown;

