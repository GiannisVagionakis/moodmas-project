import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
}

interface ConfettiProps {
  trigger?: boolean;
  count?: number;
  duration?: number;
  colors?: string[];
  onComplete?: () => void;
}

const DEFAULT_COLORS = [
  '#ef4444', // red
  '#22c55e', // green
  '#eab308', // gold
  '#3b82f6', // blue
  '#ec4899', // pink
  '#f97316', // orange
  '#8b5cf6', // purple
];

export const Confetti: React.FC<ConfettiProps> = ({
  trigger = false,
  count = 50,
  duration = 3000,
  colors = DEFAULT_COLORS,
  onComplete,
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  const createConfetti = useCallback(() => {
    const newPieces: ConfettiPiece[] = [];
    
    for (let i = 0; i < count; i++) {
      newPieces.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
      });
    }
    
    setPieces(newPieces);
    setIsActive(true);

    setTimeout(() => {
      setIsActive(false);
      setPieces([]);
      onComplete?.();
    }, duration);
  }, [count, colors, duration, onComplete]);

  useEffect(() => {
    if (trigger) {
      createConfetti();
    }
  }, [trigger, createConfetti]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              className="confetti absolute"
              initial={{
                left: `${piece.x}%`,
                top: '50%',
                rotate: piece.rotation,
                scale: 0,
              }}
              animate={{
                left: `${piece.x + (Math.random() - 0.5) * 80}%`,
                top: `${100 + Math.random() * 20}%`,
                rotate: piece.rotation + Math.random() * 720,
                scale: piece.scale,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: duration / 1000,
                ease: [0.2, 0.8, 0.2, 1],
              }}
              style={{
                backgroundColor: piece.color,
                width: '10px',
                height: '10px',
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

// Hook for programmatic confetti triggering
export const useConfetti = () => {
  const [trigger, setTrigger] = useState(false);

  const fire = useCallback(() => {
    setTrigger(true);
    setTimeout(() => setTrigger(false), 100);
  }, []);

  return { trigger, fire };
};

export default Confetti;

