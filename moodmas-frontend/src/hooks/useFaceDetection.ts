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

export const useFaceDetection = (): UseFaceDetectionReturn => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentDetection, setCurrentDetection] = useState<DetectionResult | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isProcessingRef = useRef(false);

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
          scoreThreshold: 0.5,
        }))
        .withFaceLandmarks(true)
        .withFaceExpressions();

      if (detection) {
        const { expressions, detection: faceDetection } = detection;
        const box = faceDetection.box;
        
        // Convert expressions to our EmotionScores format
        const emotionScores: EmotionScores = {
          happy: expressions.happy || 0,
          neutral: expressions.neutral || 0,
          sad: expressions.sad || 0,
          surprised: expressions.surprised || 0,
          angry: expressions.angry || 0,
          fearful: expressions.fearful || 0,
          disgusted: expressions.disgusted || 0,
        };

        // Find dominant emotion
        let maxScore = 0;
        let dominantEmotion: EmotionType = 'neutral';
        (Object.keys(emotionScores) as EmotionType[]).forEach((emotion) => {
          if (emotionScores[emotion] > maxScore) {
            maxScore = emotionScores[emotion];
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
          emotions: emotionScores,
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

