// Audio Service for Jangal Little Boy
// Provides low-latency Web Audio sound effects and child-friendly Web Speech narration
// with graceful error handling and subtitle fallback.

class AudioService {
  constructor() {
    this.audioCtx = null;
    this.voices = [];
    this.selectedVoice = null;
    this.speechAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;
    this.soundEnabled = true;
    this.speechEnabled = true;
    this.speechRate = 0.85; // Slightly slower, encouraging preschool pace

    if (this.speechAvailable) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  // Initializes and filters for the warmest available English voice
  initVoices() {
    if (!this.speechAvailable) return;
    try {
      this.voices = window.speechSynthesis.getVoices();
      if (this.voices.length > 0) {
        // Look for natural English voices (Google, Samantha, Natural, etc.)
        const preferred = this.voices.find(v =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Karen'))
        ) || this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];

        this.selectedVoice = preferred || null;
      }
    } catch (e) {
      console.warn('Voice enumeration error:', e);
    }
  }

  // Ensures AudioContext is created and unlocked after user gesture
  getAudioContext() {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Unlocks audio contexts on first user tap/interaction
  unlockAudio() {
    this.getAudioContext();
    if (this.speechAvailable && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  // 1. Web Audio API Sound Effects

  // Play a soft wooden tap / pop sound
  playTap() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn('Error playing tap sound:', e);
    }
  }

  // Play a bright, cheerful bell chime (for correct selections)
  playChime() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High pleasant bell (E6 & B6 harmony)
      const freqs = [659.25, 987.77];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);

        gain.gain.setValueAtTime(0.25, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + 0.4);
      });
    } catch (e) {
      console.warn('Error playing chime sound:', e);
    }
  }

  // Play a gentle wooden wiggle sound (for try-again, non-punitive)
  playWiggle() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      console.warn('Error playing wiggle sound:', e);
    }
  }

  // Play a joyful ascending fanfare (C5 -> E5 -> G5 -> C6) for round completion
  playFanfare() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const start = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = start + idx * 0.14;
        const duration = idx === notes.length - 1 ? 0.6 : 0.2;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.25, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + duration);
      });
    } catch (e) {
      console.warn('Error playing fanfare:', e);
    }
  }

  // 2. Web Speech API Narration

  // Speaks text with callbacks and fallback handling
  speak(text, onEnd = null, onError = null) {
    if (!this.speechEnabled || !this.speechAvailable) {
      if (onEnd) onEnd();
      return;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Small 50ms buffer to ensure speech synthesizer resets on Chromium
      setTimeout(() => {
        try {
          // Remove forward slashes so phonics like /b/ aren't read as "slash b slash"
          const cleanText = text ? text.replace(/\//g, '') : text;
          const utterance = new SpeechSynthesisUtterance(cleanText);
          if (this.selectedVoice) {
            utterance.voice = this.selectedVoice;
          }
          utterance.pitch = 1.05; // Slightly higher, friendly pitch
          utterance.rate = this.speechRate;

          utterance.onend = () => {
            if (onEnd) onEnd();
          };

          utterance.onerror = (err) => {
            console.warn('SpeechSynthesis error:', err);
            if (onError) onError(err);
            else if (onEnd) onEnd();
          };

          window.speechSynthesis.speak(utterance);
        } catch (innerErr) {
          console.warn('Inner speech error:', innerErr);
          if (onEnd) onEnd();
        }
      }, 50);
    } catch (err) {
      console.warn('Speech synthesis call failed:', err);
      if (onError) onError(err);
      else if (onEnd) onEnd();
    }
  }

  // Cancels any currently speaking utterance
  cancelSpeech() {
    if (this.speechAvailable) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Error cancelling speech:', e);
      }
    }
  }

  // Updates global sound preferences
  setPreferences({ soundEnabled, speechEnabled, speechRate }) {
    if (soundEnabled !== undefined) this.soundEnabled = soundEnabled;
    if (speechEnabled !== undefined) this.speechEnabled = speechEnabled;
    if (speechRate !== undefined) this.speechRate = speechRate;
    if (!this.speechEnabled) this.cancelSpeech();
  }
}

// Export singleton audio service
export const audioService = new AudioService();

