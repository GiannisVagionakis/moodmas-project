import React from 'react';
import { motion } from 'framer-motion';
import { SnowEffect } from '../Effects/SnowEffect';

interface ChristmasLayoutProps {
  children: React.ReactNode;
}

export const ChristmasLayout: React.FC<ChristmasLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen animated-gradient text-white relative overflow-hidden">
      {/* Enhanced snow effect */}
      <SnowEffect count={80} />

      {/* Decorative top border - Christmas ribbon */}
      <div className="fixed top-0 left-0 w-full h-3 bg-gradient-to-r from-red-600 via-green-600 via-red-500 via-green-500 to-red-600 z-50 shadow-lg" />

      {/* Christmas lights decoration */}
      <div className="fixed top-3 left-0 right-0 flex justify-center gap-8 z-40 py-2">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="w-4 h-4 rounded-full shadow-lg"
            style={{
              backgroundColor: i % 4 === 0 ? '#ef4444' : i % 4 === 1 ? '#22c55e' : i % 4 === 2 ? '#eab308' : '#3b82f6',
              boxShadow: `0 0 10px ${i % 4 === 0 ? '#ef4444' : i % 4 === 1 ? '#22c55e' : i % 4 === 2 ? '#eab308' : '#3b82f6'}`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.12,
            }}
          />
        ))}
      </div>

      {/* Corner decorations - Top */}
      <motion.div
        className="fixed top-12 left-6 text-7xl opacity-30 pointer-events-none z-0"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        🎄
      </motion.div>
      <motion.div
        className="fixed top-12 right-6 text-7xl opacity-30 pointer-events-none z-0"
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
      >
        🎄
      </motion.div>

      {/* Floating stars */}
      <motion.div
        className="fixed top-20 left-1/4 text-3xl opacity-40 pointer-events-none z-0"
        animate={{ y: [0, -10, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        ⭐
      </motion.div>
      <motion.div
        className="fixed top-32 right-1/4 text-3xl opacity-40 pointer-events-none z-0"
        animate={{ y: [0, -15, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
      >
        ✨
      </motion.div>

      {/* Bottom decorations */}
      <motion.div
        className="fixed bottom-6 left-6 text-5xl opacity-25 pointer-events-none z-0"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🎁
      </motion.div>
      <motion.div
        className="fixed bottom-6 right-6 text-5xl opacity-25 pointer-events-none z-0"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      >
        🎁
      </motion.div>

      {/* Additional festive elements */}
      <motion.div
        className="fixed bottom-24 left-12 text-3xl opacity-20 pointer-events-none z-0"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        🍬
      </motion.div>
      <motion.div
        className="fixed bottom-32 right-16 text-3xl opacity-20 pointer-events-none z-0"
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity }}
      >
        🔔
      </motion.div>
      <motion.div
        className="fixed top-1/2 left-8 text-2xl opacity-15 pointer-events-none z-0"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        🧦
      </motion.div>

      {/* Main content */}
      <main className="relative z-10 min-h-screen pt-20 pb-8 px-4">
        {children}
      </main>

      {/* Footer gradient - warmer tones */}
      <div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/60 via-red-950/20 to-transparent pointer-events-none z-0" />
    </div>
  );
};

export default ChristmasLayout;

