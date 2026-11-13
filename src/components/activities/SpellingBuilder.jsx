import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/useApp';
import { SPELLING_CHALLENGES } from '../../data/englishCurriculum';
import SubtitleBanner from '../common/SubtitleBanner';
import ConfettiModal from '../common/ConfettiModal';

function shuffleOptions(options) {
  const shuffled = [...options];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export default function SpellingBuilder({ onHome }) {
  const { speak, playTap, playChime, playWiggle, awardStar } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState(() =>
    shuffleOptions(SPELLING_CHALLENGES[0].options)
  );
  const [roundScore, setRoundScore] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [wigglingLetter, setWigglingLetter] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const timerRef = useRef(null);

  const currentItem = SPELLING_CHALLENGES[currentIndex % SPELLING_CHALLENGES.length];

  const advanceQuestion = () => {
    const nextIndex = (currentIndex + 1) % SPELLING_CHALLENGES.length;
    setCurrentIndex(nextIndex);
    setShuffledOptions(shuffleOptions(SPELLING_CHALLENGES[nextIndex].options));
  };

  const askQuestion = useCallback(() => {
    speak(
      currentItem.targetWord.toLowerCase(),
      null,
      'Look at the picture. Complete the word.'
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

  const handleSelectLetter = (letter) => {
    if (isTransitioning) return;
    playTap();

    if (letter === currentItem.missingLetter) {
      setIsTransitioning(true);
      setSelectedLetter(letter);
      playChime();

      const spelled = currentItem.targetWord.split('').join('-');
      const spokenPraise = `Great spelling! ${spelled} spells ${currentItem.targetWord}!`;
      const displayPraise = `Super! ⭐ ${currentItem.targetWord} is spelled correctly!`;
      speak(spokenPraise, null, displayPraise);

      const nextScore = roundScore + 1;
      setRoundScore(nextScore);

      if (nextScore >= 5) {
        timerRef.current = setTimeout(() => {
          awardStar('spelling');
          setShowCelebration(true);
          setSelectedLetter(null);
          setIsTransitioning(false);
        }, 1200);
      } else {
        timerRef.current = setTimeout(() => {
          setSelectedLetter(null);
          setIsTransitioning(false);
          advanceQuestion();
        }, 1400);
      }
    } else {
      playWiggle();
      setWigglingLetter(letter);

      const encouragement = `Good try! That is ${letter}. ${currentItem.hint}`;
      speak(encouragement, null, encouragement);

      timerRef.current = setTimeout(() => setWigglingLetter(null), 550);
    }
  };

  const handlePlayAgain = () => {
    setShowCelebration(false);
    setRoundScore(0);
    setSelectedLetter(null);
    setIsTransitioning(false);
    advanceQuestion();
  };

  const letters = currentItem.targetWord.split('');

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-2 flex flex-col items-center select-none">
      {/* Progress Tracker */}
      <div className="text-xs sm:text-sm font-bold text-slate-600 mb-2 bg-white/80 px-4 py-1.5 rounded-full border border-amber-200 shadow-xs">
        Words Spelled: <span className="text-amber-700 font-black">{roundScore}/5</span> ⭐
      </div>

      {/* Target Word Clue Card */}
      <div className="w-full bg-white border-4 border-amber-300 rounded-3xl p-5 shadow-md text-center mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-5xl sm:text-6xl inline-block" role="img" aria-label="Picture clue">
            {currentItem.icon}
          </span>
          <button
            type="button"
            onClick={() => {
              playTap();
              askQuestion();
            }}
            aria-label="Listen to the word again"
            className="w-9 h-9 rounded-full bg-amber-50 hover:bg-amber-200 text-amber-900 flex items-center justify-center text-sm border border-amber-300 active:scale-90 transition-transform cursor-pointer"
          >
            🔊
          </button>
        </div>

        {/* Word boxes show one missing letter without revealing the complete spelling. */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 my-3">
          {letters.map((char, idx) => {
            const isMissing = idx === currentItem.missingIndex;
            const isFilled = isMissing && selectedLetter;

            return (
              <div
                key={idx}
                className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl border-3 flex items-center justify-center text-3xl sm:text-4xl font-black shadow-xs ${
                  isFilled
                    ? 'bg-emerald-400 border-emerald-600 text-white animate-pop'
                    : isMissing
                    ? 'bg-amber-100 border-dashed border-amber-400 text-amber-600'
                    : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                {isFilled ? selectedLetter : isMissing ? '?' : char}
              </div>
            );
          })}
        </div>

        <p className="text-sm text-slate-500 font-bold">
          Complete the word.
        </p>
      </div>

      {/* Subtitle Banner with Repeat Button */}
      <SubtitleBanner onRepeat={askQuestion} />

      {/* Letter choices */}
      <div className="grid grid-cols-3 gap-3.5 sm:gap-4 w-full my-3">
        {shuffledOptions.map((letter) => {
          const isCorrect = selectedLetter === letter;
          const isWiggling = wigglingLetter === letter;

          let btnStyle =
            'btn-tactile bg-white hover:bg-amber-50 text-slate-900 border-3 border-amber-300 hover:border-amber-400';
          if (isCorrect) {
            btnStyle =
              'bg-emerald-500 border-4 border-emerald-600 text-white ring-4 ring-emerald-300 shadow-lg scale-105 animate-pop';
          } else if (isWiggling) {
            btnStyle = 'animate-wiggle border-amber-500 bg-amber-100';
          }

          return (
            <button
              key={letter}
              type="button"
              disabled={isTransitioning}
              onClick={() => handleSelectLetter(letter)}
              aria-label={`Letter ${letter}`}
              className={`min-h-[76px] sm:min-h-[86px] rounded-3xl font-black text-4xl cursor-pointer active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-amber-300 shadow-md ${btnStyle} ${
                isTransitioning && !isCorrect ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Celebration Modal */}
      <ConfettiModal
        isOpen={showCelebration}
        activityTitle="Spelling Builder"
        onPlayAgain={handlePlayAgain}
        onClose={onHome}
      />
    </div>
  );
}

