import React, { useEffect, useCallback, useState, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../Effects/GlassCard';
import { useWebcam } from '../../hooks/useWebcam';
import { useFaceDetection } from '../../hooks/useFaceDetection';
import { useDirectionTracking } from '../../hooks/useDirectionTracking';
import type { TeamType, EmotionScores } from '../../types';

interface CameraViewProps {
  onMoodCapture: (team: TeamType, emotions: EmotionScores) => void;
  isActive: boolean;
}

const emotionEmoji: Record<string, string> = {
  happy: '😊',
  neutral: '😐',
  sad: '😢',
  surprised: '😲',
  angry: '😠',
  fearful: '😨',
  disgusted: '🤢',
};

export const CameraView: React.FC<CameraViewProps> = memo(({
  onMoodCapture,
  isActive,
}) => {
  const { videoRef, isLoading, isStreaming, error, startCamera, stopCamera } = useWebcam();
  const { isModelLoaded, loadingProgress, currentDetection, startDetection, stopDetection } = useFaceDetection();
  const [showCapture, setShowCapture] = useState(false);
  const [lastCapturedTeam, setLastCapturedTeam] = useState<TeamType | null>(null);
  const detectionStartedRef = useRef(false);

  // Handle exit detection
  const handleExit = useCallback((team: TeamType, emotions: EmotionScores | null) => {
    if (emotions && isActive) {
      onMoodCapture(team, emotions);
      setLastCapturedTeam(team);
      setShowCapture(true);
      setTimeout(() => setShowCapture(false), 2000);
    }
  }, [onMoodCapture, isActive]);

  const { trackPosition, isTracking, setLastEmotions } = useDirectionTracking(
    { videoWidth: 640, exitThreshold: 10 },
    handleExit
  );

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      stopDetection();
    };
  }, []);

  // Start face detection when camera is streaming and models are loaded
  useEffect(() => {
    if (isStreaming && isModelLoaded && videoRef.current && !detectionStartedRef.current) {
      detectionStartedRef.current = true;
      startDetection(videoRef.current);
    }
  }, [isStreaming, isModelLoaded, startDetection]);

  // Track face position and emotions - only when detection changes
  useEffect(() => {
    if (currentDetection) {
      trackPosition(currentDetection.position);
      if (currentDetection.emotions) {
        setLastEmotions(currentDetection.emotions);
      }
    }
  }, [currentDetection]);

  return (
    <GlassCard className="p-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.div
            className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-red-500' : 'bg-gray-500'}`}
            animate={isStreaming ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="font-semibold">📷 Mood Camera</span>
        </div>
        <div className="text-xs text-white/50">
          {!isModelLoaded && `Loading AI: ${loadingProgress}%`}
          {isModelLoaded && isStreaming && (isTracking ? '👤 Face Detected' : '🔍 Scanning...')}
        </div>
      </div>

      {/* Video container */}
      <div className="relative aspect-video bg-black/50 rounded-xl overflow-hidden">
        {/* Loading state */}
        {(isLoading || !isModelLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <p className="text-white/60">
                {isLoading ? 'Starting camera...' : `Loading AI models... ${loadingProgress}%`}
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
            <div className="text-center p-4">
              <span className="text-4xl mb-2 block">⚠️</span>
              <p className="text-red-300">{error}</p>
              <button
                onClick={startCamera}
                className="mt-4 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Video element */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover transform scale-x-[-1]"
          playsInline
          muted
        />

        {/* Direction indicators */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-red-500/30 to-transparent flex items-center justify-start pl-2">
          <motion.span
            className="text-3xl"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🎅
          </motion.span>
        </div>
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-green-500/30 to-transparent flex items-center justify-end pr-2">
          <motion.span
            className="text-3xl"
            animate={{ x: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🦌
          </motion.span>
        </div>

        {/* Face detection overlay - mirror the X position since video is flipped */}
        {currentDetection?.faceDetected && currentDetection.position && (
          <motion.div
            className="absolute w-20 h-20 border-3 border-green-400 rounded-xl shadow-lg shadow-green-400/50"
            style={{
              // Mirror the X position (100% - x%) because video is flipped with scaleX(-1)
              // Use actual video dimensions instead of hardcoded 640x480
              left: videoRef.current
                ? `${100 - (currentDetection.position.x / videoRef.current.videoWidth) * 100}%`
                : '50%',
              top: videoRef.current
                ? `${(currentDetection.position.y / videoRef.current.videoHeight) * 100}%`
                : '50%',
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            {/* Corner markers for better visibility */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-green-400 rounded-tl" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-green-400 rounded-tr" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-green-400 rounded-bl" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-green-400 rounded-br" />

            {/* Emotion indicator */}
            {currentDetection.dominantEmotion && (
              <motion.div
                className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 rounded-full px-4 py-2 flex items-center gap-2 whitespace-nowrap"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <span className="text-2xl">{emotionEmoji[currentDetection.dominantEmotion]}</span>
                <span className="text-sm font-semibold capitalize">{currentDetection.dominantEmotion}</span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Capture animation */}
        <AnimatePresence>
          {showCapture && lastCapturedTeam && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={`px-8 py-4 rounded-2xl ${lastCapturedTeam === 'LEFT' ? 'bg-red-500' : 'bg-green-500'
                  }`}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
              >
                <span className="text-2xl font-bold">
                  {lastCapturedTeam === 'LEFT' ? '🎅' : '🦌'} +1 Team {lastCapturedTeam}!
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inactive overlay */}
        {!isActive && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-center">
              <span className="text-4xl mb-2 block">🌙</span>
              <p className="text-white/80 font-semibold">Voting Closed</p>
              <p className="text-white/50 text-sm">Come back between 15:00 - 17:30</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-white/60">
        <p>👈 Walk LEFT for Team Santa | Walk RIGHT for Team Reindeer 👉</p>
        <p className="text-xs mt-1 text-white/40">
          Your mood will be captured as you exit the camera view
        </p>
      </div>
    </GlassCard>
  );
});

CameraView.displayName = 'CameraView';

export default CameraView;

