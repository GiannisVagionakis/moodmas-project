import type { Achievement, MoodCheck, DailyStats } from '../types';
import { 
  getAchievements, 
  unlockAchievement, 
  getMoodChecks, 
  getTodayMoodChecks,
  getWeeklyStats 
} from './storage';
import { sounds } from './sounds';

export interface AchievementCheckResult {
  newlyUnlocked: Achievement[];
  allAchievements: Achievement[];
}

// Check all achievement conditions after a mood check
export const checkAllAchievements = (moodCheck: MoodCheck): AchievementCheckResult => {
  const newlyUnlocked: Achievement[] = [];
  const now = new Date(moodCheck.timestamp);
  const allChecks = getMoodChecks();
  const todayChecks = getTodayMoodChecks();
  const weeklyStats = getWeeklyStats();

  // 1. Early Bird - check-in before 08:30
  if (now.getHours() === 8 && now.getMinutes() < 30) {
    const result = unlockAchievement('early_bird');
    if (result) newlyUnlocked.push(result);
  }

  // 2. First Blood - first check-in of the day
  if (todayChecks.length === 1) {
    const result = unlockAchievement('first_blood');
    if (result) newlyUnlocked.push(result);
  }

  // 3. Mood Booster - 90%+ happiness score
  if (moodCheck.happinessScore >= 90) {
    const result = unlockAchievement('mood_booster');
    if (result) newlyUnlocked.push(result);
  }

  // 4. Happy Camper - 5 happy check-ins in a row
  const lastFive = allChecks.slice(-5);
  if (lastFive.length >= 5 && lastFive.every(c => c.dominantEmotion === 'happy')) {
    const result = unlockAchievement('happy_camper');
    if (result) newlyUnlocked.push(result);
  }

  // 5. Team Spirit - 10 check-ins for one team
  const teamChecks = allChecks.filter(c => c.team === moodCheck.team);
  if (teamChecks.length >= 10) {
    const result = unlockAchievement('team_spirit');
    if (result) newlyUnlocked.push(result);
  }

  // 6. Streak Master - team wins 3 days in a row
  const streak = moodCheck.team === 'LEFT' ? weeklyStats.leftStreak : weeklyStats.rightStreak;
  if (streak >= 3) {
    const result = unlockAchievement('streak_master');
    if (result) newlyUnlocked.push(result);
  }

  // 7. Christmas Cheer - happy during Christmas week (Dec 20-26)
  const isChristmasWeek = now.getMonth() === 11 && now.getDate() >= 20 && now.getDate() <= 26;
  if (isChristmasWeek && moodCheck.dominantEmotion === 'happy') {
    const result = unlockAchievement('christmas_cheer');
    if (result) newlyUnlocked.push(result);
  }

  // 8. Consistent - check-in every day for a week
  const uniqueDays = new Set(
    allChecks.map(c => new Date(c.timestamp).toISOString().split('T')[0])
  );
  if (uniqueDays.size >= 7) {
    const result = unlockAchievement('consistent');
    if (result) newlyUnlocked.push(result);
  }

  // Play achievement sound if any were unlocked
  if (newlyUnlocked.length > 0) {
    sounds.achievement();
  }

  return {
    newlyUnlocked,
    allAchievements: getAchievements(),
  };
};

// Get achievement progress for display
export const getAchievementProgress = (): Record<string, { current: number; target: number }> => {
  const allChecks = getMoodChecks();
  const todayChecks = getTodayMoodChecks();
  const weeklyStats = getWeeklyStats();

  // Count consecutive happy check-ins from the end
  let happyStreak = 0;
  for (let i = allChecks.length - 1; i >= 0; i--) {
    if (allChecks[i].dominantEmotion === 'happy') {
      happyStreak++;
    } else {
      break;
    }
  }

  // Count unique days with check-ins
  const uniqueDays = new Set(
    allChecks.map(c => new Date(c.timestamp).toISOString().split('T')[0])
  );

  // Count team check-ins
  const leftCheckins = allChecks.filter(c => c.team === 'LEFT').length;
  const rightCheckins = allChecks.filter(c => c.team === 'RIGHT').length;

  return {
    early_bird: { current: todayChecks.length > 0 && new Date(todayChecks[0].timestamp).getHours() < 9 ? 1 : 0, target: 1 },
    first_blood: { current: todayChecks.length > 0 ? 1 : 0, target: 1 },
    mood_booster: { current: Math.max(...allChecks.map(c => c.happinessScore), 0), target: 90 },
    happy_camper: { current: happyStreak, target: 5 },
    team_spirit: { current: Math.max(leftCheckins, rightCheckins), target: 10 },
    streak_master: { current: Math.max(weeklyStats.leftStreak, weeklyStats.rightStreak), target: 3 },
    consistent: { current: uniqueDays.size, target: 7 },
    christmas_cheer: { current: 0, target: 1 }, // Special condition
  };
};

// Format achievement for display
export const formatAchievement = (achievement: Achievement): string => {
  if (achievement.unlockedAt) {
    const date = new Date(achievement.unlockedAt);
    return `Unlocked ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  }
  return 'Not yet unlocked';
};

