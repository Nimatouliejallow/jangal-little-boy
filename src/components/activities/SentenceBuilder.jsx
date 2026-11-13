import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/useApp';
import { SENTENCE_BUILDER_ITEMS } from '../../data/englishCurriculum';
import SubtitleBanner from '../common/SubtitleBanner';
import ConfettiModal from '../common/ConfettiModal';

export default function SentenceBuilder({ onHome }) {
  const { speak, playTap, playChime, playWiggle, awardStar } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = SENTENCE_BUILDER_ITEMS[currentIndex % SENTENCE_BUILDER_ITEMS.length];

  const [roundScore, setRoundScore] = useState(0);
  const [constructedWords, setConstructedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState(() => [...currentItem.scrambled]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const timerRef = useRef(null);

  const askQuestion = useCallback(() => {
    speak(currentItem.audioPrompt, null, `Build the sentence: "${currentItem.targetSentence}"`);
  }, [currentItem, speak]);

  useEffect(() => {
    askQuestion();
  }, [askQuestion]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handlePickWord = (word, idx) => {
    if (isSuccess) return;
    playTap();

    const nextConstructed = [...constructedWords, word];
    const nextAvailable = availableWords.filter((_, i) => i !== idx);

    setConstructedWords(nextConstructed);
    setAvailableWords(nextAvailable);

    // If all words placed, check sentence correctness
    if (nextConstructed.length === currentItem.words.length) {
      const sentenceText = nextConstructed.join(' ');
      if (sentenceText === currentItem.targetSentence) {
        setIsSuccess(true);
        playChime();

        const praise = `Wonderful reading! "${currentItem.targetSentence}"`;
        speak(praise, null, `Great job! ⭐ "${currentItem.targetSentence}"`);

        const nextScore = roundScore + 1;
        setRoundScore(nextScore);

        if (nextScore >= 5) {
          timerRef.current = setTimeout(() => {
            awardStar('sentence_builder');
            setShowCelebration(true);
          }, 1400);
        } else {
          timerRef.current = setTimeout(() => {
            setCurrentIndex((prev) => {
              const nextIdx = (prev + 1) % SENTENCE_BUILDER_ITEMS.length;
              const nextItem = SENTENCE_BUILDER_ITEMS[nextIdx];
              setAvailableWords([...nextItem.scrambled]);
              setConstructedWords([]);
              setIsSuccess(false);
              return nextIdx;
            });
          }, 1800);
        }
      } else {
        playWiggle();
        setIsWiggling(true);
        speak(`Almost! ${currentItem.hint}`, null, `Almost! ${currentItem.hint}`);
        timerRef.current = setTimeout(() => setIsWiggling(false), 550);
      }
    }
  };

  const handleReturnWord = (word, idx) => {
    if (isSuccess) return;
    playTap();

    const nextConstructed = constructedWords.filter((_, i) => i !== idx);
    const nextAvailable = [...availableWords, word];

    setConstructedWords(nextConstructed);
    setAvailableWords(nextAvailable);
  };

  const handleResetSentence = () => {
    playTap();
    setConstructedWords([]);
    setAvailableWords([...currentItem.scrambled]);
  };

  const handlePlayAgain = () => {
    setShowCelebration(false);
    setRoundScore(0);
    const nextIdx = (currentIndex + 1) % SENTENCE_BUILDER_ITEMS.length;
    const nextItem = SENTENCE_BUILDER_ITEMS[nextIdx];
    setCurrentIndex(nextIdx);
    setAvailableWords([...nextItem.scrambled]);
    setConstructedWords([]);
    setIsSuccess(false);
  };

  return (
  <div className="w-full max-w-2xl mx-auto px-4 py-2 flex flex-col items-center select-none">
    {/* Progress Tracker */}
    <div className="text-xs sm:text-sm font-bold text-slate-600 mb-2 bg-white/80 px-4 py-1.5 rounded-full border border-sky-200 shadow-xs">
      Sentences Built: <span className="text-sky-700 font-black">{roundScore}/5</span> ⭐
    </div>

    {/* Showcase Picture & Instructions */}
    <div className="w-full bg-white border-4 border-sky-300 rounded-3xl p-5 shadow-md text-center mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-5xl sm:text-6xl inline-block" role="img" aria-hidden="true">
          {currentItem.icon}
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

      <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
        Tap the words in order to build the sentence:
      </p>

      {/* Active Sentence Construction Bar */}
      <div
        className={`min-h-[70px] bg-sky-50/80 border-3 rounded-2xl p-3 my-3 flex flex-wrap items-center justify-center gap-2 transition-all ${isSuccess
          ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-200 animate-pop'
          : isWiggling
            ? 'border-amber-400 bg-amber-50 animate-wiggle'
            : 'border-sky-300'
          }`}
      >
        {constructedWords.length === 0 ? (
          <span className="text-slate-400 italic text-base">
            (Tap words below to place them here)
          </span>
        ) : (
          constructedWords.map((word, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleReturnWord(word, idx)}
              className="px-3.5 py-2 bg-white border-2 border-sky-400 text-sky-950 font-black text-lg sm:text-xl rounded-xl shadow-xs hover:bg-rose-50 hover:border-rose-300 active:scale-95 transition-all cursor-pointer"
              title="Tap to remove"
            >
              {word}
            </button>
          ))
        )}
      </div>

      {constructedWords.length > 0 && !isSuccess && (
        <button
          type="button"
          onClick={handleResetSentence}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
        >
          Clear and try again ↺
        </button>
      )}
    </div>

    {/* Subtitle Banner with Repeat Button */}
    <SubtitleBanner onRepeat={askQuestion} />

    {/* Word Pool Buttons */}
    <div className="w-full my-3">
      <p className="text-xs font-bold text-slate-600 mb-2 text-center uppercase tracking-wider">
        Available Words:
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
        {availableWords.map((word, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePickWord(word, idx)}
            className="btn-tactile min-h-[64px] px-5 py-3 rounded-2xl bg-white hover:bg-sky-100 text-sky-950 font-black text-xl sm:text-2xl border-3 border-sky-300 cursor-pointer active:scale-95 transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-sky-300"
          >
            {word}
          </button>
        ))}
      </div>
    </div>

    {/* Celebration Modal */}
    <ConfettiModal
      isOpen={showCelebration}
      activityTitle="Sentence Builder"
      onPlayAgain={handlePlayAgain}
      onClose={onHome}
    />
  </div>
);
}
