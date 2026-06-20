import { useEffect, useRef, useState } from 'react';

export function useAudio() {
  const audioCtxRef = useRef(null);
  const ambientNodeRef = useRef(null);
  const [ambientPlaying, setAmbientPlaying] = useState(false);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playHover = () => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn("Failed to play hover sound:", e);
    }
  };

  const playClick = () => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.setValueAtTime(400, ctx.currentTime + 0.03);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      console.warn("Failed to play click sound:", e);
    }
  };

  // Sound playing at intervals during shuffling
  const playShuffleTick = (pitchFactor = 1) => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80 * pitchFactor, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400 * pitchFactor, ctx.currentTime + 0.1);
      
      filter.type = 'lowpass';
      filter.Q.value = 5;
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.warn("Failed to play shuffle tick:", e);
    }
  };

  const playLockSound = () => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      
      // Heavy metal clank: combination of low-frequency sine and high-frequency noise
      const playThud = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.2);
        
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      };

      const playMetallicRing = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      };

      playThud();
      playMetallicRing();
    } catch (e) {
      console.warn("Failed to play lock sound:", e);
    }
  };

  const playFanfare = () => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      
      // Futuristic synth fanfare chord
      const notes = [261.63, 329.63, 392.00, 523.25]; // C major chord notes C4, E4, G4, C5
      
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + index * 0.1 + 0.5);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + index * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.1 + 0.8);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + index * 0.1);
        osc.stop(ctx.currentTime + index * 0.1 + 0.8);
      });
    } catch (e) {
      console.warn("Failed to play fanfare sound:", e);
    }
  };

  const toggleAmbientHum = () => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;

      if (ambientPlaying) {
        if (ambientNodeRef.current) {
          ambientNodeRef.current.gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          setTimeout(() => {
            if (ambientNodeRef.current) {
              ambientNodeRef.current.osc1.stop();
              ambientNodeRef.current.osc2.stop();
              ambientNodeRef.current = null;
            }
          }, 600);
        }
        setAmbientPlaying(false);
      } else {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gainNode = ctx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.value = 55; // Low A
        
        osc2.type = 'triangle';
        osc2.frequency.value = 55.5; // Slightly detuned
        
        filter.type = 'lowpass';
        filter.frequency.value = 100;
        
        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 1.0);
        
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc1.start();
        osc2.start();
        
        ambientNodeRef.current = { osc1, osc2, gainNode };
        setAmbientPlaying(true);
      }
    } catch (e) {
      console.warn("Failed to toggle ambient hum:", e);
    }
  };

  useEffect(() => {
    return () => {
      // Clean up ambient hum on unmount
      if (ambientNodeRef.current) {
        try {
          ambientNodeRef.current.osc1.stop();
          ambientNodeRef.current.osc2.stop();
        } catch(e) {}
      }
    };
  }, []);

  return {
    initAudio,
    playHover,
    playClick,
    playShuffleTick,
    playLockSound,
    playFanfare,
    toggleAmbientHum,
    ambientPlaying
  };
}
