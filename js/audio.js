/**
 * Web Audio API Sound Synthesizer for Kingshot Rally Timer
 * Zero external audio files required, runs 100% offline.
 */
class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
    this.lastBeepSecond = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleSound(enable) {
    if (enable !== undefined) {
      this.soundEnabled = enable;
    } else {
      this.soundEnabled = !this.soundEnabled;
    }
    return this.soundEnabled;
  }

  playTone(freq, type, duration, startTime = 0, gainLevel = 0.15) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type; // 'sine', 'square', 'triangle'
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + startTime);

      gain.gain.setValueAtTime(gainLevel, this.audioCtx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime + startTime);
      osc.stop(this.audioCtx.currentTime + startTime + duration);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // Pre-alert at 30 seconds before launch
  play30sNotice() {
    this.playTone(440, 'sine', 0.25, 0, 0.12);
    this.playTone(660, 'sine', 0.35, 0.2, 0.12);
  }

  // Warning at 10 seconds before launch
  play10sWarning() {
    this.playTone(550, 'triangle', 0.15, 0, 0.15);
    this.playTone(550, 'triangle', 0.15, 0.2, 0.15);
  }

  // Countdown tick for 5, 4, 3, 2, 1
  playTick() {
    this.playTone(600, 'sine', 0.09, 0, 0.2);
  }

  // Launch horn / Go signal at 0s!
  playLaunchChime() {
    this.playTone(523.25, 'triangle', 0.15, 0.0, 0.25); // C5
    this.playTone(659.25, 'triangle', 0.15, 0.12, 0.25); // E5
    this.playTone(783.99, 'triangle', 0.15, 0.24, 0.25); // G5
    this.playTone(1046.50, 'triangle', 0.5, 0.36, 0.3); // C6
  }

  // Test sound
  playTest() {
    this.init();
    this.playLaunchChime();
  }
}

// Global instance
window.soundManager = new SoundManager();
