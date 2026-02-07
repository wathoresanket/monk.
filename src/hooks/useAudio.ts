import { useState, useEffect, useCallback } from 'react';
import { SoundType, SoundSettings } from '@/types/monk';
import { audioManager } from '@/lib/audio';

export function useAudio(settings: SoundSettings) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Initialize audio manager with settings
  useEffect(() => {
    audioManager.setVolume(settings.volume);
    audioManager.setSound(settings.type);
  }, [settings.type, settings.volume]);

  // Handle user interaction requirement
  const handleUserInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  }, [hasInteracted]);

  const play = useCallback(async () => {
    console.log('[useAudio] Play called. Enabled:', settings.enabled);

    if (settings.type === 'silence' || !settings.enabled) {
      console.log('[useAudio] Not playing because disabled or silence');
      return;
    }

    await audioManager.play();
    setIsPlaying(true);
  }, [settings.type, settings.enabled]);

  const stop = useCallback(async () => {
    await audioManager.stop();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(async () => {
    if (isPlaying) {
      await stop();
    } else {
      await play();
    }
  }, [isPlaying, play, stop]);

  const setSound = useCallback(async (type: SoundType) => {
    await audioManager.setSound(type);
    if (isPlaying) {
      await audioManager.play();
    }
  }, [isPlaying]);

  const setVolume = useCallback((volume: number) => {
    audioManager.setVolume(volume);
  }, []);

  // Auto-start on session start if enabled
  const startOnSession = useCallback(async () => {
    if (settings.autoStart && settings.enabled && hasInteracted) {
      await play();
    }
  }, [settings.autoStart, settings.enabled, hasInteracted, play]);

  // Stop on session end
  const stopOnSession = useCallback(async () => {
    if (isPlaying) {
      await stop();
    }
  }, [isPlaying, stop]);

  return {
    isPlaying,
    hasInteracted,
    handleUserInteraction,
    play,
    stop,
    toggle,
    setSound,
    setVolume,
    startOnSession,
    stopOnSession,
  };
}
