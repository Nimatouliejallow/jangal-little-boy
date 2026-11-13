import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/useApp';
import { SHAPE_COLOUR_ROUNDS, COLOURS } from '../../data/mathCurriculum';
import SubtitleBanner from '../common/SubtitleBanner';
import ConfettiModal from '../common/ConfettiModal';

// Helper component rendering crisp, scalable geometric SVG shapes
function ShapeIcon({ shape, colorHex, className = 'w-18 h-18 sm:w-22 sm:h-22' }) {
  switch (shape) {
    case 'circle':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <circle cx="50" cy="50" r="42" fill={colorHex} stroke="#1e293b" strokeWidth="4" />
        </svg>
      );
    case 'square':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <rect x="12" y="12" width="76" height="76" rx="8" fill={colorHex} stroke="#1e293b" strokeWidth="4" />
        </svg>
      );
    case 'rectangle':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <rect x="8" y="24" width="84" height="52" rx="8" fill={colorHex} stroke="#1e293b" strokeWidth="4" />
        </svg>
      );
    case 'triangle':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <polygon
            points="50,10 90,88 10,88"
            fill={colorHex}
            stroke="#1e293b"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'oval':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <ellipse cx="50" cy="50" rx="44" ry="28" fill={colorHex} stroke="#1e293b" strokeWidth="4" />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <polygon
            points="50,8 62,38 95,38 68,58 78,90 50,70 22,90 32,58 5,38 38,38"
            fill={colorHex}
            stroke="#1e293b"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

export default function ShapeColorPicker({ onHome }) {
  const { speak, playTap, playChime, playWiggle, awardStar } = useApp();
  const [roundIdx, setRoundIdx] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [selectedCorrectIdx, setSelectedCorrectIdx] = useState(null);
  const [wigglingIdx, setWigglingIdx] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const advanceTimerRef = useRef(null);
  const wiggleTimerRef = useRef(null);

  const currentRound = SHAPE_COLOUR_ROUNDS[roundIdx % SHAPE_COLOUR_ROUNDS.length];

  // Prompt question when round changes
  const askQuestion = useCallback(() => {
    speak(
      currentRound.audioPrompt,
      null,
      currentRound.displayPrompt || currentRound.audioPrompt
    );
  }, [currentRound, speak]);

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

  const getColorHex = (colorId) => {
    const found = COLOURS.find((c) => c.id === colorId);
    return found ? found.hex : '#3b82f6';
  };

  const handleSelect = (option, idx) => {
    if (isTransitioning) return;

    playTap();
    const isCorrect =
      option.shape === currentRound.target.shape && option.color === currentRound.target.color;

    if (isCorrect) {
      setIsTransitioning(true);
      setSelectedCorrectIdx(idx);
      playChime();

      const praiseSpoken = `Awesome! That is the ${currentRound.target.colorName} ${currentRound.target.shapeName}!`;
      const praiseDisplay = `Awesome! ⭐ You found the ${currentRound.target.colorName} ${currentRound.target.shapeName}!`;
      speak(praiseSpoken, null, praiseDisplay);

      const nextScore = roundScore + 1;
      setRoundScore(nextScore);

      if (nextScore >= 5) {
        advanceTimerRef.current = setTimeout(() => {
          awardStar('shapes_colours');
          setShowCelebration(true);
          setSelectedCorrectIdx(null);
          setIsTransitioning(false);
        }, 1100);
      } else {
        advanceTimerRef.current = setTimeout(() => {
          setSelectedCorrectIdx(null);
          setIsTransitioning(false);
          setRoundIdx((prev) => (prev + 1) % SHAPE_COLOUR_ROUNDS.length);
        }, 1200);
      }
    } else {
      playWiggle();
      setWigglingIdx(idx);

      const encouragementSpoken = `Good try! That is the ${option.color} ${option.shape}. Can you find the ${currentRound.target.colorName} ${currentRound.target.shapeName}?`;
      const encouragementDisplay = `Good try! That's the ${option.color} ${option.shape}. Look for the ${currentRound.target.colorName} ${currentRound.target.shapeName}!`;
      speak(encouragementSpoken, null, encouragementDisplay);

      if (wiggleTimerRef.current) clearTimeout(wiggleTimerRef.current);
      wiggleTimerRef.current = setTimeout(() => {
        setWigglingIdx(null);
      }, 550);
    }
  };

  const handlePlayAgain = () => {
    setShowCelebration(false);
    setRoundScore(0);
    setSelectedCorrectIdx(null);
    setIsTransitioning(false);
    setRoundIdx((prev) => (prev + 1) % SHAPE_COLOUR_ROUNDS.length);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-2 flex flex-col items-center select-none">
      {/* Round Progress Tracker */}
      <div className="text-xs sm:text-sm font-bold text-slate-600 mb-2 bg-white/80 px-4 py-1.5 rounded-full border border-teal-200 shadow-xs">
        Round Progress: <span className="text-teal-700 font-black">{roundScore}/5</span> ⭐
      </div>

      {/* Target Clue Card */}
      <div className="w-full bg-white border-4 border-teal-300 rounded-3xl p-5 shadow-md text-center mb-3 flex flex-col items-center">
        <div className="flex items-center justify-center gap-2">
          <p className="text-xl sm:text-2xl font-black text-slate-700">
            Find the:
          </p>
          <button
            type="button"
            onClick={() => {
              playTap();
              askQuestion();
            }}
            aria-label="Repeat audio prompt"
            className="w-8 h-8 rounded-full bg-teal-50 hover:bg-teal-200 text-teal-900 flex items-center justify-center text-sm border border-teal-300 active:scale-90 transition-transform cursor-pointer"
          >
            🔊
          </button>
        </div>

        <span className="text-2xl sm:text-3xl font-black text-teal-800 mt-1">
          {currentRound.target.colorName} {currentRound.target.shapeName}
        </span>
      </div>

      {/* Subtitle Banner with Repeat Button */}
      <SubtitleBanner onRepeat={askQuestion} />

      {/* 3 Option Tiles (Large touch targets: min 110px - 130px) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 w-full my-3">
        {currentRound.options.map((option, idx) => {
          const isCorrect = selectedCorrectIdx === idx;
          const isWiggling = wigglingIdx === idx;
          const hex = getColorHex(option.color);

          let tileStyle =
            'btn-tactile bg-white hover:bg-teal-50/50 border-3 border-slate-300 hover:border-teal-400';
          if (isCorrect) {
            tileStyle =
              'bg-emerald-50 border-4 border-emerald-500 ring-4 ring-emerald-300 shadow-lg scale-105 animate-pop';
          } else if (isWiggling) {
            tileStyle = 'animate-wiggle border-amber-400 bg-amber-50';
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isTransitioning}
              onClick={() => handleSelect(option, idx)}
              aria-label={`${option.color} ${option.shape}`}
              className={`relative min-h-[110px] sm:min-h-[130px] rounded-3xl cursor-pointer active:scale-95 transition-all flex flex-col items-center justify-center p-4 focus:outline-none focus:ring-4 focus:ring-teal-300 shadow-md ${tileStyle} ${
                isTransitioning && !isCorrect ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <ShapeIcon shape={option.shape} colorHex={hex} />

              {/* Star Badge on Correct Selection */}
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
        activityTitle="Shapes & Colours"
        onPlayAgain={handlePlayAgain}
        onClose={onHome}
      />
    </div>
  );
}
