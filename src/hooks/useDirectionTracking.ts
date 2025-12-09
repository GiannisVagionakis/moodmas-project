import { useState, useRef, useCallback, useEffect } from 'react';
import type { FacePosition, TeamType, EmotionScores } from '../types';

export interface DirectionTrackingConfig {
  // Number of frames to track before determining direction
  historyLength: number;
  // Number of frames without face detection before considering "exit"
  exitThreshold: number;
  // Minimum movement (in pixels) to determine direction
  minMovement: number;
  // Video width for left/right boundary calculation
  videoWidth: number;
}

export interface UseDirectionTrackingReturn {
  trackPosition: (position: FacePosition | null) => void;
  exitDirection: TeamType | null;
  isTracking: boolean;
  positionHistory: FacePosition[];
  resetTracking: () => void;
  lastExitData: {
    team: TeamType;
    emotions: EmotionScores | null;
    timestamp: number;
  } | null;
  setLastEmotions: (emotions: EmotionScores) => void;
}

const DEFAULT_CONFIG: DirectionTrackingConfig = {
  historyLength: 30,
  exitThreshold: 15, // ~0.5 seconds at 30fps
  minMovement: 50,
  videoWidth: 640,
};

export const useDirectionTracking = (
  config: Partial<DirectionTrackingConfig> = {},
  onExit?: (team: TeamType, emotions: EmotionScores | null) => void
): UseDirectionTrackingReturn => {
  const settings = { ...DEFAULT_CONFIG, ...config };

  const [exitDirection, setExitDirection] = useState<TeamType | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [positionHistory, setPositionHistory] = useState<FacePosition[]>([]);
  const [lastExitData, setLastExitData] = useState<{
    team: TeamType;
    emotions: EmotionScores | null;
    timestamp: number;
  } | null>(null);

  const historyRef = useRef<FacePosition[]>([]);
  const noFaceCountRef = useRef(0);
  const lastEmotionsRef = useRef<EmotionScores | null>(null);
  const wasTrackingRef = useRef(false);

  const setLastEmotions = useCallback((emotions: EmotionScores) => {
    lastEmotionsRef.current = emotions;
  }, []);

  const resetTracking = useCallback(() => {
    historyRef.current = [];
    noFaceCountRef.current = 0;
    wasTrackingRef.current = false;
    setExitDirection(null);
    setPositionHistory([]);
    setIsTracking(false);
  }, []);

  const determineExitDirection = useCallback((): TeamType | null => {
    const history = historyRef.current;

    if (history.length < 5) return null;

    // Get the last few positions to determine movement direction
    const recentPositions = history.slice(-10);
    const firstPos = recentPositions[0];
    const lastPos = recentPositions[recentPositions.length - 1];

    // Calculate horizontal movement
    const horizontalMovement = lastPos.x - firstPos.x;

    // Check if there's significant horizontal movement
    if (Math.abs(horizontalMovement) < settings.minMovement) {
      // Not enough movement - check which side of screen the face was last seen
      // IMPORTANT: Video is mirrored with scaleX(-1), so we need to invert the logic
      const centerX = settings.videoWidth / 2;
      // When mirrored: left side of raw video = right side on screen
      return lastPos.x < centerX ? 'RIGHT' : 'LEFT';
    }

    // Determine direction based on movement
    // IMPORTANT: Since video is mirrored (scaleX(-1)):
    // - Moving left on screen = increasing X in raw coords = Team LEFT
    // - Moving right on screen = decreasing X in raw coords = Team RIGHT
    return horizontalMovement < 0 ? 'RIGHT' : 'LEFT';
  }, [settings.minMovement, settings.videoWidth]);

  const trackPosition = useCallback((position: FacePosition | null) => {
    if (position) {
      // Face detected - add to history
      noFaceCountRef.current = 0;
      wasTrackingRef.current = true;

      historyRef.current.push(position);

      // Keep history limited
      if (historyRef.current.length > settings.historyLength) {
        historyRef.current.shift();
      }

      setPositionHistory([...historyRef.current]);
      setIsTracking(true);
      setExitDirection(null);
    } else {
      // No face detected
      noFaceCountRef.current++;

      // Check if face has "exited" (been gone long enough)
      if (wasTrackingRef.current && noFaceCountRef.current >= settings.exitThreshold) {
        const direction = determineExitDirection();

        if (direction) {
          setExitDirection(direction);

          const exitData = {
            team: direction,
            emotions: lastEmotionsRef.current,
            timestamp: Date.now(),
          };

          setLastExitData(exitData);

          // Trigger callback
          if (onExit) {
            onExit(direction, lastEmotionsRef.current);
          }
        }

        // Reset for next person
        historyRef.current = [];
        wasTrackingRef.current = false;
        setIsTracking(false);
        setPositionHistory([]);
      }
    }
  }, [settings.historyLength, settings.exitThreshold, determineExitDirection, onExit]);

  return {
    trackPosition,
    exitDirection,
    isTracking,
    positionHistory,
    resetTracking,
    lastExitData,
    setLastEmotions,
  };
};

export default useDirectionTracking;

