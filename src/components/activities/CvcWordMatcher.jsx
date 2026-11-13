import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/useApp';
import { CVC_WORDS } from '../../data/englishCurriculum';
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

export default function CvcWordMatcher({ onHome }) {
  const { speak, playTap, playChime, playWiggle, awardStar } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState(() =>
    shuffleOptions(CVC_WORDS[0].options)
  );
  const [roundScore, setRoundScore] = useState(0);
  const [selectedCorrectOption, setSelectedCorrectOption] = useState(null);
  const [wigglingOption, setWigglingOption] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const advanceTimerRef = useRef(null);
  const wiggleTimerRef = useRef(null);

  const currentItem = CVC_WORDS[currentIndex % CVC_WORDS.length];

  const advanceQuestion = () => {
    const nextIndex = (currentIndex + 1) % CVC_WORDS.length;
    setCurrentIndex(nextIndex);
    setShuffledOptions(shuffleOptions(CVC_WORDS[nextIndex].options));
  };

  const askQuestion = useCallback(() => {
    speak(
      currentItem.targetWord.toLowerCase(),
      null,
      'Which word matches the picture?'
    );
  }, [currentItem, speak]);

  useEffect(() => {
    askQuestion();
  }, [askQuestion]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      if (wiggleTimerRef.current) clearTimeout(wiggleTimerRef.current);
    };
  }, []);

  const handleSelectOption = (option) => {
    // Prevent duplicate taps while evaluating correct answer
    if (isTransitioning) return;

    playTap();

    if (option === currentItem.targetWord) {
      // Correct selection
      setIsTransitioning(true);
      setSelectedCorrectOption(option);
      playChime();

      // Verbal and visual reinforcement
      const praiseSpoken = `Super job! ${currentItem.targetWord}! ${currentItem.targetWord} spells ${currentItem.label}!`;
      const praiseDisplay = `Super job! ⭐ ${currentItem.targetWord} is ${currentItem.label}!`;
      speak(praiseSpoken, null, praiseDisplay);

      const nextScore = roundScore + 1;
      setRoundScore(nextScore);

      if (nextScore >= 5) {
        advanceTimerRef.current = setTimeout(() => {
          awardStar('cvc_words');
          setShowCelebration(true);
          setSelectedCorrectOption(null);
          setIsTransitioning(false);
        }, 1100);
      } else {
        advanceTimerRef.current = setTimeout(() => {
          setSelectedCorrectOption(null);
          setIsTransitioning(false);
          advanceQuestion();
        }, 1200);
      }
    } else {
      // Gentle encouragement on incorrect selection
      playWiggle();
      setWigglingOption(option);

      const encouragementSpoken = `Good try! That word is ${option}. ${currentItem.hintText || currentItem.hint}`;
      const encouragementDisplay = `Good try! That's ${option}. ${currentItem.hintText || currentItem.hint}`;
      speak(encouragementSpoken, null, encouragementDisplay);

      if (wiggleTimerRef.current) clearTimeout(wiggleTimerRef.current);
      wiggleTimerRef.current = setTimeout(() => {
        setWigglingOption(null);
      }, 550);
    }
  };

  const handlePlayAgain = () => {
    setShowCelebration(false);
    setRoundScore(0);
    setSelectedCorrectOption(null);
    setIsTransitioning(false);
    advanceQuestion();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-2 flex flex-col items-center select-none">
      {/* Round Progress Indicator */}
      <div className="text-xs sm:text-sm font-bold text-slate-600 mb-2 bg-white/80 px-4 py-1.5 rounded-full border border-sky-200 shadow-xs">
        Round Progress: <span className="text-sky-700 font-black">{roundScore}/5</span> ⭐
      </div>

      {/* Target Word Picture Card */}
      <div className="w-full bg-white border-4 border-sky-300 rounded-3xl p-5 sm:p-6 shadow-md text-center mb-3">
        <div
          key={currentItem.id}
          className="text-7xl sm:text-8xl mb-2 animate-pop inline-block cursor-pointer"
          onClick={() => {
            playTap();
            askQuestion();
          }}
          title="Tap to hear the word again"
          role="img"
          aria-label="Picture clue"
        >
          {currentItem.illustration}
        </div>

        <div className="flex items-center justify-center gap-2">
          <p className="text-xl sm:text-2xl font-black text-sky-950">
            Which word matches the picture?
          </p>
          <button
            type="button"
            onClick={() => {
              playTap();
              askQuestion();
            }}
            aria-label="Listen to the word again"
            className="w-8 h-8 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-900 flex items-center justify-center text-sm border border-sky-300 active:scale-90 transition-transform cursor-pointer"
          >
            🔊
          </button>
        </div>
      </div>

      {/* Subtitle Banner with Repeat Button */}
      <SubtitleBanner onRepeat={askQuestion} />

      {/* Four word choices */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 w-full my-3">
        {shuffledOptions.map((option) => {
          const isCorrect = selectedCorrectOption === option;
          const isWiggling = wigglingOption === option;

          let buttonStyle = 'btn-tactile bg-sky-100 hover:bg-sky-200 text-sky-950 border-3 border-sky-400';
          if (isCorrect) {
            buttonStyle = 'bg-emerald-500 border-4 border-emerald-600 text-white ring-4 ring-emerald-300 shadow-lg scale-105 animate-pop';
          } else if (isWiggling) {
            buttonStyle = 'animate-wiggle bg-amber-100 border-3 border-amber-400 text-amber-950';
          }

          return (
            <button
              key={option}
              type="button"
              disabled={isTransitioning}
              onClick={() => handleSelectOption(option)}
              aria-label={`Word choice: ${option}`}
              className={`min-h-[72px] sm:min-h-[82px] rounded-3xl font-black text-3xl sm:text-4xl cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-sky-300 ${buttonStyle} ${isTransitioning && !isCorrect ? 'opacity-60 cursor-not-allowed' : ''
                }`}
            >
              <span>{option}</span>
              {isCorrect && <span className="text-2xl">⭐</span>}
            </button>
          );
        })}
      </div>

      {/* Celebration Modal */}
      <ConfettiModal
        isOpen={showCelebration}
        activityTitle="First Words Match"
        onPlayAgain={handlePlayAgain}
        onClose={onHome}
      />
    </div>
  );
}
