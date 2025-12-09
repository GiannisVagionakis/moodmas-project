import { useState, useEffect, useCallback } from 'react';
import type { 
  MoodCheck, 
  DailyStats, 
  WeeklyStats, 
  Achievement, 
  TeamType, 
  EmotionScores 
} from '../types';
import {
  getDailyStats,
  getWeeklyStats,
  getAchievements,
  addMoodCheck,
  getTodayMoodChecks,
  isActiveHours,
  getTimeRemaining,
} from '../services/storage';
import { checkAllAchievements } from '../services/achievements';
import { sounds } from '../services/sounds';

export interface UseMoodStoreReturn {
  // State
  todayStats: DailyStats;
  weeklyStats: WeeklyStats;
  achievements: Achievement[];
  recentCheckins: MoodCheck[];
  isActive: boolean;
  timeRemaining: { hours: number; minutes: number; seconds: number };
  lastCheckIn: MoodCheck | null;
  newAchievements: Achievement[];
  
  // Actions
  submitMoodCheck: (team: TeamType, emotions: EmotionScores) => MoodCheck;
  refreshStats: () => void;
  clearNewAchievements: () => void;
}

export const useMoodStore = (): UseMoodStoreReturn => {
  const [todayStats, setTodayStats] = useState<DailyStats>(() => getDailyStats());
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>(() => getWeeklyStats());
  const [achievements, setAchievements] = useState<Achievement[]>(() => getAchievements());
  const [recentCheckins, setRecentCheckins] = useState<MoodCheck[]>(() => getTodayMoodChecks().slice(-10));
  const [isActive, setIsActive] = useState(() => isActiveHours());
  const [timeRemaining, setTimeRemaining] = useState(() => getTimeRemaining());
  const [lastCheckIn, setLastCheckIn] = useState<MoodCheck | null>(null);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [previousWinner, setPreviousWinner] = useState<TeamType | null>(null);

  // Update time remaining every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining());
      setIsActive(isActiveHours());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Refresh all stats from storage
  const refreshStats = useCallback(() => {
    setTodayStats(getDailyStats());
    setWeeklyStats(getWeeklyStats());
    setAchievements(getAchievements());
    setRecentCheckins(getTodayMoodChecks().slice(-10));
  }, []);

  // Submit a new mood check
  const submitMoodCheck = useCallback((team: TeamType, emotions: EmotionScores): MoodCheck => {
    // Store previous winner for lead change detection
    const prevStats = getDailyStats();
    const prevWinner = prevStats.winner;

    // Add the mood check
    const moodCheck = addMoodCheck(team, emotions);
    
    // Play check-in sound
    sounds.checkin();
    
    // Check for achievements
    const { newlyUnlocked, allAchievements } = checkAllAchievements(moodCheck);
    
    // Update state
    const newStats = getDailyStats();
    setTodayStats(newStats);
    setWeeklyStats(getWeeklyStats());
    setAchievements(allAchievements);
    setRecentCheckins(getTodayMoodChecks().slice(-10));
    setLastCheckIn(moodCheck);
    
    if (newlyUnlocked.length > 0) {
      setNewAchievements(newlyUnlocked);
    }
    
    // Check for lead change
    if (prevWinner !== newStats.winner && newStats.winner !== null) {
      sounds.leadChange();
    }
    
    return moodCheck;
  }, []);

  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  return {
    todayStats,
    weeklyStats,
    achievements,
    recentCheckins,
    isActive,
    timeRemaining,
    lastCheckIn,
    newAchievements,
    submitMoodCheck,
    refreshStats,
    clearNewAchievements,
  };
};

export default useMoodStore;

