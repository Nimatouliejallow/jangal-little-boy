import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/useApp';
import { GRAMMAR_CHALLENGES } from '../../data/englishCurriculum';
import SubtitleBanner from '../common/SubtitleBanner';
import ConfettiModal from '../common/ConfettiModal';

export default function GrammarExplorer({ onHome }) {
  const { speak, playTap, playChime, playWiggle, awardStar } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  const [wigglingWord, setWigglingWord] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const timerRef = useRef(null);

  const currentItem = GRAMMAR_CHALLENGES[currentIndex % GRAMMAR_CHALLENGES.length];

  const askQuestion = useCallback(() => {
    speak(currentItem.audioPrompt, null, `${currentItem.question} — "${currentItem.sentence}"`);
  }, [currentItem, speak]);

  useEffect(() => {
    askQuestion();
  }, [askQuestion]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSelectOption = (word) => {
    if (isTransitioning) return;
    playTap();

    if (word === currentItem.targetWord) {
      setIsTransitioning(true);
      setSelectedWord(word);
      playChime();

      const spokenPraise = `Great job! "${word}" is correct! ${currentItem.explanation}`;
      const displayPraise = `Super! ⭐ "${word}" — ${currentItem.explanation}`;
      speak(spokenPraise, null, displayPraise);

      const nextScore = roundScore + 1;
      setRoundScore(nextScore);

      if (nextScore >= 5) {
        timerRef.current = setTimeout(() => {
          awardStar('grammar');
          setShowCelebration(true);
          setSelectedWord(null);
          setIsTransitioning(false);
        }, 1200);
      } else {
        timerRef.current = setTimeout(() => {
          setSelectedWord(null);
          setIsTransitioning(false);
          setCurrentIndex((prev) => (prev + 1) % GRAMMAR_CHALLENGES.length);
        }, 1500);
      }
    } else {
      playWiggle();
      setWigglingWord(word);

      const encouragement = `Good try! That word is "${word}". ${currentItem.question}`;
      speak(encouragement, null, encouragement);

      timerRef.current = setTimeout(() => setWigglingWord(null), 550);
    }
  };

  const handlePlayAgain = () => {
    setShowCelebration(false);
    setRoundScore(0);
    setSelectedWord(null);
    setIsTransitioning(false);
    setCurrentIndex((prev) => (prev + 1) % GRAMMAR_CHALLENGES.length);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-2 flex flex-col items-center select-none">
      {/* Progress Tracker */}
      <div className="text-xs sm:text-sm font-bold text-slate-600 mb-2 bg-white/80 px-4 py-1.5 rounded-full border border-purple-200 shadow-xs">
        Grammar Clues Solved: <span className="text-purple-700 font-black">{roundScore}/5</span> ⭐
      </div>

      {/* Target Question Card */}
      <div className="w-full bg-white border-4 border-purple-300 rounded-3xl p-5 shadow-md text-center mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 bg-purple-100 text-purple-800 font-extrabold rounded-full text-xs uppercase tracking-wider border border-purple-200">
            {currentItem.typeLabel}
          </span>
          <button
            type="button"
            onClick={() => {
              playTap();
              askQuestion();
            }}
            aria-label="Repeat audio prompt"
            className="w-9 h-9 rounded-full bg-purple-50 hover:bg-purple-200 text-purple-900 flex items-center justify-center text-sm border border-purple-300 active:scale-90 transition-transform cursor-pointer"
          >
            🔊
          </button>
        </div>

        <p className="text-lg sm:text-xl font-bold text-slate-600 mb-1">
          {currentItem.question}
        </p>

        {/* Highlighted Sentence with Icon */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 my-2 flex items-center justify-center gap-3">
          <span className="text-4xl" role="img" aria-hidden="true">
            {currentItem.icon}
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-800 italic">
            &ldquo;{currentItem.sentence}&rdquo;
          </span>
        </div>
      </div>

      {/* Subtitle Banner with Repeat Button */}
      <SubtitleBanner onRepeat={askQuestion} />

      {/* 3 Word Option Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 w-full my-3">
        {currentItem.options.map((word) => {
          const isCorrect = selectedWord === word;
          const isWiggling = wigglingWord === word;

          let btnStyle =
            'btn-tactile bg-white hover:bg-purple-50 text-slate-900 border-3 border-purple-200 hover:border-purple-400';
          if (isCorrect) {
            btnStyle =
              'bg-emerald-500 border-4 border-emerald-600 text-white ring-4 ring-emerald-300 shadow-lg scale-105 animate-pop';
          } else if (isWiggling) {
            btnStyle = 'animate-wiggle border-amber-400 bg-amber-50';
          }

          return (
            <button
              key={word}
              type="button"
              disabled={isTransitioning}
              onClick={() => handleSelectOption(word)}
              aria-label={`Grammar option: ${word}`}
              className={`relative min-h-[76px] sm:min-h-[86px] rounded-3xl font-black text-2xl sm:text-3xl cursor-pointer active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-md ${btnStyle} ${
                isTransitioning && !isCorrect ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <span>{word}</span>

              {isCorrect && (
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 text-white rounded-full text-base font-black flex items-center justify-center shadow-md border-2 border-white animate-pop">
                  ⭐
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Celebration Modal */}
      <ConfettiModal
        isOpen={showCelebration}
        activityTitle="Grammar Explorer"
        onPlayAgain={handlePlayAgain}
        onClose={onHome}
      />
    </div>
  );
}

