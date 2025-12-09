import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'red' | 'green' | 'gold';
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

const variantStyles = {
  default: 'glass-card',
  red: 'glass-card-red',
  green: 'glass-card-green',
  gold: 'glass-card border-yellow-400/30 bg-yellow-400/10',
};

const glowStyles = {
  default: 'hover:shadow-white/20',
  red: 'shadow-red-500/30 hover:shadow-red-500/50',
  green: 'shadow-green-500/30 hover:shadow-green-500/50',
  gold: 'shadow-yellow-400/30 hover:shadow-yellow-400/50',
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  glow = false,
  onClick,
}) => {
  return (
    <motion.div
      className={`
        ${variantStyles[variant]}
        ${glow ? glowStyles[variant] : ''}
        ${hover ? 'transition-all duration-300 hover:scale-[1.02]' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={hover ? { y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;

