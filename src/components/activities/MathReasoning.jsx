import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/useApp';
import { MATH_REASONING_CHALLENGES } from '../../data/mathCurriculum';
import SubtitleBanner from '../common/SubtitleBanner';
import ConfettiModal from '../common/ConfettiModal';

export default function MathReasoning({ onHome }) {
  const { speak, playTap, playChime, playWiggle, awardStar } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [wigglingOption, setWigglingOption] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const timerRef = useRef(null);

  const currentItem = MATH_REASONING_CHALLENGES[currentIndex % MATH_REASONING_CHALLENGES.length];

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

    if (option === currentItem.answer) {
      setIsTransitioning(true);
      setSelectedOption(option);
      playChime();

      const spokenPraise = `Brilliant thinking! ${currentItem.explanation}`;
      const displayPraise = `Great job! ⭐ ${currentItem.explanation}`;
      speak(spokenPraise, null, displayPraise);

      const nextScore = roundScore + 1;
      setRoundScore(nextScore);

      if (nextScore >= 5) {
        timerRef.current = setTimeout(() => {
          awardStar('math_reasoning');
          setShowCelebration(true);
          setSelectedOption(null);
          setIsTransitioning(false);
        }, 1200);
      } else {
        timerRef.current = setTimeout(() => {
          setSelectedOption(null);
          setIsTransitioning(false);
          setCurrentIndex((prev) => (prev + 1) % MATH_REASONING_CHALLENGES.length);
        }, 1600);
      }
    } else {
      playWiggle();
      setWigglingOption(option);

      const encouragement = `Good try! Think about the clue: ${currentItem.question}`;
      speak(encouragement, null, encouragement);

      timerRef.current = setTimeout(() => setWigglingOption(null), 550);
    }
  };

  const handlePlayAgain = () => {
    setShowCelebration(false);
    setRoundScore(0);
    setSelectedOption(null);
    setIsTransitioning(false);
    setCurrentIndex((prev) => (prev + 1) % MATH_REASONING_CHALLENGES.length);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-2 flex flex-col items-center select-none">
      {/* Progress Tracker */}
      <div className="text-xs sm:text-sm font-bold text-slate-600 mb-2 bg-white/80 px-4 py-1.5 rounded-full border border-teal-200 shadow-xs">
        Puzzles Solved: <span className="text-teal-700 font-black">{roundScore}/5</span> ⭐
      </div>

      {/* Target Question Card */}
      <div className="w-full bg-white border-4 border-teal-300 rounded-3xl p-5 shadow-md text-center mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 bg-teal-100 text-teal-800 font-black rounded-full text-xs uppercase tracking-wider border border-teal-200 flex items-center gap-1">
            <span>{currentItem.icon}</span>
            <span>{currentItem.category}</span>
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

        {/* Pattern or Story Demonstration */}
        {currentItem.puzzle ? (
          <div className="flex items-center justify-center gap-2 sm:gap-3 my-3 p-4 bg-teal-50/70 rounded-2xl border-2 border-teal-200">
            {currentItem.puzzle.map((symbol, idx) => (
              <span
                key={idx}
                className={`text-4xl sm:text-5xl ${symbol === '❓' ? 'animate-bounce font-black text-teal-700' : 'animate-pop'}`}
              >
                {symbol}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-semibold bg-teal-50/70 p-4 rounded-2xl border border-teal-200 my-2">
            {currentItem.story}
          </p>
        )}

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
          {currentItem.question}
        </h2>
      </div>

      {/* Subtitle Banner with Repeat Button */}
      <SubtitleBanner onRepeat={askQuestion} />

      {/* 3 Option Tiles */}
      <div className="grid grid-cols-3 gap-3.5 sm:gap-4 w-full my-3">
        {currentItem.options.map((option) => {
          const isCorrect = selectedOption === option;
          const isWiggling = wigglingOption === option;

          let btnStyle =
            'btn-tactile bg-white hover:bg-teal-50 text-slate-900 border-3 border-teal-300 hover:border-teal-400';
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
              aria-label={`Option: ${option}`}
              className={`min-h-[76px] sm:min-h-[86px] rounded-3xl font-black text-3xl sm:text-4xl cursor-pointer active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-teal-300 shadow-md ${btnStyle} ${
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
        activityTitle="Math Reasoning & Puzzles"
        onPlayAgain={handlePlayAgain}
        onClose={onHome}
      />
    </div>
  );
}

