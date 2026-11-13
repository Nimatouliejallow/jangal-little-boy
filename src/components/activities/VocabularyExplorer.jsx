import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/useApp';
import { THEMATIC_VOCABULARY } from '../../data/englishCurriculum';
import SubtitleBanner from '../common/SubtitleBanner';
import ConfettiModal from '../common/ConfettiModal';

export default function VocabularyExplorer({ onHome }) {
  const { speak, playTap, playChime, playWiggle, awardStar } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  const [wigglingWord, setWigglingWord] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const timerRef = useRef(null);

  const currentItem = THEMATIC_VOCABULARY[currentIndex % THEMATIC_VOCABULARY.length];

  const askQuestion = useCallback(() => {
    speak(
      currentItem.audioPrompt,
      null,
      currentItem.displayPrompt || currentItem.audioPrompt
    );
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

    if (option.word === currentItem.word) {
      setIsTransitioning(true);
      setSelectedWord(option.word);
      playChime();

      const spokenPraise = `Wonderful! That is the ${currentItem.word}. ${currentItem.sentence}`;
      const displayPraise = `Great job! ⭐ ${currentItem.word} — ${currentItem.sentence}`;
      speak(spokenPraise, null, displayPraise);

      const nextScore = roundScore + 1;
      setRoundScore(nextScore);

      if (nextScore >= 5) {
        timerRef.current = setTimeout(() => {
          awardStar('vocabulary');
          setShowCelebration(true);
          setSelectedWord(null);
          setIsTransitioning(false);
        }, 1200);
      } else {
        timerRef.current = setTimeout(() => {
          setSelectedWord(null);
          setIsTransitioning(false);
          setCurrentIndex((prev) => (prev + 1) % THEMATIC_VOCABULARY.length);
        }, 1500);
      }
    } else {
      playWiggle();
      setWigglingWord(option.word);

      const encouragement = `Good try! That is the ${option.word}. Look for the ${currentItem.word}!`;
      speak(encouragement, null, encouragement);

      timerRef.current = setTimeout(() => setWigglingWord(null), 550);
    }
  };

  const handlePlayAgain = () => {
    setShowCelebration(false);
    setRoundScore(0);
    setSelectedWord(null);
    setIsTransitioning(false);
    setCurrentIndex((prev) => (prev + 1) % THEMATIC_VOCABULARY.length);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-2 flex flex-col items-center select-none">
      {/* Round Progress Tracker */}
      <div className="text-xs sm:text-sm font-bold text-slate-600 mb-2 bg-white/80 px-4 py-1.5 rounded-full border border-sky-200 shadow-xs">
        Words Explored: <span className="text-sky-700 font-black">{roundScore}/5</span> ⭐
      </div>

      {/* Target Word Clue Card */}
      <div className="w-full bg-white border-4 border-sky-300 rounded-3xl p-5 shadow-md text-center mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 bg-sky-100 text-sky-800 font-extrabold rounded-full text-xs uppercase tracking-wider flex items-center gap-1 border border-sky-200">
            <span>{currentItem.themeIcon}</span>
            <span>{currentItem.theme}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              playTap();
              askQuestion();
            }}
            aria-label="Repeat audio prompt"
            className="w-9 h-9 rounded-full bg-sky-50 hover:bg-sky-200 text-sky-900 flex items-center justify-center text-sm border border-sky-300 active:scale-90 transition-transform cursor-pointer"
          >
            🔊
          </button>
        </div>

        <p className="text-xl sm:text-2xl font-black text-slate-700">
          Find the word:
        </p>
        <span className="text-3xl sm:text-4xl font-black text-sky-900 mt-1 block">
          {currentItem.word}
        </span>
      </div>

      {/* Subtitle Banner with Repeat Button */}
      <SubtitleBanner onRepeat={askQuestion} />

      {/* 3 Large Picture Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 w-full my-3">
        {currentItem.options.map((option) => {
          const isCorrect = selectedWord === option.word;
          const isWiggling = wigglingWord === option.word;

          let tileStyle =
            'btn-tactile bg-white hover:bg-sky-50 border-3 border-sky-200 hover:border-sky-400';
          if (isCorrect) {
            tileStyle =
              'bg-emerald-50 border-4 border-emerald-500 ring-4 ring-emerald-300 shadow-lg scale-105 animate-pop';
          } else if (isWiggling) {
            tileStyle = 'animate-wiggle border-amber-400 bg-amber-50';
          }

          return (
            <button
              key={option.word}
              type="button"
              disabled={isTransitioning}
              onClick={() => handleSelectOption(option)}
              aria-label={`Picture of ${option.word}`}
              className={`relative min-h-[120px] sm:min-h-[140px] rounded-3xl cursor-pointer active:scale-95 transition-all flex flex-col items-center justify-center p-4 focus:outline-none focus:ring-4 focus:ring-sky-300 shadow-md ${tileStyle} ${
                isTransitioning && !isCorrect ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <span className="text-6xl sm:text-7xl mb-1" role="img" aria-hidden="true">
                {option.icon}
              </span>
              <span className="font-extrabold text-base sm:text-lg text-slate-800">
                {option.word}
              </span>

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
        activityTitle="Thematic Vocabulary"
        onPlayAgain={handlePlayAgain}
        onClose={onHome}
      />
    </div>
  );
}

