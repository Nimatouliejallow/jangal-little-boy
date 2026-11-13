import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/useApp';
import { MULTIPLICATION_CHALLENGES } from '../../data/mathCurriculum';
import SubtitleBanner from '../common/SubtitleBanner';
import ConfettiModal from '../common/ConfettiModal';

export default function MultiplicationGroups({ onHome }) {
  const { speak, playTap, playChime, playWiggle, awardStar } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [wigglingAnswer, setWigglingAnswer] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const timerRef = useRef(null);

  const currentItem = MULTIPLICATION_CHALLENGES[currentIndex % MULTIPLICATION_CHALLENGES.length];

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

  const handleSelectOption = (num) => {
    if (isTransitioning) return;
    playTap();

    if (num === currentItem.total) {
      setIsTransitioning(true);
      setSelectedAnswer(num);
      playChime();

      const spokenPraise = `Great math! ${currentItem.sentence}! ${currentItem.formula}!`;
      const displayPraise = `Awesome! ⭐ ${currentItem.sentence} (${currentItem.formula})`;
      speak(spokenPraise, null, displayPraise);

      const nextScore = roundScore + 1;
      setRoundScore(nextScore);

      if (nextScore >= 5) {
        timerRef.current = setTimeout(() => {
          awardStar('multiplication');
          setShowCelebration(true);
          setSelectedAnswer(null);
          setIsTransitioning(false);
        }, 1200);
      } else {
        timerRef.current = setTimeout(() => {
          setSelectedAnswer(null);
          setIsTransitioning(false);
          setCurrentIndex((prev) => (prev + 1) % MULTIPLICATION_CHALLENGES.length);
        }, 1600);
      }
    } else {
      playWiggle();
      setWigglingAnswer(num);

      const encouragement = `Good try! Count each group of ${currentItem.itemsPerGroup}: ${currentItem.question}`;
      speak(encouragement, null, encouragement);

      timerRef.current = setTimeout(() => setWigglingAnswer(null), 550);
    }
  };

  const handlePlayAgain = () => {
    setShowCelebration(false);
    setRoundScore(0);
    setSelectedAnswer(null);
    setIsTransitioning(false);
    setCurrentIndex((prev) => (prev + 1) % MULTIPLICATION_CHALLENGES.length);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-2 flex flex-col items-center select-none">
      {/* Progress Tracker */}
      <div className="text-xs sm:text-sm font-bold text-slate-600 mb-2 bg-white/80 px-4 py-1.5 rounded-full border border-amber-200 shadow-xs">
        Equal Groups Solved: <span className="text-amber-700 font-black">{roundScore}/5</span> ⭐
      </div>

      {/* Target Question Card */}
      <div className="w-full bg-white border-4 border-amber-300 rounded-3xl p-5 shadow-md text-center mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 font-black rounded-full text-xs uppercase tracking-wider border border-amber-200">
            Equal Groups & Multiplication
          </span>
          <button
            type="button"
            onClick={() => {
              playTap();
              askQuestion();
            }}
            aria-label="Repeat audio prompt"
            className="w-9 h-9 rounded-full bg-amber-50 hover:bg-amber-200 text-amber-900 flex items-center justify-center text-sm border border-amber-300 active:scale-90 transition-transform cursor-pointer"
          >
            🔊
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-3">
          {currentItem.question}
        </h2>

        {/* Visual Equal Groups Demonstration */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 p-3 bg-amber-50/70 rounded-2xl border-2 border-amber-200">
          {Array.from({ length: currentItem.groups }).map((_, gIdx) => (
            <div
              key={gIdx}
              className="bg-white border-2 border-amber-300 rounded-2xl p-2.5 flex items-center gap-1.5 shadow-xs"
            >
              {Array.from({ length: currentItem.itemsPerGroup }).map((_, iIdx) => (
                <span key={iIdx} className="text-3xl sm:text-4xl animate-pop" role="img" aria-hidden="true">
                  {currentItem.icon}
                </span>
              ))}
              <span className="text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                {currentItem.itemsPerGroup}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs sm:text-sm font-bold text-slate-500 mt-2">
          💡 Think: {currentItem.groups} groups of {currentItem.itemsPerGroup} items!
        </p>
      </div>

      {/* Subtitle Banner with Repeat Button */}
      <SubtitleBanner onRepeat={askQuestion} />

      {/* 3 Numerical Option Tiles */}
      <div className="grid grid-cols-3 gap-3.5 sm:gap-4 w-full my-3">
        {currentItem.options.map((option) => {
          const isCorrect = selectedAnswer === option;
          const isWiggling = wigglingAnswer === option;

          let btnStyle =
            'btn-tactile bg-white hover:bg-amber-50 text-slate-900 border-3 border-amber-300 hover:border-amber-400';
          if (isCorrect) {
            btnStyle =
              'bg-emerald-500 border-4 border-emerald-600 text-white ring-4 ring-emerald-300 shadow-lg scale-105 animate-pop';
          } else if (isWiggling) {
            btnStyle = 'animate-wiggle border-amber-400 bg-amber-100';
          }

          return (
            <button
              key={option}
              type="button"
              disabled={isTransitioning}
              onClick={() => handleSelectOption(option)}
              aria-label={`Total items: ${option}`}
              className={`min-h-[76px] sm:min-h-[86px] rounded-3xl font-black text-4xl cursor-pointer active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-amber-300 shadow-md ${btnStyle} ${
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
        activityTitle="Multiplication Groups"
        onPlayAgain={handlePlayAgain}
        onClose={onHome}
      />
    </div>
  );
}

