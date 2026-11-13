import { useState } from 'react';
import { useApp } from '../../context/useApp';
import { getAvatarById } from '../../data/avatars';
import CaregiverBarrier from '../common/CaregiverBarrier';
import EditProfileModal from '../common/EditProfileModal';

export default function Header({ currentView, onNavigate }) {
  const { profile, progress, settings, updateSettings, playTap } = useApp();
  const [isBarrierOpen, setIsBarrierOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const avatar = getAvatarById(profile.avatarId);

  const toggleSound = () => {
    playTap();
    const newSoundState = !settings.soundEnabled;
    updateSettings({
      soundEnabled: newSoundState,
      speechEnabled: newSoundState,
    });
  };

  const handleOpenCaregiver = () => {
    playTap();
    setIsBarrierOpen(true);
  };

  const handleBarrierSuccess = () => {
    setIsBarrierOpen(false);
    onNavigate('caregiver');
  };

  return (
    <>
      <header className="w-full max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-2 select-none">
        {/* Left: Avatar & Nickname / Home */}
        <div className="flex items-center gap-2">
          {currentView !== 'hub' && currentView !== 'welcome' ? (
            <button
              type="button"
              onClick={() => {
                playTap();
                onNavigate('hub');
              }}
              aria-label="Go to Home Hub"
              className="flex items-center gap-2 px-3 py-2 bg-amber-200 hover:bg-amber-300 border-2 border-amber-400 rounded-2xl text-amber-950 font-bold active:scale-95 transition-transform cursor-pointer shadow-xs"
            >
              <span className="text-xl">🏠</span>
              <span className="hidden sm:inline font-bold">Home</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                playTap();
                setIsEditProfileOpen(true);
              }}
              title="Edit Profile"
              aria-label="Edit Profile"
              className="flex items-center gap-2 bg-white/90 hover:bg-amber-100/90 border-2 border-amber-300 rounded-2xl px-3 py-1.5 shadow-xs active:scale-95 transition-all cursor-pointer group"
            >
              <span className="text-2xl transition-transform group-hover:scale-110" role="img" aria-label={avatar.label}>
                {avatar.emoji}
              </span>
              <span className="font-bold text-slate-800 text-sm sm:text-base">
                {profile.nickname || 'Little Explorer'}
              </span>
              <span className="text-xs text-amber-800 bg-amber-200/80 px-1.5 py-0.5 rounded-md font-bold">
                ✏️
              </span>
            </button>
          )}
        </div>

        {/* Center: Star Counter */}
        <div className="flex items-center gap-1.5 bg-amber-400 text-amber-950 px-4 py-1.5 rounded-full border-2 border-amber-500 shadow-xs font-black text-lg md:text-xl animate-pop">
          <span>⭐</span>
          <span>{progress.totalStars}</span>
        </div>

        {/* Right: Audio Toggle & Caregiver Lock */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            aria-label={settings.soundEnabled ? 'Mute sound' : 'Unmute sound'}
            className="w-11 h-11 rounded-2xl bg-white/90 hover:bg-amber-100 border-2 border-amber-300 text-slate-700 flex items-center justify-center text-xl active:scale-90 transition-transform cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {settings.soundEnabled ? '🔊' : '🔇'}
          </button>

          <button
            type="button"
            onClick={handleOpenCaregiver}
            aria-label="Caregiver settings (barrier protected)"
            className="w-11 h-11 rounded-2xl bg-white/90 hover:bg-amber-100 border-2 border-slate-300 text-slate-700 flex items-center justify-center text-xl active:scale-90 transition-transform cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
        />
      )}

      {/* Caregiver Accidental Barrier */}
      <CaregiverBarrier
        isOpen={isBarrierOpen}
        onClose={() => setIsBarrierOpen(false)}
        onSuccess={handleBarrierSuccess}
      />
    </>
  );
}
