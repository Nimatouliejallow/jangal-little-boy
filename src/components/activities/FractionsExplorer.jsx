import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/useApp';
import { FRACTIONS_CHALLENGES } from '../../data/mathCurriculum';
import SubtitleBanner from '../common/SubtitleBanner';
import ConfettiModal from '../common/ConfettiModal';

// Helper component that renders crisp fraction SVGs
function FractionVisual({ fractionItem, className = 'w-36 h-36 sm:w-44 sm:h-44' }) {
  if (fractionItem.shape === 'circle') {
    if (fractionItem.totalParts === 2) {
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          {/* Left half highlighted */}
          <path d="M 50 10 A 40 40 0 0 0 50 90 Z" fill="#10b981" stroke="#1e293b" strokeWidth="3" />
          {/* Right half unhighlighted */}
          <path d="M 50 10 A 40 40 0 0 1 50 90 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="#1e293b" strokeWidth="4" />
        </svg>
      );
    }
    if (fractionItem.totalParts === 4) {
      const p1 = fractionItem.highlightParts >= 1 ? '#10b981' : '#f8fafc';
      const p2 = fractionItem.highlightParts >= 2 ? '#10b981' : '#f8fafc';
      const p3 = fractionItem.highlightParts >= 3 ? '#10b981' : '#f8fafc';
      const p4 = fractionItem.highlightParts >= 4 ? '#10b981' : '#f8fafc';

      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          {/* Top-Right Quadrant */}
          <path d="M 50 50 L 50 10 A 40 40 0 0 1 90 50 Z" fill={p1} stroke="#1e293b" strokeWidth="3" />
          {/* Bottom-Right Quadrant */}
          <path d="M 50 50 L 90 50 A 40 40 0 0 1 50 90 Z" fill={p2} stroke="#1e293b" strokeWidth="3" />
          {/* Bottom-Left Quadrant */}
          <path d="M 50 50 L 50 90 A 40 40 0 0 1 10 50 Z" fill={p3} stroke="#1e293b" strokeWidth="3" />
          {/* Top-Left Quadrant */}
          <path d="M 50 50 L 10 50 A 40 40 0 0 1 50 10 Z" fill={p4} stroke="#1e293b" strokeWidth="3" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="#1e293b" strokeWidth="4" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="#1e293b" strokeWidth="4" />
        </svg>
      );
    }
  }

  if (fractionItem.shape === 'square') {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
        {/* 4 Quadrants */}
        <rect x="12" y="12" width="38" height="38" fill="#10b981" stroke="#1e293b" strokeWidth="3" />
        <rect x="50" y="12" width="38" height="38" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" />
        <rect x="12" y="50" width="38" height="38" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" />
        <rect x="50" y="50" width="38" height="38" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" />
      </svg>
    );
  }

  if (fractionItem.shape === 'rectangle') {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
        {/* 3 Columns */}
        <rect x="10" y="25" width="26.6" height="50" fill="#10b981" stroke="#1e293b" strokeWidth="3" />
        <rect x="36.6" y="25" width="26.6" height="50" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" />
        <rect x="63.2" y="25" width="26.6" height="50" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" />
      </svg>
    );
  }

  // Fallback equal parts circle
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="40" fill="#10b981" stroke="#1e293b" strokeWidth="4" />
      <line x1="50" y1="10" x2="50" y2="90" stroke="#1e293b" strokeWidth="4" />
      <line x1="10" y1="50" x2="90" y2="50" stroke="#1e293b" strokeWidth="4" />
    </svg>
  );
}

export default function FractionsExplorer({ onHome }) {
  const { speak, playTap, playChime, playWiggle, awardStar } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [wigglingOption, setWigglingOption] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const timerRef = useRef(null);

  const currentItem = FRACTIONS_CHALLENGES[currentIndex % FRACTIONS_CHALLENGES.length];

  const askQuestion = useCallback(() => {
    speak(currentItem.audioPrompt, null, currentItem.question);
  }, [currentItem, speak]);

  useEffect(() => {
    askQuestion();
  }, [askQuestion]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSelectOption = (option) => {
    if (isTransitioning) return;
    playTap();

    const isCorrect =
      option === currentItem.fractionNotation ||
      option === (currentItem.isEqual ? 'Yes, Equal' : 'One Whole (1)');

    if (isCorrect) {
      setIsTransitioning(true);
      setSelectedOption(option);
      playChime();

      const spokenPraise = `Great work! ${currentItem.explanation}`;
      const displayPraise = `Awesome! ⭐ ${currentItem.explanation}`;
      speak(spokenPraise, null, displayPraise);

      const nextScore = roundScore + 1;
      setRoundScore(nextScore);

      if (nextScore >= 5) {
        timerRef.current = setTimeout(() => {
          awardStar('fractions');
          setShowCelebration(true);
          setSelectedOption(null);
          setIsTransitioning(false);
        }, 1200);
      } else {
        timerRef.current = setTimeout(() => {
          setSelectedOption(null);
          setIsTransitioning(false);
          setCurrentIndex((prev) => (prev + 1) % FRACTIONS_CHALLENGES.length);
        }, 1600);
      }
    } else {
      playWiggle();
      setWigglingOption(option);

      const encouragement = `Good try! Look at the shaded parts: ${currentItem.question}`;
      speak(encouragement, null, encouragement);

      timerRef.current = setTimeout(() => setWigglingOption(null), 550);
    }
  };

  const handlePlayAgain = () => {
    setShowCelebration(false);
    setRoundScore(0);
    setSelectedOption(null);
    setIsTransitioning(false);
    setCurrentIndex((prev) => (prev + 1) % FRACTIONS_CHALLENGES.length);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-2 flex flex-col items-center select-none">
      {/* Progress Tracker */}
      <div className="text-xs sm:text-sm font-bold text-slate-600 mb-2 bg-white/80 px-4 py-1.5 rounded-full border border-emerald-200 shadow-xs">
        Fractions Discovered: <span className="text-emerald-700 font-black">{roundScore}/5</span> ⭐
      </div>

      {/* Target Question Card */}
      <div className="w-full bg-white border-4 border-emerald-300 rounded-3xl p-5 shadow-md text-center mb-3 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-2">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-black rounded-full text-xs uppercase tracking-wider border border-emerald-200">
            Fractions & Equal Parts
          </span>
          <button
            type="button"
            onClick={() => {
              playTap();
              askQuestion();
            }}
            aria-label="Repeat audio prompt"
            className="w-9 h-9 rounded-full bg-emerald-50 hover:bg-emerald-200 text-emerald-900 flex items-center justify-center text-sm border border-emerald-300 active:scale-90 transition-transform cursor-pointer"
          >
            🔊
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-3">
          {currentItem.question}
        </h2>

        {/* Visual Fraction Shape Display */}
        <div className="p-4 bg-emerald-50/70 rounded-3xl border-2 border-emerald-200 my-1 flex items-center justify-center">
          <FractionVisual fractionItem={currentItem} />
        </div>
      </div>

      {/* Subtitle Banner with Repeat Button */}
      <SubtitleBanner onRepeat={askQuestion} />

      {/* 3 Fraction Option Buttons */}
      <div className="grid grid-cols-3 gap-3.5 sm:gap-4 w-full my-3">
        {currentItem.options.map((option) => {
          const isCorrect = selectedOption === option;
          const isWiggling = wigglingOption === option;

          let btnStyle =
            'btn-tactile bg-white hover:bg-emerald-50 text-slate-900 border-3 border-emerald-300 hover:border-emerald-400';
          if (isCorrect) {
            btnStyle =
              'bg-emerald-500 border-4 border-emerald-600 text-white ring-4 ring-emerald-300 shadow-lg scale-105 animate-pop';
          } else if (isWiggling) {
            btnStyle = 'animate-wiggle border-amber-400 bg-amber-50';
          }

          return (
            <button
              key={option}
              type="button"
              disabled={isTransitioning}
              onClick={() => handleSelectOption(option)}
              aria-label={`Fraction option: ${option}`}
              className={`min-h-[76px] sm:min-h-[86px] rounded-3xl font-black text-2xl sm:text-3xl cursor-pointer active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-emerald-300 shadow-md ${btnStyle} ${
                isTransitioning && !isCorrect ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <span>{option}</span>
              {isCorrect && <span className="ml-2 text-2xl">⭐</span>}
            </button>
          );
        })}
      </div>

      {/* Celebration Modal */}
      <ConfettiModal
        isOpen={showCelebration}
        activityTitle="Fractions Explorer"
        onPlayAgain={handlePlayAgain}
        onClose={onHome}
      />
    </div>
  );
}

