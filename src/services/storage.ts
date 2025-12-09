import { v4 as uuidv4 } from 'uuid';
import type {
  MoodCheck,
  DailyStats,
  WeeklyStats,
  Achievement,
  TeamType,
  EmotionType,
  EmotionScores,
  MoodBreakdown,
  ACHIEVEMENTS,
} from '../types';

const STORAGE_KEYS = {
  MOOD_CHECKS: 'moodmas_mood_checks',
  DAILY_STATS: 'moodmas_daily_stats',
  ACHIEVEMENTS: 'moodmas_achievements',
  SETTINGS: 'moodmas_settings',
};

// Helper to get today's date string
export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Helper to check if we're in active hours (15:00 - 16:00)
export const isActiveHours = (): boolean => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  // 15:00 = 900 minutes, 17:30 = 1050 minutes
  return timeInMinutes >= 900 && timeInMinutes < 1050;
};

// Calculate time remaining until 17:30
export const getTimeRemaining = (): { hours: number; minutes: number; seconds: number } => {
  const now = new Date();

  // Calculate end time for today at 17:30
  const endTime = new Date();
  endTime.setHours(17, 30, 0, 0);

  const diff = endTime.getTime() - now.getTime();

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
};

// Calculate happiness score from emotions using simple point system
// Happy = 10 points, Neutral = 5 points, Sad/Tired = -5 points
export const calculateHappinessScore = (emotions: EmotionScores): number => {
  // Get the dominant emotion
  const emotionEntries = Object.entries(emotions) as [EmotionType, number][];
  const [dominantEmotion] = emotionEntries.reduce((max, current) =>
    current[1] > max[1] ? current : max
  );

  // Assign points based on dominant emotion
  if (dominantEmotion === 'happy' || dominantEmotion === 'surprised') {
    return 10; // Happy/Surprised = 10 points
  } else if (dominantEmotion === 'neutral') {
    return 5; // Neutral = 5 points
  } else {
    return -5; // Sad/Tired (sad, angry, fearful, disgusted) = -5 points
  }
};

// Get dominant emotion from scores
export const getDominantEmotion = (emotions: EmotionScores): EmotionType => {
  let maxScore = 0;
  let dominant: EmotionType = 'neutral';

  (Object.keys(emotions) as EmotionType[]).forEach((emotion) => {
    if (emotions[emotion] > maxScore) {
      maxScore = emotions[emotion];
      dominant = emotion;
    }
  });

  return dominant;
};

// Create empty daily stats
const createEmptyDailyStats = (date: string): DailyStats => ({
  date,
  leftScore: 0,
  rightScore: 0,
  leftCheckins: 0,
  rightCheckins: 0,
  leftMoodBreakdown: { happy: 0, neutral: 0, tired: 0 },
  rightMoodBreakdown: { happy: 0, neutral: 0, tired: 0 },
  winner: null,
  isFinalized: false,
});

// Get all mood checks
export const getMoodChecks = (): MoodCheck[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.MOOD_CHECKS);
  return data ? JSON.parse(data) : [];
};

// Get today's mood checks
export const getTodayMoodChecks = (): MoodCheck[] => {
  const today = getTodayDateString();
  const startOfDay = new Date(today).getTime();
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

  return getMoodChecks().filter(
    (check) => check.timestamp >= startOfDay && check.timestamp < endOfDay
  );
};

// Add a new mood check
export const addMoodCheck = (
  team: TeamType,
  emotionScores: EmotionScores
): MoodCheck => {
  const moodCheck: MoodCheck = {
    id: uuidv4(),
    timestamp: Date.now(),
    team,
    dominantEmotion: getDominantEmotion(emotionScores),
    emotionScores,
    happinessScore: calculateHappinessScore(emotionScores),
  };

  const checks = getMoodChecks();
  checks.push(moodCheck);
  localStorage.setItem(STORAGE_KEYS.MOOD_CHECKS, JSON.stringify(checks));

  // Update daily stats
  updateDailyStats(moodCheck);

  return moodCheck;
};

// Get daily stats for a date
export const getDailyStats = (date?: string): DailyStats => {
  if (typeof window === 'undefined') {
    return createEmptyDailyStats(date || getTodayDateString());
  }

  const targetDate = date || getTodayDateString();
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_STATS);
  const allStats: Record<string, DailyStats> = data ? JSON.parse(data) : {};

  return allStats[targetDate] || createEmptyDailyStats(targetDate);
};

// Update daily stats with a new mood check
const updateDailyStats = (moodCheck: MoodCheck): void => {
  const date = new Date(moodCheck.timestamp).toISOString().split('T')[0];
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_STATS);
  const allStats: Record<string, DailyStats> = data ? JSON.parse(data) : {};

  const stats = allStats[date] || createEmptyDailyStats(date);

  // Update scores and check-in counts
  if (moodCheck.team === 'LEFT') {
    stats.leftScore += moodCheck.happinessScore;
    stats.leftCheckins += 1;
    updateMoodBreakdown(stats.leftMoodBreakdown, moodCheck.dominantEmotion);
  } else {
    stats.rightScore += moodCheck.happinessScore;
    stats.rightCheckins += 1;
    updateMoodBreakdown(stats.rightMoodBreakdown, moodCheck.dominantEmotion);
  }

  // Determine current leader
  if (stats.leftScore > stats.rightScore) {
    stats.winner = 'LEFT';
  } else if (stats.rightScore > stats.leftScore) {
    stats.winner = 'RIGHT';
  } else {
    stats.winner = null;
  }

  allStats[date] = stats;
  localStorage.setItem(STORAGE_KEYS.DAILY_STATS, JSON.stringify(allStats));
};

// Update mood breakdown
const updateMoodBreakdown = (breakdown: MoodBreakdown, emotion: EmotionType): void => {
  if (emotion === 'happy' || emotion === 'surprised') {
    breakdown.happy += 1;
  } else if (emotion === 'neutral') {
    breakdown.neutral += 1;
  } else {
    breakdown.tired += 1;
  }
};

// Finalize today's stats (called at 17:30)
export const finalizeDailyStats = (): DailyStats => {
  const today = getTodayDateString();
  const stats = getDailyStats(today);

  if (!stats.isFinalized) {
    stats.isFinalized = true;

    const data = localStorage.getItem(STORAGE_KEYS.DAILY_STATS);
    const allStats: Record<string, DailyStats> = data ? JSON.parse(data) : {};
    allStats[today] = stats;
    localStorage.setItem(STORAGE_KEYS.DAILY_STATS, JSON.stringify(allStats));
  }

  return stats;
};

// Get weekly stats
export const getWeeklyStats = (): WeeklyStats => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  weekStart.setHours(0, 0, 0, 0);

  const dailyResults: DailyStats[] = [];
  let leftWins = 0;
  let rightWins = 0;

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const stats = getDailyStats(dateStr);
    dailyResults.push(stats);

    if (stats.isFinalized) {
      if (stats.winner === 'LEFT') leftWins++;
      if (stats.winner === 'RIGHT') rightWins++;
    }
  }

  // Calculate streaks
  const leftStreak = calculateStreak('LEFT', dailyResults);
  const rightStreak = calculateStreak('RIGHT', dailyResults);

  return {
    weekStart: weekStart.toISOString().split('T')[0],
    leftWins,
    rightWins,
    leftStreak,
    rightStreak,
    dailyResults,
  };
};

// Calculate win streak for a team
const calculateStreak = (team: TeamType, results: DailyStats[]): number => {
  let streak = 0;

  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i].isFinalized && results[i].winner === team) {
      streak++;
    } else if (results[i].isFinalized) {
      break;
    }
  }

  return streak;
};

// Get achievements
export const getAchievements = (): Achievement[] => {
  if (typeof window === 'undefined') {
    const { ACHIEVEMENTS } = require('../types');
    return [...ACHIEVEMENTS];
  }

  const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
  if (data) {
    return JSON.parse(data);
  }

  // Initialize with default achievements
  const { ACHIEVEMENTS } = require('../types');
  localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(ACHIEVEMENTS));
  return [...ACHIEVEMENTS];
};

// Unlock an achievement
export const unlockAchievement = (achievementId: string): Achievement | null => {
  const achievements = getAchievements();
  const achievement = achievements.find((a) => a.id === achievementId);

  if (achievement && !achievement.unlockedAt) {
    achievement.unlockedAt = Date.now();
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    return achievement;
  }

  return null;
};

// Check and unlock achievements based on current state
export const checkAchievements = (moodCheck: MoodCheck): Achievement[] => {
  const unlocked: Achievement[] = [];
  const now = new Date();
  const todayChecks = getTodayMoodChecks();

  // Early Bird - check-in before 08:30
  if (now.getHours() === 8 && now.getMinutes() < 30) {
    const result = unlockAchievement('early_bird');
    if (result) unlocked.push(result);
  }

  // First Blood - first check-in today
  if (todayChecks.length === 1) {
    const result = unlockAchievement('first_blood');
    if (result) unlocked.push(result);
  }

  // Mood Booster - 90%+ happiness
  if (moodCheck.happinessScore >= 90) {
    const result = unlockAchievement('mood_booster');
    if (result) unlocked.push(result);
  }

  // Happy Camper - 5 happy check-ins in a row
  const recentChecks = getMoodChecks().slice(-5);
  if (recentChecks.length >= 5 && recentChecks.every((c) => c.dominantEmotion === 'happy')) {
    const result = unlockAchievement('happy_camper');
    if (result) unlocked.push(result);
  }

  // Team Spirit - 10 team check-ins
  const allChecks = getMoodChecks();
  const teamChecks = allChecks.filter((c) => c.team === moodCheck.team);
  if (teamChecks.length >= 10) {
    const result = unlockAchievement('team_spirit');
    if (result) unlocked.push(result);
  }

  return unlocked;
};

// Clear all data (for testing)
export const clearAllData = (): void => {
  if (typeof window === 'undefined') return;

  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};

// Export stats for display
export const getDisplayStats = () => {
  const todayStats = getDailyStats();
  const weeklyStats = getWeeklyStats();
  const achievements = getAchievements();
  const recentCheckins = getTodayMoodChecks().slice(-10);

  return {
    today: todayStats,
    weekly: weeklyStats,
    achievements,
    recentCheckins,
    isActive: isActiveHours(),
    timeRemaining: getTimeRemaining(),
  };
};

