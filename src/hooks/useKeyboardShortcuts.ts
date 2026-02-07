import { useEffect, useRef } from 'react';

interface KeyboardShortcuts {
  onStartPause: () => void;
  onStop: () => void;
  onSettings: () => void;
  onReflections: () => void;
  onSoundToggle: () => void;
}

export function useKeyboardShortcuts(callbacks: KeyboardShortcuts) {
  // Use ref to keep callbacks stable without re-attaching listener
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // macOS uses metaKey (⌘), Windows/Linux uses ctrlKey
      const cmdOrCtrl = event.metaKey || event.ctrlKey;

      console.log(`[Monk] Key pressed: '${event.key}'`, { cmdOrCtrl });

      switch (event.key.toLowerCase()) {
        case ' ':
          // Space: Start/Pause
          event.preventDefault();
          callbacksRef.current.onStartPause();
          break;

        case 'escape':
          // Escape: Stop session
          event.preventDefault();
          callbacksRef.current.onStop();
          break;

        case 's':
          // S: Settings
          if (!cmdOrCtrl) {
            event.preventDefault();
            console.log('[Monk] Triggering Settings');
            callbacksRef.current.onSettings();
          }
          break;

        case 'r':
          // R: Reflections
          if (!cmdOrCtrl) {
            event.preventDefault();
            console.log('[Monk] Triggering Reflections');
            callbacksRef.current.onReflections();
          }
          break;

        case 'm':
          // M: Mute
          if (!cmdOrCtrl) {
            event.preventDefault();
            console.log('[Monk] Triggering Sound Toggle');
            callbacksRef.current.onSoundToggle();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Run once on mount
}
