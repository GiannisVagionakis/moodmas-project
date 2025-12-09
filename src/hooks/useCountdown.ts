import { useState, useEffect, useCallback } from 'react';
import { getTimeRemaining, isActiveHours } from '../services/storage';

export interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isActive: boolean;
  isEnded: boolean;
  formattedTime: string;
  percentRemaining: number;
}

export interface UseCountdownReturn extends CountdownState {
  reset: () => void;
}

export const useCountdown = (): UseCountdownReturn => {
  const [state, setState] = useState<CountdownState>(() => {
    const remaining = getTimeRemaining();
    const totalSeconds = remaining.hours * 3600 + remaining.minutes * 60 + remaining.seconds;
    const isActive = isActiveHours();
    
    return {
      ...remaining,
      totalSeconds,
      isActive,
      isEnded: !isActive && new Date().getHours() >= 11,
      formattedTime: formatTime(remaining.hours, remaining.minutes, remaining.seconds),
      percentRemaining: calculatePercentRemaining(totalSeconds),
    };
  });

  const reset = useCallback(() => {
    const remaining = getTimeRemaining();
    const totalSeconds = remaining.hours * 3600 + remaining.minutes * 60 + remaining.seconds;
    const isActive = isActiveHours();
    
    setState({
      ...remaining,
      totalSeconds,
      isActive,
      isEnded: !isActive && new Date().getHours() >= 11,
      formattedTime: formatTime(remaining.hours, remaining.minutes, remaining.seconds),
      percentRemaining: calculatePercentRemaining(totalSeconds),
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining();
      const totalSeconds = remaining.hours * 3600 + remaining.minutes * 60 + remaining.seconds;
      const isActive = isActiveHours();
      
      setState({
        ...remaining,
        totalSeconds,
        isActive,
        isEnded: !isActive && new Date().getHours() >= 11,
        formattedTime: formatTime(remaining.hours, remaining.minutes, remaining.seconds),
        percentRemaining: calculatePercentRemaining(totalSeconds),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    ...state,
    reset,
  };
};

// Helper function to format time as HH:MM:SS
function formatTime(hours: number, minutes: number, seconds: number): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// Calculate percentage of time remaining (3 hours total = 10800 seconds)
function calculatePercentRemaining(totalSeconds: number): number {
  const maxSeconds = 3 * 60 * 60; // 3 hours
  return Math.max(0, Math.min(100, (totalSeconds / maxSeconds) * 100));
}

export default useCountdown;

