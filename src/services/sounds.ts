// Sound effects using Web Audio API only - no external dependencies needed

// Create Web Audio based sounds for better compatibility
export const createWebAudioSound = (
  frequencies: number[],
  durations: number[],
  type: OscillatorType = 'sine'
): (() => void) => {
  return () => {
    if (typeof window === 'undefined') return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      
      let startTime = audioContext.currentTime;
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, startTime);
        oscillator.connect(gainNode);
        oscillator.start(startTime);
        oscillator.stop(startTime + durations[index]);
        startTime += durations[index];
      });
      
      // Fade out
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime);
    } catch (e) {
      console.log('Audio not supported');
    }
  };
};

// Pre-defined sound effects using Web Audio API
export const sounds = {
  checkin: createWebAudioSound([800, 1000], [0.1, 0.15], 'sine'),
  achievement: createWebAudioSound([523, 659, 784], [0.1, 0.1, 0.2], 'sine'),
  celebration: createWebAudioSound([523, 587, 659, 784, 880], [0.1, 0.1, 0.1, 0.1, 0.3], 'sine'),
  leadChange: createWebAudioSound([440, 554, 659], [0.15, 0.15, 0.2], 'triangle'),
  error: createWebAudioSound([200, 150], [0.2, 0.3], 'square'),
};

export default sounds;
