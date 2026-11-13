import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/useApp';
import BigButton from './BigButton';

function generateChallenge() {
  const n1 = Math.floor(Math.random() * 4) + 1; // 1 to 4
  const n2 = Math.floor(Math.random() * 4) + 1; // 1 to 4
  const correct = n1 + n2;
  const opt1 = correct + 1;
  const opt2 = Math.max(1, correct - 1);
  const options = [correct, opt1, opt2].sort(() => Math.random() - 0.5);

  return { num1: n1, num2: n2, answer: correct, options };
}

export default function CaregiverBarrier({ isOpen, onClose, onSuccess }) {
  const { playTap, playWiggle, playChime } = useApp();
  const [challenge, setChallenge] = useState(() => generateChallenge());
  const [shake, setShake] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100%
  const holdIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleSelectOption = (option) => {
    playTap();
    if (option === challenge.answer) {
      playChime();
      onSuccess();
      setChallenge(generateChallenge());
      setHoldProgress(0);
    } else {
      playWiggle();
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const handleHoldStart = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    let progress = 0;

    holdIntervalRef.current = setInterval(() => {
      progress += 4; // ~2.5 seconds to reach 100%
      setHoldProgress(Math.min(100, progress));

      if (progress >= 100) {
        clearInterval(holdIntervalRef.current);
        playChime();
        onSuccess();
        setChallenge(generateChallenge());
        setHoldProgress(0);
      }
    }, 100);
  };

  const handleHoldEnd = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
    }
    setHoldProgress(0);
  };

  const handleClose = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    setChallenge(generateChallenge());
    setHoldProgress(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div
        className={`relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-4 border-slate-300 text-center ${
          shake ? 'animate-wiggle' : 'animate-pop'
        }`}
      >
        <div className="text-5xl mb-2">🔒</div>

        <h3 className="text-2xl font-bold text-slate-800 mb-1">
          Grown-Up Zone
        </h3>

        <p className="text-xs text-slate-500 mb-4 font-medium">
          (Accidental-access barrier for caregivers)
        </p>

        {/* Option A: Quick Arithmetic Challenge */}
        <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 mb-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Solve math puzzle:
          </p>
          <p className="text-2xl font-black text-amber-900 mb-3">
            {challenge.num1} + {challenge.num2} = ?
          </p>

          <div className="grid grid-cols-3 gap-2">
            {challenge.options.map((option, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(option)}
                className="min-h-[56px] rounded-xl bg-white hover:bg-amber-100 text-slate-800 font-extrabold text-xl border-2 border-amber-300 hover:border-amber-500 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
          — OR HOLD 3 SECONDS —
        </div>

        {/* Option B: 3-Second Hold Button */}
        <div className="mb-5">
          <button
            type="button"
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            className="w-full relative overflow-hidden py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded-2xl border-2 border-slate-300 cursor-pointer active:scale-98 transition-all"
          >
            {/* Progress Fill Bar */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-emerald-300/60 transition-all pointer-events-none"
              style={{ width: `${holdProgress}%` }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span>⏱️</span>
              <span>
                {holdProgress > 0 ? `Holding... ${Math.round(holdProgress)}%` : 'Press & Hold 3s to Enter'}
              </span>
            </span>
          </button>
        </div>

        <BigButton
          variant="slate"
          size="sm"
          onClick={handleClose}
          className="w-full text-base"
        >
          Back to Learning
        </BigButton>
      </div>
    </div>
  );
}
