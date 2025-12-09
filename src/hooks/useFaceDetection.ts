import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import type { EmotionScores, EmotionType, FacePosition, DetectionResult } from '../types';

export interface UseFaceDetectionReturn {
  isModelLoaded: boolean;
  isDetecting: boolean;
  loadingProgress: number;
  error: string | null;
  currentDetection: DetectionResult | null;
  startDetection: (videoElement: HTMLVideoElement) => void;
  stopDetection: () => void;
}

const MODEL_URL = '/models';
// Throttle detection to every 200ms for better performance
const DETECTION_INTERVAL_MS = 200;
// Number of frames to average for smoothing
const SMOOTHING_FRAMES = 5;

// Helper to calculate eye aspect ratio (lower = more tired)
const calculateEyeAspectRatio = (landmarks: faceapi.FaceLandmarks68): number => {
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();

  // Calculate vertical distance for left eye
  const leftVertical1 = Math.hypot(
    leftEye[1].x - leftEye[5].x,
    leftEye[1].y - leftEye[5].y
  );
  const leftVertical2 = Math.hypot(
    leftEye[2].x - leftEye[4].x,
    leftEye[2].y - leftEye[4].y
  );
  const leftHorizontal = Math.hypot(
    leftEye[0].x - leftEye[3].x,
    leftEye[0].y - leftEye[3].y
  );
  const leftEAR = (leftVertical1 + leftVertical2) / (2.0 * leftHorizontal);

  // Calculate vertical distance for right eye
  const rightVertical1 = Math.hypot(
    rightEye[1].x - rightEye[5].x,
    rightEye[1].y - rightEye[5].y
  );
  const rightVertical2 = Math.hypot(
    rightEye[2].x - rightEye[4].x,
    rightEye[2].y - rightEye[4].y
  );
  const rightHorizontal = Math.hypot(
    rightEye[0].x - rightEye[3].x,
    rightEye[0].y - rightEye[3].y
  );
  const rightEAR = (rightVertical1 + rightVertical2) / (2.0 * rightHorizontal);

  return (leftEAR + rightEAR) / 2.0;
};

// Helper to calculate mouth droop (negative = frown/tired)
const calculateMouthCurvature = (landmarks: faceapi.FaceLandmarks68): number => {
  const mouth = landmarks.getMouth();
  const leftCorner = mouth[0];
  const rightCorner = mouth[6];
  const topCenter = mouth[3];
  const bottomCenter = mouth[9];

  // Calculate if mouth corners are below the center line (frown)
  const centerY = (topCenter.y + bottomCenter.y) / 2;
  const cornerAvgY = (leftCorner.y + rightCorner.y) / 2;

  return centerY - cornerAvgY; // Positive = smile, negative = frown
};

export const useFaceDetection = (): UseFaceDetectionReturn => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentDetection, setCurrentDetection] = useState<DetectionResult | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isProcessingRef = useRef(false);
  // Store recent emotion scores for smoothing
  const emotionHistoryRef = useRef<EmotionScores[]>([]);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoadingProgress(10);

        // Load models from public folder
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setLoadingProgress(40);

        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        setLoadingProgress(70);

        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
        setLoadingProgress(100);

        setIsModelLoaded(true);
        console.log('Face detection models loaded successfully');
      } catch (err) {
        console.error('Error loading face detection models:', err);
        setError('Failed to load face detection models. Please refresh the page.');
      }
    };

    loadModels();
  }, []);

  // Detection function - runs at throttled interval
  const detectFaces = useCallback(async () => {
    // Prevent overlapping detections
    if (isProcessingRef.current || !videoRef.current || !isModelLoaded) return;

    const video = videoRef.current;

    if (video.paused || video.ended || video.readyState < 2) {
      return;
    }

    isProcessingRef.current = true;

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({
          inputSize: 224, // Smaller input for faster processing
          scoreThreshold: 0.6, // Increased from 0.5 for more confident detections
        }))
        .withFaceLandmarks(true)
        .withFaceExpressions();

      if (detection) {
        const { expressions, detection: faceDetection, landmarks } = detection;
        const box = faceDetection.box;

        // Calculate facial features for tiredness detection
        const eyeAspectRatio = calculateEyeAspectRatio(landmarks);
        const mouthCurvature = calculateMouthCurvature(landmarks);

        // Eye aspect ratio typically ranges from 0.2 (closed/tired) to 0.35 (wide open)
        // Normalize to 0-1 scale where lower = more tired - made extremely sensitive
        const tirednessFromEyes = Math.max(0, Math.min(1, (0.42 - eyeAspectRatio) / 0.22));

        // Mouth curvature: negative values indicate frown (tired), positive indicate smile
        // Made EXTREMELY sensitive to detect frowns/sadness - reduced divisor from 5 to 2
        const tirednessFromMouth = mouthCurvature < 0 ? Math.min(1, Math.abs(mouthCurvature) / 2) : 0;

        // Combine facial feature tiredness indicators with even higher weight on mouth
        const facialTiredness = (tirednessFromEyes * 0.5 + tirednessFromMouth * 0.5);

        // Convert expressions to our EmotionScores format with enhanced tiredness detection
        let emotionScores: EmotionScores = {
          happy: expressions.happy || 0,
          neutral: expressions.neutral || 0,
          sad: expressions.sad || 0,
          surprised: expressions.surprised || 0,
          angry: expressions.angry || 0,
          fearful: expressions.fearful || 0,
          disgusted: expressions.disgusted || 0,
        };

        // FIRST: Directly amplify sad expression from face-api
        // If the model detects ANY sadness, boost it significantly
        if (emotionScores.sad > 0.1) {
          emotionScores.sad = Math.min(1, emotionScores.sad * 3); // Triple the sad score
        }

        // SECOND: If facial features indicate tiredness, boost sad/fearful emotions aggressively
        // Extremely low threshold (0.05) and very high boost for maximum sad detection
        if (facialTiredness > 0.05) {
          const tiredBoost = facialTiredness * 1.2; // Increased from 0.8 to 1.2
          // Boost sad emotion most strongly
          emotionScores.sad = Math.min(1, emotionScores.sad + tiredBoost);
          emotionScores.fearful = Math.min(1, emotionScores.fearful + tiredBoost * 0.7);
          emotionScores.angry = Math.min(1, emotionScores.angry + tiredBoost * 0.5);
          // Reduce happy and neutral if person looks tired
          emotionScores.happy = Math.max(0, emotionScores.happy - tiredBoost * 0.9);
          emotionScores.neutral = Math.max(0, emotionScores.neutral - tiredBoost * 0.4);
        }



        // Add to emotion history for smoothing
        emotionHistoryRef.current.push(emotionScores);
        if (emotionHistoryRef.current.length > SMOOTHING_FRAMES) {
          emotionHistoryRef.current.shift();
        }

        // Average emotions over recent frames for stability
        const smoothedEmotions: EmotionScores = {
          happy: 0,
          neutral: 0,
          sad: 0,
          surprised: 0,
          angry: 0,
          fearful: 0,
          disgusted: 0,
        };

        emotionHistoryRef.current.forEach(emotions => {
          (Object.keys(emotions) as EmotionType[]).forEach(emotion => {
            smoothedEmotions[emotion] += emotions[emotion];
          });
        });

        const historyLength = emotionHistoryRef.current.length;
        (Object.keys(smoothedEmotions) as EmotionType[]).forEach(emotion => {
          smoothedEmotions[emotion] /= historyLength;
        });

        // Find dominant emotion from smoothed scores
        let maxScore = 0;
        let dominantEmotion: EmotionType = 'neutral';
        (Object.keys(smoothedEmotions) as EmotionType[]).forEach((emotion) => {
          if (smoothedEmotions[emotion] > maxScore) {
            maxScore = smoothedEmotions[emotion];
            dominantEmotion = emotion;
          }
        });


        const position: FacePosition = {
          x: box.x + box.width / 2,
          y: box.y + box.height / 2,
          timestamp: Date.now(),
        };


        setCurrentDetection({
          faceDetected: true,
          position,
          emotions: smoothedEmotions,
          dominantEmotion,
        });
      } else {
        setCurrentDetection({
          faceDetected: false,
          position: null,
          emotions: null,
          dominantEmotion: null,
        });
      }
    } catch (err) {
      console.error('Detection error:', err);
    } finally {
      isProcessingRef.current = false;
    }
  }, [isModelLoaded]);

  const startDetection = useCallback((videoElement: HTMLVideoElement) => {
    if (!isModelLoaded) {
      console.warn('Models not loaded yet');
      return;
    }

    videoRef.current = videoElement;
    setIsDetecting(true);

    // Start the detection interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(detectFaces, DETECTION_INTERVAL_MS);
  }, [isModelLoaded, detectFaces]);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    videoRef.current = null;
    isProcessingRef.current = false;
    emotionHistoryRef.current = []; // Clear emotion history
    setCurrentDetection(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isModelLoaded,
    isDetecting,
    loadingProgress,
    error,
    currentDetection,
    startDetection,
    stopDetection,
  };
};

export default useFaceDetection;

