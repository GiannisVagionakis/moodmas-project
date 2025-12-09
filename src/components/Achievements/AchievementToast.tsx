import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Achievement } from '../../types';

interface AchievementToastProps {
  newAchievements: Achievement[];
  onDismiss?: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  newAchievements,
  onDismiss,
}) => {
  // Auto-dismiss after 3 seconds
  useEffect(() => {
    if (newAchievements.length > 0 && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [newAchievements, onDismiss]);

  return (
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
  );
};

export default AchievementToast;

