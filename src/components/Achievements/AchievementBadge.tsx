import React from 'react';
import { motion } from 'framer-motion';
import type { Achievement } from '../../types';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}

const sizeStyles = {
  sm: 'w-12 h-12 text-xl',
  md: 'w-16 h-16 text-2xl',
  lg: 'w-24 h-24 text-4xl',
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'md',
  showDescription = false,
}) => {
  const isUnlocked = achievement.unlockedAt !== null;

  return (
    <motion.div
      className={`flex flex-col items-center gap-2 ${!isUnlocked ? 'opacity-40 grayscale' : ''}`}
      whileHover={isUnlocked ? { scale: 1.1 } : {}}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div
        className={`
          ${sizeStyles[size]}
          achievement-badge
          rounded-full 
          flex items-center justify-center
          ${isUnlocked 
            ? 'bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg shadow-yellow-500/30' 
            : 'bg-white/10 border border-white/20'
          }
        `}
      >
        <span className={isUnlocked ? '' : 'opacity-50'}>{achievement.icon}</span>
      </div>
      
      {showDescription && (
        <div className="text-center">
          <p className="font-semibold text-sm">{achievement.name}</p>
          <p className="text-xs text-white/50">{achievement.description}</p>
          {isUnlocked && achievement.unlockedAt && (
            <p className="text-xs text-green-400 mt-1">
              ✓ {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default AchievementBadge;

