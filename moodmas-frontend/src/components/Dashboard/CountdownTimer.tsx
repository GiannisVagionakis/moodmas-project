import React from 'react';
import { motion } from 'framer-motion';
import { useCountdown } from '../../hooks/useCountdown';
import { GlassCard } from '../Effects/GlassCard';

interface CountdownTimerProps {
  onEnd?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ onEnd }) => {
  const { hours, minutes, seconds, isActive, isEnded, formattedTime, percentRemaining } = useCountdown();

  // Determine status color
  const getStatusColor = () => {
    if (isEnded) return 'text-red-400';
    if (!isActive) return 'text-yellow-400';
    if (percentRemaining < 20) return 'text-orange-400';
    return 'text-green-400';
  };

  const getStatusText = () => {
    if (isEnded) return 'Voting Closed';
    if (!isActive && new Date().getHours() < 8) return 'Starts at 08:00';
    if (!isActive) return 'Ended for Today';
    return 'Time Remaining';
  };

  return (
    <GlassCard className="p-6 text-center" glow>
      {/* Status indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <motion.div
          className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}
          animate={{
            scale: isActive ? [1, 1.2, 1] : 1,
            opacity: isActive ? [1, 0.7, 1] : 0.5,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Timer display */}
      <div className="relative">
        <motion.div
          className="text-6xl md:text-7xl font-bold font-display tracking-wider"
          key={formattedTime}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.1 }}
        >
          {isActive || !isEnded ? (
            <>
              <span className="text-white">{String(hours).padStart(2, '0')}</span>
              <motion.span
                className="text-white/50 mx-1"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                :
              </motion.span>
              <span className="text-white">{String(minutes).padStart(2, '0')}</span>
              <motion.span
                className="text-white/50 mx-1"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                :
              </motion.span>
              <span className="text-white">{String(seconds).padStart(2, '0')}</span>
            </>
          ) : (
            <span className="text-red-400">00:00:00</span>
          )}
        </motion.div>

        {/* Progress bar */}
        {isActive && (
          <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
              initial={{ width: '100%' }}
              animate={{ width: `${percentRemaining}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </div>

      {/* Time labels */}
      <div className="flex justify-center gap-8 mt-4 text-xs text-white/50">
        <span>HOURS</span>
        <span>MINUTES</span>
        <span>SECONDS</span>
      </div>

      {/* Voting window info */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-white/40">
          ☀️ Morning Mood Battle • 08:00 - 11:00
        </p>
      </div>
    </GlassCard>
  );
};

export default CountdownTimer;

