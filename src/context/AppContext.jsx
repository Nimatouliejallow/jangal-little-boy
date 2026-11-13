import { useState, useEffect, useCallback } from 'react';
import { AppContext } from './context';
import { loadAppState, saveAppState, resetProgress as storageResetProgress } from '../services/storageService';
import { audioService } from '../services/audioService';

export function AppProvider({ children }) {
  const [appState, setAppState] = useState(() => loadAppState());
  const [subtitle, setSubtitle] = useState('');
  const [, setIsAudioUnlocked] = useState(false);

  // Sync state to storage whenever it changes
  useEffect(() => {
    saveAppState(appState);
    audioService.setPreferences({
      soundEnabled: appState.settings.soundEnabled,
      speechEnabled: appState.settings.speechEnabled,
      speechRate: appState.settings.speechRate,
    });
  }, [appState]);

  // Unlocks audio context on user interaction
  const unlockAudio = useCallback(() => {
    audioService.unlockAudio();
    setIsAudioUnlocked(true);
  }, []);

  // Update profile (nickname, avatar, completed onboarding)
  const updateProfile = useCallback((profileUpdates) => {
    setAppState((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...profileUpdates },
    }));
  }, []);

  // Award a star and mark activity as completed
  const awardStar = useCallback((activityId) => {
    audioService.playChime();
    setAppState((prev) => {
      const alreadyCompleted = prev.progress.completedActivityIds.includes(activityId);
      return {
        ...prev,
        progress: {
          ...prev.progress,
          totalStars: prev.progress.totalStars + 1,
          completedActivityIds: alreadyCompleted
            ? prev.progress.completedActivityIds
            : [...prev.progress.completedActivityIds, activityId],
          lastPlayedDate: new Date().toISOString(),
        },
      };
    });
  }, []);

  // Update audio/speech settings
  const updateSettings = useCallback((settingUpdates) => {
    setAppState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settingUpdates },
    }));
  }, []);

  // Reset learning progress (stars and activities)
  const handleResetProgress = useCallback(() => {
    const newState = storageResetProgress(appState);
    setAppState(newState);
  }, [appState]);

  // Speak helper: sets visible subtitle and speaks through audioService
  const speak = useCallback((text, onEnd = null, displayText = null) => {
    setSubtitle(displayText || text);
    audioService.speak(text, onEnd, () => {
      if (onEnd) onEnd();
    });
  }, []);

  const value = {
    state: appState,
    profile: appState.profile,
    progress: appState.progress,
    settings: appState.settings,
    subtitle,
    setSubtitle,
    unlockAudio,
    updateProfile,
    awardStar,
    updateSettings,
    resetProgress: handleResetProgress,
    speak,
    playTap: () => audioService.playTap(),
    playChime: () => audioService.playChime(),
    playWiggle: () => audioService.playWiggle(),
    playFanfare: () => audioService.playFanfare(),
    cancelSpeech: () => audioService.cancelSpeech(),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
