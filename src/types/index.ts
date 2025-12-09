// Emotion types from face-api.js
export type EmotionType = 'happy' | 'neutral' | 'sad' | 'surprised' | 'angry' | 'fearful' | 'disgusted';

export type TeamType = 'LEFT' | 'RIGHT';

export interface EmotionScores {
  happy: number;
  neutral: number;
  sad: number;
  surprised: number;
  angry: number;
  fearful: number;
  disgusted: number;
}

export interface MoodCheck {
  id: string;
  timestamp: number;
  team: TeamType;
  dominantEmotion: EmotionType;
  emotionScores: EmotionScores;
  happinessScore: number; // 0-100, higher is happier
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  leftScore: number;
  rightScore: number;
  leftCheckins: number;
  rightCheckins: number;
  leftMoodBreakdown: MoodBreakdown;
  rightMoodBreakdown: MoodBreakdown;
  winner: TeamType | null;
  isFinalized: boolean;
}

export interface MoodBreakdown {
  happy: number;
  neutral: number;
  tired: number; // sad + fearful + angry combined
}

export interface WeeklyStats {
  weekStart: string;
  leftWins: number;
  rightWins: number;
  leftStreak: number;
  rightStreak: number;
  dailyResults: DailyStats[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
  condition: string;
}

export interface FacePosition {
  x: number;
  y: number;
  timestamp: number;
}

export interface DetectionResult {
  faceDetected: boolean;
  position: FacePosition | null;
  emotions: EmotionScores | null;
  dominantEmotion: EmotionType | null;
}

export interface AppState {
  isActive: boolean; // true between 15:00-17:30
  todayStats: DailyStats;
  weeklyStats: WeeklyStats;
  achievements: Achievement[];
  recentCheckins: MoodCheck[];
  lastCheckIn: MoodCheck | null;
}

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'First check-in before 08:30',
    icon: '🐦',
    unlockedAt: null,
    condition: 'checkin_before_0830',
  },
  {
    id: 'happy_camper',
    name: 'Happy Camper',
    description: '5 happy check-ins in a row',
    icon: '😊',
    unlockedAt: null,
    condition: '5_happy_streak',
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Team wins 3 days in a row',
    icon: '🔥',
    unlockedAt: null,
    condition: '3_day_win_streak',
  },
  {
    id: 'mood_booster',
    name: 'Mood Booster',
    description: 'Check-in with 90%+ happiness',
    icon: '🚀',
    unlockedAt: null,
    condition: 'happiness_90_plus',
  },
  {
    id: 'consistent',
    name: 'Consistent',
    description: 'Check-in every day for a week',
    icon: '📅',
    unlockedAt: null,
    condition: '7_day_checkin_streak',
  },
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'First check-in of the day',
    icon: '🎯',
    unlockedAt: null,
    condition: 'first_checkin_today',
  },
  {
    id: 'team_spirit',
    name: 'Team Spirit',
    description: '10 check-ins for your team',
    icon: '🤝',
    unlockedAt: null,
    condition: '10_team_checkins',
  },
  {
    id: 'christmas_cheer',
    name: 'Christmas Cheer',
    description: 'Be happy on Christmas week',
    icon: '🎄',
    unlockedAt: null,
    condition: 'happy_christmas_week',
  },
];

