import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/useApp';
import { ADDITION_CHALLENGES, SUBTRACTION_CHALLENGES } from '../../data/mathCurriculum';
import SubtitleBanner from '../common/SubtitleBanner';
import ConfettiModal from '../common/ConfettiModal';

export default function MathOperations({ onHome }) {
  const { speak, playTap, playChime, playWiggle, awardStar } = useApp();
  const [operationMode, setOperationMode] = useState('addition'); // 'addition' | 'subtraction'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [wigglingAnswer, setWigglingAnswer] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const timerRef = useRef(null);

  const dataset = operationMode === 'addition' ? ADDITION_CHALLENGES : SUBTRACTION_CHALLENGES;
  const currentItem = dataset[currentIndex % dataset.length];
  const targetAnswer = operationMode === 'addition' ? currentItem.sum : currentItem.difference;

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

    if (num === targetAnswer) {
      setIsTransitioning(true);
      setSelectedAnswer(num);
      playChime();

      const spokenPraise = `Awesome math! ${currentItem.sentence}!`;
      const displayPraise = `Great job! ⭐ ${currentItem.sentence}`;
      speak(spokenPraise, null, displayPraise);

      const nextScore = roundScore + 1;
      setRoundScore(nextScore);

      if (nextScore >= 5) {
        timerRef.current = setTimeout(() => {
          awardStar(operationMode === 'addition' ? 'addition' : 'subtraction');
          setShowCelebration(true);
          setSelectedAnswer(null);
          setIsTransitioning(false);
        }, 1200);
      } else {
        timerRef.current = setTimeout(() => {
          setSelectedAnswer(null);
          setIsTransitioning(false);
          setCurrentIndex((prev) => (prev + 1) % dataset.length);
        }, 1500);
      }
    } else {
      playWiggle();
      setWigglingAnswer(num);

      const encouragement = `Good try! Count the items carefully: ${currentItem.question}`;
      speak(encouragement, null, encouragement);

      timerRef.current = setTimeout(() => setWigglingAnswer(null), 550);
    }
  };

  const switchMode = (mode) => {
    playTap();
    setOperationMode(mode);
    setCurrentIndex(0);
    setRoundScore(0);
    setSelectedAnswer(null);
    setIsTransitioning(false);
  };

  const handlePlayAgain = () => {
    setShowCelebration(false);
    setRoundScore(0);
    setSelectedAnswer(null);
    setIsTransitioning(false);
    setCurrentIndex((prev) => (prev + 1) % dataset.length);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-2 flex flex-col items-center select-none">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 mb-3 bg-white p-1 rounded-2xl border-2 border-emerald-300 shadow-xs">
        <button
          type="button"
          onClick={() => switchMode('addition')}
          className={`px-4 py-2 rounded-xl font-black text-sm sm:text-base transition-all cursor-pointer ${
            operationMode === 'addition'
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ➕ Addition
        </button>
        <button
          type="button"
          onClick={() => switchMode('subtraction')}
          className={`px-4 py-2 rounded-xl font-black text-sm sm:text-base transition-all cursor-pointer ${
            operationMode === 'subtraction'
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ➖ Subtraction
        </button>
      </div>

      {/* Progress Tracker */}
      <div className="text-xs sm:text-sm font-bold text-slate-600 mb-2 bg-white/80 px-4 py-1.5 rounded-full border border-emerald-200 shadow-xs">
        Problems Solved: <span className="text-emerald-700 font-black">{roundScore}/5</span> ⭐
      </div>

      {/* Target Problem Card */}
      <div className="w-full bg-white border-4 border-emerald-300 rounded-3xl p-5 shadow-md text-center mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {operationMode === 'addition' ? 'Add objects together' : 'Take away objects'}
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

        {/* Visual Item Demonstration */}
        <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl p-4 my-2 flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
          {operationMode === 'addition' ? (
            <>
              {/* Group 1 */}
              <div className="flex items-center gap-1 bg-white p-2.5 rounded-xl border border-emerald-200">
                {Array.from({ length: currentItem.num1 }).map((_, i) => (
                  <span key={i} className="text-3xl sm:text-4xl animate-pop" role="img" aria-hidden="true">
                    {currentItem.icon}
                  </span>
                ))}
                <span className="ml-2 font-black text-2xl text-emerald-800">({currentItem.num1})</span>
              </div>

              <span className="text-3xl font-black text-emerald-700">➕</span>

              {/* Group 2 */}
              <div className="flex items-center gap-1 bg-white p-2.5 rounded-xl border border-emerald-200">
                {Array.from({ length: currentItem.num2 }).map((_, i) => (
                  <span key={i} className="text-3xl sm:text-4xl animate-pop" role="img" aria-hidden="true">
                    {currentItem.icon}
                  </span>
                ))}
                <span className="ml-2 font-black text-2xl text-emerald-800">({currentItem.num2})</span>
              </div>
            </>
          ) : (
            <>
              {/* Total Group with Crossouts */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center bg-white p-3 rounded-xl border border-emerald-200">
                {Array.from({ length: currentItem.total }).map((_, i) => {
                  const isCrossed = i >= currentItem.total - currentItem.removed;
                  return (
                    <div key={i} className="relative">
                      <span
                        className={`text-3xl sm:text-4xl inline-block ${
                          isCrossed ? 'opacity-30 grayscale' : 'animate-pop'
                        }`}
                        role="img"
                        aria-hidden="true"
                      >
                        {currentItem.icon}
                      </span>
                      {isCrossed && (
                        <span className="absolute inset-0 flex items-center justify-center text-rose-600 font-black text-2xl">
                          ❌
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <span className="text-lg font-bold text-slate-600">
                ({currentItem.total} items minus {currentItem.removed})
              </span>
            </>
          )}
        </div>

        <p className="text-xl sm:text-2xl font-black text-slate-800 mt-2">
          {currentItem.question}
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
              aria-label={`Answer choice: ${option}`}
              className={`min-h-[76px] sm:min-h-[86px] rounded-3xl font-black text-4xl cursor-pointer active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-emerald-300 shadow-md ${btnStyle} ${
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
        activityTitle={operationMode === 'addition' ? 'Addition Fun' : 'Subtraction Explorer'}
        onPlayAgain={handlePlayAgain}
        onClose={onHome}
      />
    </div>
  );
}

