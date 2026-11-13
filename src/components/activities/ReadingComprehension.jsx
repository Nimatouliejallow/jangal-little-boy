import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/useApp';
import { READING_STORIES } from '../../data/englishCurriculum';
import SubtitleBanner from '../common/SubtitleBanner';
import ConfettiModal from '../common/ConfettiModal';

export default function ReadingComprehension({ onHome }) {
  const { speak, playTap, playChime, playWiggle, awardStar } = useApp();
  const [storyIndex, setStoryIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [wigglingOption, setWigglingOption] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const timerRef = useRef(null);

  const currentStory = READING_STORIES[storyIndex % READING_STORIES.length];
  const currentQuestion = currentStory.questions[questionIndex % currentStory.questions.length];

  const askQuestion = useCallback(() => {
    speak(
      `${currentQuestion.question}`,
      null,
      `Story Question: ${currentQuestion.question}`
    );
  }, [currentQuestion, speak]);

  const readEntireStory = () => {
    playTap();
    speak(
      `${currentStory.title}. ${currentStory.passage}`,
      null,
      `Reading Story: ${currentStory.title}`
    );
  };

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

    if (option === currentQuestion.correct) {
      setIsTransitioning(true);
      setSelectedOption(option);
      playChime();

      const spokenPraise = `Correct! ${currentQuestion.explanation}`;
      const displayPraise = `Great job! ⭐ ${currentQuestion.explanation}`;
      speak(spokenPraise, null, displayPraise);

      const nextScore = roundScore + 1;
      setRoundScore(nextScore);

      if (nextScore >= 5) {
        timerRef.current = setTimeout(() => {
          awardStar('reading_comprehension');
          setShowCelebration(true);
          setSelectedOption(null);
          setIsTransitioning(false);
        }, 1200);
      } else {
        timerRef.current = setTimeout(() => {
          setSelectedOption(null);
          setIsTransitioning(false);

          // Advance to next question in story, or next story if questions finished
          if (questionIndex + 1 < currentStory.questions.length) {
            setQuestionIndex((prev) => prev + 1);
          } else {
            setQuestionIndex(0);
            setStoryIndex((prev) => (prev + 1) % READING_STORIES.length);
          }
        }, 1600);
      }
    } else {
      playWiggle();
      setWigglingOption(option);

      const encouragement = `Good try! Look back at the story: ${currentQuestion.question}`;
      speak(encouragement, null, encouragement);

      timerRef.current = setTimeout(() => setWigglingOption(null), 550);
    }
  };

  const handlePlayAgain = () => {
    setShowCelebration(false);
    setRoundScore(0);
    setSelectedOption(null);
    setIsTransitioning(false);
    setQuestionIndex(0);
    setStoryIndex((prev) => (prev + 1) % READING_STORIES.length);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-2 flex flex-col items-center select-none">
      {/* Progress Tracker */}
      <div className="text-xs sm:text-sm font-bold text-slate-600 mb-2 bg-white/80 px-4 py-1.5 rounded-full border border-indigo-200 shadow-xs">
        Questions Answered: <span className="text-indigo-700 font-black">{roundScore}/5</span> ⭐
      </div>

      {/* Story Passage Card */}
      <div className="w-full bg-white border-4 border-indigo-300 rounded-3xl p-5 sm:p-6 shadow-md mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl sm:text-4xl" role="img" aria-hidden="true">
              {currentStory.icon}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-indigo-950">
              {currentStory.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={readEntireStory}
            aria-label="Listen to whole story"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 rounded-2xl font-extrabold text-xs sm:text-sm border border-indigo-300 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <span>🔊</span>
            <span>Listen</span>
          </button>
        </div>

        <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mb-3">
          {currentStory.passage}
        </p>

        {/* Current Question */}
        <div className="border-t-2 border-indigo-100 pt-3">
          <div className="flex items-center justify-between">
            <p className="text-lg sm:text-xl font-black text-indigo-950">
              ❓ {currentQuestion.question}
            </p>
            <button
              type="button"
              onClick={() => {
                playTap();
                askQuestion();
              }}
              aria-label="Repeat question"
              className="w-8 h-8 rounded-full bg-indigo-50 hover:bg-indigo-200 text-indigo-900 flex items-center justify-center text-xs border border-indigo-300 active:scale-90 transition-transform cursor-pointer"
            >
              🔊
            </button>
          </div>
        </div>
      </div>

      {/* Subtitle Banner with Repeat Button */}
      <SubtitleBanner onRepeat={askQuestion} />

      {/* 3 Answer Choice Buttons */}
      <div className="grid grid-cols-1 gap-2.5 sm:gap-3 w-full my-3">
        {currentQuestion.options.map((option) => {
          const isCorrect = selectedOption === option;
          const isWiggling = wigglingOption === option;

          let btnStyle =
            'btn-tactile bg-white hover:bg-indigo-50 text-slate-900 border-3 border-indigo-200 hover:border-indigo-400';
          if (isCorrect) {
            btnStyle =
              'bg-emerald-500 border-4 border-emerald-600 text-white ring-4 ring-emerald-300 shadow-lg scale-102 animate-pop';
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
              className={`min-h-[64px] sm:min-h-[72px] px-5 py-3 rounded-2xl font-black text-xl sm:text-2xl cursor-pointer active:scale-95 transition-all flex items-center justify-between focus:outline-none focus:ring-4 focus:ring-indigo-300 shadow-md ${btnStyle} ${
                isTransitioning && !isCorrect ? 'opacity-60 cursor-not-allowed' : ''
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
        activityTitle="Story Reading Comprehension"
        onPlayAgain={handlePlayAgain}
        onClose={onHome}
      />
    </div>
  );
}

