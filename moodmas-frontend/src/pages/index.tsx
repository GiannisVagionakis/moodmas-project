import React, { useCallback } from 'react';
import type { HeadFC, PageProps } from 'gatsby';
import { ChristmasLayout } from '../components/Layout/ChristmasLayout';
import { Dashboard } from '../components/Dashboard/Dashboard';
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
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold font-display mb-2">
            <span className="bg-gradient-to-r from-red-400 via-white to-green-400 bg-clip-text text-transparent">
              🎄 MoodMas 🎄
            </span>
          </h1>
          <p className="text-lg text-white/60">
            ☀️ Morning Mood Battle • 08:00 - 11:00
          </p>
        </div>

        {/* Show winner if day is finalized */}
        {todayStats.isFinalized && todayStats.winner && (
          <div className="mb-8">
            <DailyWinner stats={todayStats} />
          </div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Dashboard stats */}
          <div className="lg:col-span-2">
            <Dashboard
              todayStats={todayStats}
              weeklyStats={weeklyStats}
              recentCheckins={recentCheckins}
              lastCheckIn={lastCheckIn}
            />
          </div>

          {/* Right column - Camera and controls */}
          <div className="lg:col-span-1 space-y-6">
            <CameraView
              onMoodCapture={handleMoodCapture}
              isActive={isActive}
            />

            {/* Weekly standings */}
            <WeeklyStandings stats={weeklyStats} />
            
            {/* Settings Card */}
            <GlassCard className="p-4 space-y-3">
              {/* Sound Test Button */}
              <button
                onClick={() => {
                  sounds.checkin();
                  setTimeout(() => sounds.achievement(), 300);
                }}
                className="w-full btn-glass bg-blue-500/10 hover:bg-blue-500/30 text-blue-300 text-sm flex items-center justify-center gap-2"
              >
                🔊 Test Sounds
              </button>
              
              {/* Reset Stats Button - No confirmation needed */}
              <button
                onClick={handleResetStats}
                className="w-full btn-glass bg-red-500/10 hover:bg-red-500/30 text-red-300 text-sm flex items-center justify-center gap-2"
              >
                🗑️ Reset All Stats
              </button>
            </GlassCard>
          </div>
        </div>

        {/* Achievements Section - Full width below the main grid */}
        <div className="mt-6">
          <AchievementCard achievements={achievements} />
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-white/30 text-sm">
          <p>🎄 MoodMas • Xmas Coding Hackathon 2025 🎄</p>
          <p className="mt-1">May the happiest side win! 🏆</p>
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

