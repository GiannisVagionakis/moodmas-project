import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../Effects/GlassCard';
import { AchievementBadge } from './AchievementBadge';
import type { Achievement } from '../../types';

interface AchievementCardProps {
  achievements: Achievement[];
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievements,
}) => {
  const unlockedCount = achievements.filter(a => a.unlockedAt !== null).length;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold font-display flex items-center gap-2">
          <span>🏅</span>
          <span>Achievements</span>
        </h3>
        <span className="text-sm text-white/50">
          {unlockedCount}/{achievements.length} unlocked
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-400 to-amber-600"
          initial={{ width: 0 }}
          animate={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <AchievementBadge achievement={achievement} size="sm" />
          </motion.div>
        ))}
      </div>

      {/* Unlocked achievements details */}
      {unlockedCount > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2">
          {achievements.filter(a => a.unlockedAt).map(achievement => (
            <div 
              key={achievement.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-white/5"
            >
              <span className="text-xl">{achievement.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{achievement.name}</p>
                <p className="text-xs text-white/40 truncate">{achievement.description}</p>
              </div>
              <span className="text-xs text-green-400">✓</span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};

export default AchievementCard;

