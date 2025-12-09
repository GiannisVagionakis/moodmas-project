import React, { useEffect, useRef, useState } from 'react';

// Enhanced Christmas melody - "We Wish You a Merry Christmas"
const createChristmasMelody = () => {
  if (typeof window === 'undefined') return null;

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // "We Wish You a Merry Christmas" melody
    const melody = [
      // "We wish you a Merry Christmas"
      { note: 'C4', duration: 0.5 },
      { note: 'F4', duration: 0.5 },
      { note: 'F4', duration: 0.25 },
      { note: 'G4', duration: 0.25 },
      { note: 'F4', duration: 0.25 },
      { note: 'E4', duration: 0.25 },
      { note: 'D4', duration: 0.5 },
      { note: 'D4', duration: 0.5 },

      // "We wish you a Merry Christmas"
      { note: 'D4', duration: 0.5 },
      { note: 'G4', duration: 0.5 },
      { note: 'G4', duration: 0.25 },
      { note: 'A4', duration: 0.25 },
      { note: 'G4', duration: 0.25 },
      { note: 'F4', duration: 0.25 },
      { note: 'E4', duration: 0.5 },
      { note: 'C4', duration: 0.5 },

      // "We wish you a Merry Christmas"
      { note: 'E4', duration: 0.5 },
      { note: 'A4', duration: 0.5 },
      { note: 'A4', duration: 0.25 },
      { note: 'Bb4', duration: 0.25 },
      { note: 'A4', duration: 0.25 },
      { note: 'G4', duration: 0.25 },
      { note: 'F4', duration: 0.5 },
      { note: 'D4', duration: 0.5 },

      // "And a Happy New Year!"
      { note: 'C4', duration: 0.25 },
      { note: 'C4', duration: 0.25 },
      { note: 'D4', duration: 0.5 },
      { note: 'G4', duration: 0.5 },
      { note: 'E4', duration: 0.5 },
      { note: 'F4', duration: 1 },

      { note: 'rest', duration: 0.5 },

      // Repeat chorus for fullness
      { note: 'C4', duration: 0.5 },
      { note: 'F4', duration: 0.5 },
      { note: 'F4', duration: 0.25 },
      { note: 'G4', duration: 0.25 },
      { note: 'F4', duration: 0.25 },
      { note: 'E4', duration: 0.25 },
      { note: 'D4', duration: 0.5 },
      { note: 'D4', duration: 0.5 },

      { note: 'D4', duration: 0.5 },
      { note: 'G4', duration: 0.5 },
      { note: 'G4', duration: 0.25 },
      { note: 'A4', duration: 0.25 },
      { note: 'G4', duration: 0.25 },
      { note: 'F4', duration: 0.25 },
      { note: 'E4', duration: 0.5 },
      { note: 'E4', duration: 0.5 },

      { note: 'E4', duration: 0.25 },
      { note: 'A4', duration: 0.25 },
      { note: 'D4', duration: 0.5 },
      { note: 'G4', duration: 0.5 },
      { note: 'E4', duration: 0.5 },
      { note: 'F4', duration: 1.5 },

      { note: 'rest', duration: 1 },
    ];

    // Expanded note frequencies for richer melody
    const noteFrequencies: Record<string, number> = {
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
      'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33,
    };

    return { audioContext, melody, noteFrequencies };
  } catch (e) {
    console.log('Audio not supported');
    return null;
  }
};

export const BackgroundMusic: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const playMelody = () => {
    const setup = createChristmasMelody();
    if (!setup) return;

    const { audioContext, melody, noteFrequencies } = setup;
    audioContextRef.current = audioContext;

    let currentTime = audioContext.currentTime;
    const tempo = 0.5; // Slightly slower for more elegant feel

    const playNote = (note: string, duration: number, startTime: number) => {
      if (note === 'rest') return;

      // Create main oscillator with triangle wave for warmer sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Add subtle harmonics for richer sound
      const harmonic = audioContext.createOscillator();
      const harmonicGain = audioContext.createGain();

      oscillator.connect(gainNode);
      harmonic.connect(harmonicGain);
      gainNode.connect(audioContext.destination);
      harmonicGain.connect(audioContext.destination);

      // Main note - triangle wave for warmth
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(noteFrequencies[note] || 440, startTime);

      // Harmonic - one octave higher for richness
      harmonic.type = 'sine';
      harmonic.frequency.setValueAtTime((noteFrequencies[note] || 440) * 2, startTime);

      // Volume envelope - gentle attack and decay
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.05); // Attack
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration * tempo); // Decay

      harmonicGain.gain.setValueAtTime(0, startTime);
      harmonicGain.gain.linearRampToValueAtTime(0.04, startTime + 0.05);
      harmonicGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration * tempo);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration * tempo);
      harmonic.start(startTime);
      harmonic.stop(startTime + duration * tempo);
    };

    const playSequence = () => {
      currentTime = audioContext.currentTime;
      melody.forEach((item) => {
        playNote(item.note, item.duration, currentTime);
        currentTime += item.duration * tempo;
      });
    };

    // Play immediately
    playSequence();

    // Loop the melody
    const totalDuration = melody.reduce((sum, item) => sum + item.duration * tempo, 0);
    intervalRef.current = setInterval(playSequence, totalDuration * 1000);

    setIsPlaying(true);
  };

  const stopMusic = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsPlaying(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMusic();
    };
  }, []);

  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      playMelody();
    }
  };

  return (
    <button
      onClick={toggleMusic}
      className={`fixed bottom-4 right-4 z-40 glass-card px-4 py-3 rounded-full hover:scale-105 transition-all flex items-center gap-2 ${isPlaying ? 'bg-green-500/20 border-green-500/30' : 'bg-white/10'
        }`}
      title={isPlaying ? 'Stop Music' : 'Play Music'}
    >
      <span className="text-xl">{isPlaying ? '🔊' : '🔇'}</span>
      <span className="text-sm font-medium">{isPlaying ? 'Music On' : 'Music Off'}</span>
    </button>
  );
};

export default BackgroundMusic;

