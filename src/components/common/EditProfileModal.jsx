import { useState } from 'react';
import { useApp } from '../../context/useApp';
import { AVATARS } from '../../data/avatars';
import BigButton from './BigButton';

export default function EditProfileModal({ isOpen, onClose }) {
  const { profile, updateProfile, playTap, playChime, speak } = useApp();
  const [selectedAvatarId, setSelectedAvatarId] = useState(() => profile.avatarId || 'boy_sun');
  const [nickname, setNickname] = useState(() => profile.nickname || 'Little Explorer');
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSelectAvatar = (id) => {
    playTap();
    setSelectedAvatarId(id);
  };

  const handleSave = () => {
    playTap();
    playChime();
    const finalNickname = nickname.trim() || 'Little Explorer';
    updateProfile({
      avatarId: selectedAvatarId,
      nickname: finalNickname,
    });

    speak(`Profile saved! Looking great, ${finalNickname}!`, null, `Profile updated! 🌟`);
    setSavedNotice(true);

    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div className="w-full max-w-lg bg-white border-4 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-2xl text-center select-none animate-pop">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎨</span>
            <h2 id="edit-profile-title" className="text-2xl font-black text-amber-950">
              Edit Child Profile
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              playTap();
              onClose();
            }}
            aria-label="Close edit profile dialog"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
          >
            ✕
          </button>
        </div>

        {savedNotice && (
          <div className="mb-3 p-2.5 bg-emerald-100 border border-emerald-400 text-emerald-800 font-bold rounded-2xl text-sm animate-pop">
            ✅ Profile updated successfully!
          </div>
        )}

        {/* 1. Choose Avatar */}
        <div className="text-left mb-4">
          <p className="text-sm font-bold text-slate-700 mb-2">
            1. Select Your Avatar:
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {AVATARS.map((avatar) => {
              const isSelected = selectedAvatarId === avatar.id;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => handleSelectAvatar(avatar.id)}
                  aria-label={`Choose ${avatar.name}`}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all cursor-pointer active:scale-90 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-100 ring-4 ring-amber-300 scale-105 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:bg-amber-50'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl mb-0.5">{avatar.emoji}</span>
                  <span className="text-[11px] font-bold text-slate-700 truncate w-full text-center">
                    {avatar.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Nickname Input */}
        <div className="text-left mb-5">
          <label htmlFor="edit-nickname" className="block text-sm font-bold text-slate-700 mb-1">
            2. Child Nickname:
          </label>
          <input
            id="edit-nickname"
            type="text"
            maxLength={20}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g. Little Explorer"
            className="w-full px-4 py-2.5 text-lg font-bold text-slate-800 bg-amber-50/70 border-2 border-amber-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all"
          />
          <p className="text-xs text-slate-400 mt-1">
            🔒 Saved locally on your device only. Your stars and learning progress remain safe.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              playTap();
              onClose();
            }}
            className="px-4 py-2.5 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition-colors cursor-pointer text-sm"
          >
            Cancel
          </button>
          <BigButton
            variant="amber"
            size="md"
            onClick={handleSave}
            icon="⭐"
            className="shadow-md"
          >
            Save Changes
          </BigButton>
        </div>
      </div>
    </div>
  );
}
