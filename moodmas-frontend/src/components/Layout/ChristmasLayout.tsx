import React from 'react';
import { motion } from 'framer-motion';
import { SnowEffect } from '../Effects/SnowEffect';

interface ChristmasLayoutProps {
  children: React.ReactNode;
}

export const ChristmasLayout: React.FC<ChristmasLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen animated-gradient text-white relative overflow-hidden">
      {/* Snow effect */}
      <SnowEffect count={60} />
      
      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-green-500 to-red-500 z-50" />
      
      {/* Christmas lights decoration */}
      <div className="fixed top-2 left-0 right-0 flex justify-center gap-8 z-40 py-2">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: i % 3 === 0 ? '#ef4444' : i % 3 === 1 ? '#22c55e' : '#eab308',
            }}
            animate={{
              opacity: [0.4, 1, 0.4],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      
      {/* Corner decorations */}
      <div className="fixed top-8 left-4 text-6xl opacity-20 pointer-events-none z-0">
        🎄
      </div>
      <div className="fixed top-8 right-4 text-6xl opacity-20 pointer-events-none z-0">
        🎄
      </div>
      <div className="fixed bottom-4 left-4 text-4xl opacity-20 pointer-events-none z-0">
        🎁
      </div>
      <div className="fixed bottom-4 right-4 text-4xl opacity-20 pointer-events-none z-0">
        🎁
      </div>
      
      {/* Main content */}
      <main className="relative z-10 min-h-screen pt-16 pb-8 px-4">
        {children}
      </main>
      
      {/* Footer gradient */}
      <div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-0" />
    </div>
  );
};

export default ChristmasLayout;

