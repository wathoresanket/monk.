// Monk. Audio System for ambient sounds

import { SoundType, SOUND_URLS } from '@/types/monk';

class AudioManager {
  private audio: HTMLAudioElement | null = null;
  private currentSound: SoundType = 'silence';
  private fadeInterval: number | null = null;
  private targetVolume: number = 0.5;
  private isPlaying: boolean = false;
  private context: AudioContext | null = null;

  constructor() {
    // Initialize on first user interaction
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.loop = true;
      this.audio.preload = 'auto';

      this.audio.addEventListener('error', (e) => {
        console.error('[Audio] Error event:', e);
        const error = this.audio?.error;
        console.error('[Audio] Error details:', error?.code, error?.message);
      });

      this.audio.addEventListener('canplay', () => {
        console.log('[Audio] Can play');
      });
    }
  }

  async setSound(type: SoundType, customUrl?: string): Promise<void> {
    if (type === this.currentSound && this.audio?.src && type !== 'custom') return;
    if (type === 'custom' && this.currentSound === 'custom' && this.audio?.src === customUrl) return;

    this.currentSound = type;

    if (type === 'silence' || !this.audio) {
      console.log('[Audio] Stopping because silence or no audio');
      await this.stop();
      return;
    }

    let url = SOUND_URLS[type];
    if (type === 'custom' && customUrl) {
      url = customUrl;
    }

    console.log('[Audio] Setting sound URL:', url);
    if (!url) return;

    // Stop current audio first
    this.audio.pause();
    this.audio.src = url;

    // Preload
    try {
      await this.audio.load();
      console.log('[Audio] Load successful');
    } catch (e) {
      console.warn('[Audio] Load failed:', e);
    }

    // Resume if was playing
    if (this.isPlaying) {
      await this.play();
    }
  }

  async play(): Promise<void> {
    console.log('[Audio] Play requested. Current sound:', this.currentSound);
    if (!this.audio || this.currentSound === 'silence') return;
    if (!this.audio.src) {
      await this.setSound(this.currentSound);
    }

    this.isPlaying = true;
    this.audio.volume = this.targetVolume; // Set volume directly, skip fade for now

    try {
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('[Audio] Playback started successfully');
        }).catch((e) => {
          console.error('[Audio] Playback failed:', e);
          this.isPlaying = false;
        });
      }
    } catch (e) {
      console.error('[Audio] Play execution failed:', e);
      this.isPlaying = false;
    }
  }

  async stop(): Promise<void> {
    if (!this.audio) return;

    this.isPlaying = false;
    await this.fadeOut();
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  private fadeIn(duration: number = 800): void {
    if (!this.audio) return;
    this.clearFade();

    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = this.targetVolume / steps;
    let currentStep = 0;

    this.fadeInterval = window.setInterval(() => {
      if (!this.audio || currentStep >= steps) {
        this.clearFade();
        return;
      }

      currentStep++;
      this.audio.volume = Math.min(volumeStep * currentStep, this.targetVolume);
    }, stepDuration);
  }

  private fadeOut(duration: number = 500): Promise<void> {
    return new Promise((resolve) => {
      if (!this.audio || this.audio.volume === 0) {
        resolve();
        return;
      }

      this.clearFade();

      const steps = 15;
      const stepDuration = duration / steps;
      const volumeStep = this.audio.volume / steps;
      let currentStep = 0;
      const startVolume = this.audio.volume;

      this.fadeInterval = window.setInterval(() => {
        if (!this.audio || currentStep >= steps) {
          this.clearFade();
          if (this.audio) this.audio.volume = 0;
          resolve();
          return;
        }

        currentStep++;
        this.audio.volume = Math.max(startVolume - volumeStep * currentStep, 0);
      }, stepDuration);
    });
  }

  private clearFade(): void {
    if (this.fadeInterval !== null) {
      window.clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
  }

  setVolume(volume: number): void {
    this.targetVolume = Math.max(0, Math.min(1, volume));
    if (this.audio && this.isPlaying) {
      this.audio.volume = this.targetVolume;
    }
  }

  getVolume(): number {
    return this.targetVolume;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  async playBell(volume: number = 0.5): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      console.log('[Audio] playBell called with volume:', volume);

      if (!this.context) {
        console.log('[Audio] Initializing AudioContext');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) {
          console.error('[Audio] AudioContext not supported');
          return;
        }
        this.context = new AudioContext();
      }

      console.log('[Audio] Context state:', this.context.state);

      if (this.context.state === 'suspended') {
        console.log('[Audio] Resuming suspended context');
        await this.context.resume();
        console.log('[Audio] Context state after resume:', this.context.state);
      }

      const ctx = this.context;
      const now = ctx.currentTime;
      console.log('[Audio] Current time:', now);

      // Master gain for volume control
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.setValueAtTime(volume, now);
      console.log('[Audio] Master gain set');

      // Bell parameters - Tibetan Bowl style
      const fundamental = 180; // Lower fundamental for a bowl
      // Inharmonic partials characteristic of metal bowls
      const ratios = [1, 2.7, 5.18, 8.13, 11.8];
      const gains = [1, 0.4, 0.2, 0.1, 0.05];
      const duration = 12; // Much longer sustain

      ratios.forEach((ratio, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(fundamental * ratio, now);

        // Subtle detuning for "beating" effect
        if (i > 0) {
          osc.detune.setValueAtTime(Math.random() * 5 - 2.5, now);
        }

        // Envelope: soft attack, very long exponential decay
        const partialGain = gains[i];
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(partialGain, now + 0.1 + (i * 0.05)); // Staggered attack
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration - (i * 1.5)); // Higher partials decay faster

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + duration);
      });
      console.log('[Audio] Oscillators started');

      // No cleanup of context needed since we reuse it.
      // We could garbage collect nodes but they handle themselves upon stopping usually.

    } catch (e) {
      console.error('[Audio] Failed to play bell with error:', e);
    }
  }

  getCurrentSound(): SoundType {
    return this.currentSound;
  }
}

// Singleton instance
export const audioManager = new AudioManager();
