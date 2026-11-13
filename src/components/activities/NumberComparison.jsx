import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/useApp';
import { COMPARISON_CHALLENGES } from '../../data/mathCurriculum';
import SubtitleBanner from '../common/SubtitleBanner';
import ConfettiModal from '../common/ConfettiModal';

export default function NumberComparison({ onHome }) {
  const { speak, playTap, playChime, playWiggle, awardStar } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [wigglingChoice, setWigglingChoice] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const timerRef = useRef(null);

  const currentItem = COMPARISON_CHALLENGES[currentIndex % COMPARISON_CHALLENGES.length];

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

  const handleSelectChoice = (choice) => {
    if (isTransitioning) return;
    playTap();

    if (choice === currentItem.answer) {
      setIsTransitioning(true);
      setSelectedChoice(choice);
      playChime();

      const spokenPraise = `Great comparison! ${currentItem.explanation}`;
      const displayPraise = `Awesome! ⭐ ${currentItem.explanation}`;
      speak(spokenPraise, null, displayPraise);

      const nextScore = roundScore + 1;
      setRoundScore(nextScore);

      if (nextScore >= 5) {
        timerRef.current = setTimeout(() => {
          awardStar('comparisons');
          setShowCelebration(true);
          setSelectedChoice(null);
          setIsTransitioning(false);
        }, 1200);
      } else {
        timerRef.current = setTimeout(() => {
          setSelectedChoice(null);
          setIsTransitioning(false);
          setCurrentIndex((prev) => (prev + 1) % COMPARISON_CHALLENGES.length);
        }, 1500);
      }
    } else {
      playWiggle();
      setWigglingChoice(choice);

      const encouragement = `Good try! Count both sides carefully: ${currentItem.question}`;
      speak(encouragement, null, encouragement);

      timerRef.current = setTimeout(() => setWigglingChoice(null), 550);
    }
  };

  const handlePlayAgain = () => {
    setShowCelebration(false);
    setRoundScore(0);
    setSelectedChoice(null);
    setIsTransitioning(false);
    setCurrentIndex((prev) => (prev + 1) % COMPARISON_CHALLENGES.length);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-2 flex flex-col items-center select-none">
      {/* Progress Tracker */}
      <div className="text-xs sm:text-sm font-bold text-slate-600 mb-2 bg-white/80 px-4 py-1.5 rounded-full border border-teal-200 shadow-xs">
        Comparisons Solved: <span className="text-teal-700 font-black">{roundScore}/5</span> ⭐
      </div>

      {/* Target Question Header */}
      <div className="w-full bg-white border-4 border-teal-300 rounded-3xl p-5 shadow-md text-center mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="px-3 py-1 bg-teal-100 text-teal-800 font-black rounded-full text-xs uppercase tracking-wider border border-teal-200">
            Number Comparison
          </span>
          <button
            type="button"
            onClick={() => {
              playTap();
              askQuestion();
            }}
            aria-label="Repeat audio prompt"
            className="w-9 h-9 rounded-full bg-teal-50 hover:bg-teal-200 text-teal-900 flex items-center justify-center text-sm border border-teal-300 active:scale-90 transition-transform cursor-pointer"
          >
            🔊
          </button>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">
          {currentItem.question}
        </h2>
      </div>

      {/* Visual Groups Canvas */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 w-full mb-3">
        {/* Left Side Group */}
        <div className="bg-amber-50/80 border-3 border-amber-300 rounded-3xl p-4 flex flex-col items-center shadow-xs">
          <div className="text-sm font-bold text-slate-600 mb-2">
            Group A: <span className="font-black text-amber-900">{currentItem.left.count} {currentItem.left.label}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 min-h-[90px]">
            {Array.from({ length: currentItem.left.count }).map((_, i) => (
              <span key={i} className="text-3xl sm:text-4xl animate-pop" role="img" aria-hidden="true">
                {currentItem.left.icon}
              </span>
            ))}
          </div>
        </div>

        {/* Right Side Group */}
        <div className="bg-sky-50/80 border-3 border-sky-300 rounded-3xl p-4 flex flex-col items-center shadow-xs">
          <div className="text-sm font-bold text-slate-600 mb-2">
            Group B: <span className="font-black text-sky-900">{currentItem.right.count} {currentItem.right.label}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 min-h-[90px]">
            {Array.from({ length: currentItem.right.count }).map((_, i) => (
              <span key={i} className="text-3xl sm:text-4xl animate-pop" role="img" aria-hidden="true">
                {currentItem.right.icon}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Subtitle Banner with Repeat Button */}
      <SubtitleBanner onRepeat={askQuestion} />

      {/* Comparison Choice Buttons */}
      <div className="grid grid-cols-3 gap-3 w-full my-3">
        {/* Option 1: Left */}
        <button
          type="button"
          disabled={isTransitioning}
          onClick={() => handleSelectChoice('left')}
          className={`min-h-[72px] sm:min-h-[80px] rounded-3xl font-black text-lg sm:text-xl cursor-pointer active:scale-95 transition-all flex flex-col items-center justify-center p-2 focus:outline-none focus:ring-4 focus:ring-amber-300 shadow-md ${
            selectedChoice === 'left'
              ? 'bg-emerald-500 border-4 border-emerald-600 text-white animate-pop'
              : wigglingChoice === 'left'
              ? 'animate-wiggle border-amber-400 bg-amber-100 text-amber-950'
              : 'btn-tactile bg-white hover:bg-amber-100 text-amber-950 border-3 border-amber-300'
          } ${isTransitioning && selectedChoice !== 'left' ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <span>Group A</span>
          <span className="text-xs font-bold text-slate-500">({currentItem.left.count})</span>
        </button>

        {/* Option 2: Equal */}
        <button
          type="button"
          disabled={isTransitioning}
          onClick={() => handleSelectChoice('equal')}
          className={`min-h-[72px] sm:min-h-[80px] rounded-3xl font-black text-xl sm:text-2xl cursor-pointer active:scale-95 transition-all flex flex-col items-center justify-center p-2 focus:outline-none focus:ring-4 focus:ring-emerald-300 shadow-md ${
            selectedChoice === 'equal'
              ? 'bg-emerald-500 border-4 border-emerald-600 text-white animate-pop'
              : wigglingChoice === 'equal'
              ? 'animate-wiggle border-amber-400 bg-amber-100 text-amber-950'
              : 'btn-tactile bg-white hover:bg-emerald-100 text-emerald-950 border-3 border-emerald-300'
          } ${isTransitioning && selectedChoice !== 'equal' ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <span>Equal =</span>
          <span className="text-xs font-bold text-slate-500">(Same)</span>
        </button>

        {/* Option 3: Right */}
        <button
          type="button"
          disabled={isTransitioning}
          onClick={() => handleSelectChoice('right')}
          className={`min-h-[72px] sm:min-h-[80px] rounded-3xl font-black text-lg sm:text-xl cursor-pointer active:scale-95 transition-all flex flex-col items-center justify-center p-2 focus:outline-none focus:ring-4 focus:ring-sky-300 shadow-md ${
            selectedChoice === 'right'
              ? 'bg-emerald-500 border-4 border-emerald-600 text-white animate-pop'
              : wigglingChoice === 'right'
              ? 'animate-wiggle border-amber-400 bg-amber-100 text-amber-950'
              : 'btn-tactile bg-white hover:bg-sky-100 text-sky-950 border-3 border-sky-300'
          } ${isTransitioning && selectedChoice !== 'right' ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <span>Group B</span>
          <span className="text-xs font-bold text-slate-500">({currentItem.right.count})</span>
        </button>
      </div>

      {/* Celebration Modal */}
      <ConfettiModal
        isOpen={showCelebration}
        activityTitle="Number Comparison"
        onPlayAgain={handlePlayAgain}
        onClose={onHome}
      />
    </div>
  );
}

