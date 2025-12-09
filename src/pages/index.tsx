import React, { useCallback } from 'react';
import type { HeadFC, PageProps } from 'gatsby';
import { ChristmasLayout } from '../components/Layout/ChristmasLayout';
import { Dashboard } from '../components/Dashboard/Dashboard';
import { CountdownTimer } from '../components/Dashboard/CountdownTimer';
import { TeamScore } from '../components/Dashboard/TeamScore';
import { MoodBreakdown } from '../components/Dashboard/MoodBreakdown';
import { CameraView } from '../components/Camera/CameraView';
import { AchievementToast, AchievementCard } from '../components/Achievements';
import { WeeklyStandings } from '../components/Leaderboard/WeeklyStandings';
import { DailyWinner } from '../components/Leaderboard/DailyWinner';
import { Confetti, useConfetti } from '../components/Effects/Confetti';
import { BackgroundMusic } from '../components/Effects/BackgroundMusic';
import { GlassCard } from '../components/Effects/GlassCard';
import { useMoodStore } from '../hooks/useMoodStore';
import { sounds } from '../services/sounds';
import { clearAllData } from '../services/storage';
import type { TeamType, EmotionScores } from '../types';

const IndexPage: React.FC<PageProps> = () => {
  const {
    todayStats,
    weeklyStats,
    achievements,
    recentCheckins,
    isActive,
    lastCheckIn,
    newAchievements,
    submitMoodCheck,
    clearNewAchievements,
    refreshStats,
  } = useMoodStore();

  const { trigger: confettiTrigger, fire: fireConfetti } = useConfetti();

  const handleMoodCapture = useCallback((team: TeamType, emotions: EmotionScores) => {
    const moodCheck = submitMoodCheck(team, emotions);

    // Fire confetti for high happiness scores
    if (moodCheck.happinessScore >= 80) {
      fireConfetti();
      sounds.celebration();
    }
  }, [submitMoodCheck, fireConfetti]);

  const handleResetStats = () => {
    clearAllData();
    refreshStats();
    // Clear session storage for countdown reset
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('moodmas_session_start');
    }
    window.location.reload();
  };

  return (
    <ChristmasLayout>
      {/* Background Christmas music */}
      <BackgroundMusic />

      {/* Confetti effect */}
      <Confetti trigger={confettiTrigger} />

      {/* Achievement toast notification (auto-dismisses) */}
      <AchievementToast
        newAchievements={newAchievements}
        onDismiss={clearNewAchievements}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Centered Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-2">
            <span className="bg-gradient-to-r from-red-400 via-white to-green-400 bg-clip-text text-transparent">
              🎄 MoodMas 🎄
            </span>
          </h1>
          <p className="text-base text-white/60">
            ☀️ Morning Mood Battle • 08:00 - 11:00
          </p>
        </div>

        {/* Show winner if day is finalized */}
        {todayStats.isFinalized && todayStats.winner && (
          <div className="mb-4">
            <DailyWinner stats={todayStats} />
          </div>
        )}

        {/* 1. Timer - Full width at top */}
        <div className="mb-6">
          <CountdownTimer />
        </div>

        {/* 2. Camera (left) and Scores (right) in two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Camera - Left Column */}
          <div>
            <CameraView
              onMoodCapture={handleMoodCapture}
              isActive={isActive}
            />
          </div>

          {/* Team Scores - Right Column (side by side) */}
          <div className="grid grid-cols-2 gap-4">
            <TeamScore
              team="LEFT"
              score={todayStats.leftScore}
              checkins={todayStats.leftCheckins}
              moodBreakdown={todayStats.leftMoodBreakdown}
              isLeading={todayStats.leftScore > todayStats.rightScore}
              difference={todayStats.leftScore > todayStats.rightScore ? Math.abs(todayStats.leftScore - todayStats.rightScore) : 0}
            />

            <TeamScore
              team="RIGHT"
              score={todayStats.rightScore}
              checkins={todayStats.rightCheckins}
              moodBreakdown={todayStats.rightMoodBreakdown}
              isLeading={todayStats.rightScore > todayStats.leftScore}
              difference={todayStats.rightScore > todayStats.leftScore ? Math.abs(todayStats.rightScore - todayStats.leftScore) : 0}
            />
          </div>
        </div>

        {/* Other components in two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-6">
            {/* Weekly Stats */}
            <GlassCard className="p-4">
              <div className="text-center space-y-3">
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Weekly Score</p>
                  <p className="text-xl font-bold">
                    <span className="text-red-400">🎅 {weeklyStats.leftWins}</span>
                    <span className="text-white/30 mx-2">vs</span>
                    <span className="text-green-400">{weeklyStats.rightWins} 🦌</span>
                  </p>
                </div>

                {(weeklyStats.leftStreak > 0 || weeklyStats.rightStreak > 0) && (
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Win Streak</p>
                    <p className="text-base font-bold">
                      {weeklyStats.leftStreak > 0 && (
                        <span className="text-red-400">🔥 Left: {weeklyStats.leftStreak} days</span>
                      )}
                      {weeklyStats.rightStreak > 0 && (
                        <span className="text-green-400">🔥 Right: {weeklyStats.rightStreak} days</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Mood Breakdown */}
            <MoodBreakdown
              recentCheckins={recentCheckins}
              lastCheckIn={lastCheckIn}
            />
          </div>

          <div className="space-y-6">
            {/* Weekly Standings */}
            <WeeklyStandings stats={weeklyStats} />

            {/* Settings Card */}
            <GlassCard className="p-3 space-y-2">
              <button
                onClick={() => {
                  sounds.checkin();
                  setTimeout(() => sounds.achievement(), 300);
                }}
                className="w-full btn-glass bg-blue-500/10 hover:bg-blue-500/30 text-blue-300 text-xs py-2 flex items-center justify-center gap-2"
              >
                🔊 Test Sounds
              </button>

              <button
                onClick={handleResetStats}
                className="w-full btn-glass bg-red-500/10 hover:bg-red-500/30 text-red-300 text-xs py-2 flex items-center justify-center gap-2"
              >
                🗑️ Reset Stats
              </button>
            </GlassCard>
          </div>
        </div>

        {/* Achievements - Full width */}
        <div className="mb-6">
          <AchievementCard achievements={achievements} />
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-white/30 text-xs">
          <p>🎄 MoodMas • Xmas Coding Hackathon 2025 🎄</p>
        </footer>
      </div>
    </ChristmasLayout>
  );
};

export default IndexPage;

export const Head: HeadFC = () => (
  <>
    <title>MoodMas 🎄 Morning Mood Battle</title>
    <meta name="description" content="AI-powered morning mood battle - Team Left vs Team Right!" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎄</text></svg>" />
  </>
);

