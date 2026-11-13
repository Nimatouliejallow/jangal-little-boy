import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/useApp';
import { COUNTING_SETS } from '../../data/mathCurriculum';
import SubtitleBanner from '../common/SubtitleBanner';
import ConfettiModal from '../common/ConfettiModal';

const NUMBER_WORDS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

export default function CountingBoard({ onHome }) {
  const { speak, playTap, playChime, awardStar } = useApp();
  const [roundIndex, setRoundIndex] = useState(0);
  const [completedRounds, setCompletedRounds] = useState(0);
  const [tappedIndices, setTappedIndices] = useState([]);
  const [isRoundDone, setIsRoundDone] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const transitionTimerRef = useRef(null);

  const currentSet = COUNTING_SETS[roundIndex % COUNTING_SETS.length];

  // Speak initial instruction whenever round changes
  const askPrompt = useCallback(() => {
    speak(currentSet.audioPrompt, null, currentSet.displayPrompt || currentSet.audioPrompt);
  }, [currentSet, speak]);

  useEffect(() => {
    askPrompt();
  }, [askPrompt]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  const advanceToNextRound = () => {
    setTappedIndices([]);
    setIsRoundDone(false);
    setRoundIndex((prev) => (prev + 1) % COUNTING_SETS.length);
  };

  const handleTapItem = (idx) => {
    if (tappedIndices.includes(idx) || isRoundDone) return;

    playTap();
    playChime();

    const nextTapped = [...tappedIndices, idx];
    setTappedIndices(nextTapped);

    const countSoFar = nextTapped.length;
    const word = NUMBER_WORDS[countSoFar - 1] || `${countSoFar}`;
    const isFinalCount = countSoFar === currentSet.count;

    if (!isFinalCount) {
      // Speak and display current count sequentially
      speak(`${word}!`, null, `${word}! (${countSoFar})`);
    } else {
      setIsRoundDone(true);

      const countWord = NUMBER_WORDS[currentSet.count - 1]?.toLowerCase() || `${currentSet.count}`;
      const objectLabel = currentSet.count === 1
        ? (currentSet.singular || currentSet.name.toLowerCase())
        : (currentSet.plural || currentSet.name.toLowerCase());
      const finalSentence = `You counted ${countWord} ${objectLabel}!`;
      const celebrationDisplay = `You counted ${countWord} ${objectLabel}! 🌟`;

      let hasAnnouncedFinal = false;
      const announceFinal = () => {
        if (hasAnnouncedFinal) return;
        hasAnnouncedFinal = true;

        speak(finalSentence, null, celebrationDisplay);

        const nextCompleted = completedRounds + 1;
        setCompletedRounds(nextCompleted);

        if (nextCompleted >= 5) {
          transitionTimerRef.current = setTimeout(() => {
            awardStar('counting');
            setShowCelebration(true);
          }, 2000);
        } else {
          transitionTimerRef.current = setTimeout(() => {
            advanceToNextRound();
          }, 2600);
        }
      };

      // 1. Speak the final number first ("Two!")
      // 2. Once the number is announced, speak the full confirmation sentence
      speak(
        `${word}!`,
        () => {
          transitionTimerRef.current = setTimeout(announceFinal, 300);
        },
        `${word}! (${countSoFar})`
      );

      // Safe fallback timer in case Web Speech onEnd is delayed or dropped
      transitionTimerRef.current = setTimeout(announceFinal, 1800);
    }
  };

  const handlePlayAgain = () => {
    setShowCelebration(false);
    setCompletedRounds(0);
    advanceToNextRound();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-2 flex flex-col items-center select-none">
      {/* Round Progress Tracker */}
      <div className="text-xs sm:text-sm font-bold text-slate-600 mb-2 bg-white/80 px-4 py-1.5 rounded-full border border-emerald-200 shadow-xs">
        Counting Round: <span className="text-emerald-700 font-black">{completedRounds}/5</span> ⭐
      </div>

      {/* Target & Live Count Showcase Card */}
      <div className="w-full bg-white border-4 border-emerald-300 rounded-3xl p-4 sm:p-5 shadow-md text-center mb-3">
        <div className="flex items-center justify-between px-2 sm:px-4">
          <div className="text-left">
            <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
              Count the items
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-800">
              {currentSet.count} {currentSet.name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Count Counter */}
            <div className="flex items-center gap-1.5 bg-emerald-100 border-2 border-emerald-400 px-3.5 py-1.5 rounded-2xl">
              <span className="text-3xl sm:text-4xl font-black text-emerald-800 animate-pop">
                {tappedIndices.length}
              </span>
              <span className="text-slate-400 font-bold text-lg">/</span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-600">
                {currentSet.count}
              </span>
            </div>

            {/* Repeat Prompt Button */}
            <button
              type="button"
              onClick={() => {
                playTap();
                askPrompt();
              }}
              aria-label="Repeat audio prompt"
              className="w-10 h-10 rounded-2xl bg-emerald-50 hover:bg-emerald-200 text-emerald-900 flex items-center justify-center text-lg border border-emerald-300 active:scale-90 transition-transform cursor-pointer"
            >
              🔊
            </button>
          </div>
        </div>
      </div>

      {/* Subtitle Banner with Repeat Button */}
      <SubtitleBanner onRepeat={askPrompt} />

      {/* Interactive Tap-to-Count Canvas */}
      <div className="w-full bg-amber-50/90 border-3 border-amber-300 rounded-3xl p-6 sm:p-8 min-h-[240px] flex items-center justify-center my-3 shadow-inner">
        <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-5 max-w-lg">
          {Array.from({ length: currentSet.count }).map((_, idx) => {
            const isTapped = tappedIndices.includes(idx);
            const tappedOrder = tappedIndices.indexOf(idx) + 1;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleTapItem(idx)}
                aria-label={`Item ${idx + 1} of ${currentSet.count} ${currentSet.name}${isTapped ? ' (counted)' : ''}`}
                className={`relative w-18 h-18 sm:w-22 sm:h-22 rounded-3xl text-4xl sm:text-5xl flex items-center justify-center transition-all cursor-pointer active:scale-90 border-3 focus:outline-none focus:ring-4 focus:ring-emerald-300 ${
                  isTapped
                    ? 'bg-emerald-400 border-emerald-600 scale-105 shadow-md ring-4 ring-emerald-200 animate-pop'
                    : 'bg-white hover:bg-emerald-50 border-amber-200 shadow-md'
                }`}
              >
                <span>{currentSet.icon}</span>

                {/* Sequential Number Order Badge */}
                {isTapped && (
                  <span className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-emerald-700 text-white rounded-full text-xs sm:text-sm font-black flex items-center justify-center shadow-md border-2 border-white animate-pop">
                    {tappedOrder}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Round Success Banner */}
      {isRoundDone && (
        <div className="w-full bg-emerald-100 border-3 border-emerald-400 text-emerald-950 font-black px-6 py-3 rounded-2xl animate-pop text-center text-lg sm:text-xl shadow-xs flex items-center justify-center gap-2">
          <span>🌟</span>
          <span>You counted all {currentSet.count} {currentSet.name}!</span>
        </div>
      )}

      {/* Celebration Modal */}
      <ConfettiModal
        isOpen={showCelebration}
        activityTitle="Counting 1 to 10"
        onPlayAgain={handlePlayAgain}
        onClose={onHome}
      />
    </div>
  );
}
