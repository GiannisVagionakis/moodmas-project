import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../Effects/GlassCard';
import { AchievementBadge } from './AchievementBadge';
import type { Achievement } from '../../types';

interface AchievementListProps {
  achievements: Achievement[];
  newAchievements?: Achievement[];
  onDismissNew?: () => void;
}

export const AchievementList: React.FC<AchievementListProps> = ({
  achievements,
  newAchievements = [],
  onDismissNew,
}) => {
  const unlockedCount = achievements.filter(a => a.unlockedAt !== null).length;

  // Auto-dismiss achievement popup after 3 seconds
  useEffect(() => {
    if (newAchievements.length > 0 && onDismissNew) {
      const timer = setTimeout(() => {
        onDismissNew();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [newAchievements, onDismissNew]);

  return (
    <>
      {/* New Achievement Popup - Auto-dismisses after 3 seconds */}
      <AnimatePresence>
        {newAchievements.length > 0 && (
          <motion.div
            className="fixed top-24 right-4 z-50"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <div className="glass-card p-4 text-center max-w-xs">
              <div className="flex items-center gap-3">
                <motion.div
                  className="text-4xl"
                  animate={{ 
                    rotate: [0, -10, 10, -10, 10, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 0.5 }}
                >
                  🏆
                </motion.div>
                <div className="text-left">
                  <p className="text-sm font-bold text-yellow-400">Achievement Unlocked!</p>
                  {newAchievements.map((achievement) => (
                    <p key={achievement.id} className="text-sm">
                      {achievement.icon} {achievement.name}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement List Card */}
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
        <div className="grid grid-cols-4 gap-4">
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
        <div className="mt-6 space-y-2">
          {achievements.filter(a => a.unlockedAt).map(achievement => (
            <div 
              key={achievement.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-white/5"
            >
              <span className="text-xl">{achievement.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{achievement.name}</p>
                <p className="text-xs text-white/40">{achievement.description}</p>
              </div>
              <span className="text-xs text-green-400">✓</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </>
  );
};

export default AchievementList;

