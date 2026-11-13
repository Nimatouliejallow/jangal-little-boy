// Storage Service for Jangal Little Boy
// Provides resilient localStorage persistence with automatic in-memory fallback
// (e.g., when running in private/incognito browsing or restricted sandboxes).

const STORAGE_KEY = 'jangal_little_boy_v1';

// Default initial state for a preschool learner
export const DEFAULT_APP_STATE = {
  profile: {
    nickname: 'Little Explorer',
    avatarId: 'boy_blue',
    hasCompletedWelcome: false,
  },
  progress: {
    totalStars: 0,
    completedActivityIds: [], // e.g., ['phonics_round_1', 'counting_round_1']
    lastPlayedDate: new Date().toISOString(),
  },
  settings: {
    soundEnabled: true,
    speechEnabled: true,
    speechRate: 0.85, // Friendly, slower pace for preschoolers
  },
};

// In-memory fallback storage
let memoryStore = null;

/**
 * Checks if localStorage is available and writable
 */
function isLocalStorageAvailable() {
  try {
    const testKey = '__jangal_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads the application state from local storage or memory fallback
 */
export function loadAppState() {
  if (isLocalStorageAvailable()) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_APP_STATE;
      const parsed = JSON.parse(raw);
      // Merge with default state to ensure schema safety
      return {
        profile: { ...DEFAULT_APP_STATE.profile, ...parsed.profile },
        progress: { ...DEFAULT_APP_STATE.progress, ...parsed.progress },
        settings: { ...DEFAULT_APP_STATE.settings, ...parsed.settings },
      };
    } catch (err) {
      console.warn('Failed to parse localStorage state, falling back to defaults:', err);
      return DEFAULT_APP_STATE;
    }
  }

  // Fallback to in-memory store
  if (!memoryStore) {
    memoryStore = { ...DEFAULT_APP_STATE };
  }
  return memoryStore;
}

/**
 * Saves application state to localStorage or in-memory fallback
 */
export function saveAppState(state) {
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }
  }

  memoryStore = { ...state };
  return false;
}

/**
 * Resets learning progress (stars and completed activities)
 * while preserving avatar and audio preferences
 */
export function resetProgress(currentState) {
  const resetState = {
    ...currentState,
    progress: {
      totalStars: 0,
      completedActivityIds: [],
      lastPlayedDate: new Date().toISOString(),
    },
  };
  saveAppState(resetState);
  return resetState;
}

