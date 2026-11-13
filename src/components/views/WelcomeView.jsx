import { useState } from 'react';
import { useApp } from '../../context/useApp';
import { AVATARS } from '../../data/avatars';
import BigButton from '../common/BigButton';

export default function WelcomeView({ onStart }) {
  const { profile, updateProfile, unlockAudio, speak, playTap } = useApp();
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarId || 'boy_sun');
  const [nickname, setNickname] = useState(profile.nickname || 'Little Explorer');

  const handleSelectAvatar = (id) => {
    playTap();
    setSelectedAvatar(id);
  };

  const handleStart = () => {
    unlockAudio();
    const finalNickname = nickname.trim() || 'Little Explorer';
    updateProfile({
      avatarId: selectedAvatar,
      nickname: finalNickname,
      hasCompletedWelcome: true,
    });
    speak(`Welcome, ${finalNickname}! Let's learn with Jàngal!`);
    onStart();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col items-center text-center">
      {/* App Header Badge */}
      <div className="inline-flex items-center gap-2 bg-amber-200 border-2 border-amber-400 px-4 py-1.5 rounded-full text-amber-950 font-extrabold text-sm mb-4 animate-bounce">
        <span>☀️</span>
        <span>Jàngal = "To Teach & Learn" in Wolof</span>
      </div>

      <h1 className="text-4xl sm:text-5xl font-black text-amber-950 tracking-tight mb-2">
        Jangal Little Boy
      </h1>

      <p className="text-lg sm:text-xl text-slate-700 font-semibold mb-6 max-w-md">
        Fun, joyful learning for preschool explorers! English & Math made easy.
      </p>

      {/* Choose Avatar Section */}
      <div className="w-full bg-white/90 border-3 border-amber-300 rounded-3xl p-5 mb-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-3">
          1. Choose Your Friendly Avatar:
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-2">
          {AVATARS.map((avatar) => {
            const isSelected = selectedAvatar === avatar.id;
            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() => handleSelectAvatar(avatar.id)}
                aria-label={`Select ${avatar.name} as avatar`}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-3 transition-all cursor-pointer active:scale-90 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-100 scale-105 shadow-md ring-4 ring-amber-300'
                    : 'border-slate-200 bg-slate-50 hover:bg-amber-50'
                }`}
              >
                <span className="text-4xl sm:text-5xl mb-1">{avatar.emoji}</span>
                <span className="text-xs font-bold text-slate-700">{avatar.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nickname Input Section (Optional, Privacy-First) */}
      <div className="w-full bg-white/90 border-3 border-amber-300 rounded-3xl p-5 mb-6 shadow-sm text-left">
        <label htmlFor="nickname" className="block text-xl font-bold text-slate-800 mb-1">
          2. Your Nickname <span className="text-sm font-normal text-slate-500">(Optional)</span>:
        </label>
        <p className="text-xs text-slate-500 mb-3">
          🔒 Private & Safe: No real name needed. Stored only on your device.
        </p>

        <input
          id="nickname"
          type="text"
          maxLength={20}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="e.g. Little Explorer"
          className="w-full px-4 py-3 text-xl font-bold text-slate-800 bg-amber-50 border-2 border-amber-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all"
        />
      </div>

      {/* Start Learning Button */}
      <BigButton
        variant="amber"
        size="lg"
        onClick={handleStart}
        className="w-full sm:w-auto shadow-lg text-2xl"
        icon="🚀"
      >
        Let's Play & Learn!
      </BigButton>
    </div>
  );
}
