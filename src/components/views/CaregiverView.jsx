import { useState } from 'react';
import { useApp } from '../../context/useApp';
import { AVATARS } from '../../data/avatars';
import BigButton from '../common/BigButton';

export default function CaregiverView({ onBack }) {
  const {
    profile,
    progress,
    settings,
    updateProfile,
    updateSettings,
    resetProgress,
    playTap,
    playChime,
  } = useApp();
  const [selectedAvatarId, setSelectedAvatarId] = useState(profile.avatarId || 'boy_sun');
  const [nickname, setNickname] = useState(profile.nickname || 'Little Explorer');
  const [profileSavedNotice, setProfileSavedNotice] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [resetDoneNotice, setResetDoneNotice] = useState(false);

  const handleSaveProfile = () => {
    playTap();
    playChime();
    const finalNickname = nickname.trim() || 'Little Explorer';
    updateProfile({
      avatarId: selectedAvatarId,
      nickname: finalNickname,
    });
    setProfileSavedNotice(true);
    setTimeout(() => setProfileSavedNotice(false), 3000);
  };

  const handleConfirmReset = () => {
    playTap();
    resetProgress();
    setShowConfirmReset(false);
    setResetDoneNotice(true);
    setTimeout(() => setResetDoneNotice(false), 3000);
  };

  const curriculumGroups = [
    {
      levelTitle: 'Level 1: Early Foundation (Ages 3–5)',
      items: [
        { id: 'phonics', title: 'Alphabet & Phonics Explorer', subject: 'English' },
        { id: 'cvc_words', title: 'First Words Match (CVC)', subject: 'English' },
        { id: 'counting', title: 'Counting 1 to 10', subject: 'Math' },
        { id: 'shapes_colours', title: 'Shapes & Colours Identifier', subject: 'Math' },
        { id: 'comparisons', title: 'Number Comparison', subject: 'Math' },
      ],
    },
    {
      levelTitle: 'Level 2: Developing Foundation (Ages 5–7)',
      items: [
        { id: 'vocabulary', title: 'Thematic Vocabulary Explorer', subject: 'English' },
        { id: 'spelling', title: 'Spelling & Missing Letters', subject: 'English' },
        { id: 'sentence_builder', title: 'Sentence Constructor & Early Reading', subject: 'English' },
        { id: 'addition', title: 'Visual Addition', subject: 'Math' },
        { id: 'subtraction', title: 'Visual Subtraction', subject: 'Math' },
        { id: 'multiplication', title: 'Equal Groups & Multiplication', subject: 'Math' },
      ],
    },
    {
      levelTitle: 'Level 3: Expanding Knowledge (Ages 7–10)',
      items: [
        { id: 'grammar', title: 'Grammar Detective', subject: 'English' },
        { id: 'reading_comprehension', title: 'Story Reading Comprehension', subject: 'English' },
        { id: 'division', title: 'Fair Sharing & Division', subject: 'Math' },
        { id: 'fractions', title: 'Fractions Explorer', subject: 'Math' },
        { id: 'math_reasoning', title: 'Mathematical Reasoning & Puzzles', subject: 'Math' },
      ],
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 select-none">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-2">
          <span>⚙️</span>
          <span>Caregiver Dashboard</span>
        </h1>

        <BigButton variant="slate" size="sm" onClick={onBack}>
          Back to App ➡️
        </BigButton>
      </div>

      {resetDoneNotice && (
        <div className="mb-4 p-3 bg-emerald-100 border-2 border-emerald-400 text-emerald-800 rounded-2xl font-bold text-center animate-pop">
          ✅ Progress has been successfully reset!
        </div>
      )}

      {/* Progress & Milestone Overview */}
      <div className="bg-white border-3 border-amber-300 rounded-3xl p-5 mb-5 shadow-xs">
        <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
          <span>⭐</span>
          <span>Learner Progress Overview</span>
        </h2>

        <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-2xl border border-amber-200 mb-4">
          <div className="text-5xl">🌟</div>
          <div>
            <p className="text-3xl font-black text-amber-900">{progress.totalStars} Stars</p>
            <p className="text-xs text-amber-700 font-semibold">
              Earned across completed activities in English and Mathematics
            </p>
          </div>
        </div>

        {/* Grouped Activity Completion Checklist */}
        <div className="space-y-4">
          {curriculumGroups.map((group, gIdx) => (
            <div key={gIdx} className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                {group.levelTitle}
              </h3>

              <ul className="space-y-1.5">
                {group.items.map((act) => {
                  const completed = progress.completedActivityIds.includes(act.id);
                  return (
                    <li
                      key={act.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                            act.subject === 'English'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {act.subject}
                        </span>
                        <span className="text-slate-800">{act.title}</span>
                      </div>

                      {completed ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs">
                          <span>✅</span> Completed ⭐
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium text-xs">In Progress</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Profile & Nickname Management */}
      <div className="bg-white border-3 border-slate-200 rounded-3xl p-5 mb-5 shadow-xs">
        <h2 className="text-xl font-bold text-slate-800 mb-1">
          Child Profile & Avatar
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          🔒 Private: Kept only in local device memory. Never sent to any server.
        </p>

        {profileSavedNotice && (
          <div className="mb-3 p-2 bg-emerald-100 border border-emerald-400 text-emerald-800 rounded-xl text-xs font-bold animate-pop">
            ✅ Profile changes saved!
          </div>
        )}

        {/* Avatar Selection */}
        <div className="mb-4">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Selected Avatar:
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {AVATARS.map((avatar) => {
              const isSelected = selectedAvatarId === avatar.id;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => {
                    playTap();
                    setSelectedAvatarId(avatar.id);
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all cursor-pointer active:scale-90 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-100 ring-4 ring-amber-300 scale-105 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-amber-50'
                  }`}
                >
                  <span className="text-3xl mb-0.5">{avatar.emoji}</span>
                  <span className="text-[11px] font-bold text-slate-700 truncate w-full text-center">
                    {avatar.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nickname Input */}
        <div>
          <label htmlFor="caregiver-nickname" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Nickname:
          </label>
          <div className="flex gap-2">
            <input
              id="caregiver-nickname"
              type="text"
              maxLength={20}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="flex-1 px-4 py-2 text-base sm:text-lg font-bold bg-slate-50 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <BigButton variant="amber" size="sm" onClick={handleSaveProfile}>
              Save Profile
            </BigButton>
          </div>
        </div>
      </div>

      {/* Audio & Speech Preferences */}
      <div className="bg-white border-3 border-slate-200 rounded-3xl p-5 mb-5 shadow-xs">
        <h2 className="text-xl font-bold text-slate-800 mb-3">
          Audio & Speech Settings
        </h2>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
            <span className="font-bold text-slate-700 text-sm sm:text-base">
              Sound Effects (Bells & Chimes)
            </span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              className="w-6 h-6 rounded accent-amber-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
            <span className="font-bold text-slate-700 text-sm sm:text-base">
              Spoken Voice Narration
            </span>
            <input
              type="checkbox"
              checked={settings.speechEnabled}
              onChange={(e) => updateSettings({ speechEnabled: e.target.checked })}
              className="w-6 h-6 rounded accent-amber-500 cursor-pointer"
            />
          </label>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-slate-700 text-sm sm:text-base">
                Voice Speaking Speed:
              </span>
              <span className="text-sm font-extrabold text-amber-600">{settings.speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.1"
              step="0.05"
              value={settings.speechRate}
              onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400 font-semibold mt-1">
              <span>Slower (Gentle)</span>
              <span>Preschool Pace (0.85x)</span>
              <span>Faster</span>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone: Reset Progress */}
      <div className="bg-rose-50 border-3 border-rose-200 rounded-3xl p-5 mb-6 shadow-xs">
        <h2 className="text-lg font-bold text-rose-900 mb-1">
          Reset Learning Data
        </h2>
        <p className="text-xs text-rose-700 mb-3">
          Resets all cumulative stars and completed milestones back to zero.
        </p>

        {!showConfirmReset ? (
          <button
            type="button"
            onClick={() => {
              playTap();
              setShowConfirmReset(true);
            }}
            className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl border-2 border-rose-600 cursor-pointer active:scale-95 transition-all text-sm shadow-xs"
          >
            Reset All Progress
          </button>
        ) : (
          <div className="p-3 bg-white rounded-2xl border-2 border-rose-300 animate-pop">
            <p className="text-sm font-bold text-rose-900 mb-2">
              Are you sure? All stars and completed badges will be cleared!
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs cursor-pointer active:scale-95"
              >
                Yes, Reset Everything
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
