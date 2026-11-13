import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/useApp';
import { PHONICS_ALPHABET } from '../../data/englishCurriculum';
import SubtitleBanner from '../common/SubtitleBanner';
import ConfettiModal from '../common/ConfettiModal';

export default function PhonicsBoard({ onHome }) {
  const { speak, playTap, awardStar, cancelSpeech } = useApp();
  const [selectedLetter, setSelectedLetter] = useState(PHONICS_ALPHABET[0]);
  const [animatingLetter, setAnimatingLetter] = useState(null);
  const [exploredCount, setExploredCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const animationTimerRef = useRef(null);
  const sequenceTimerRef = useRef(null);
  const activeLetterRef = useRef(null);

  // Cleans up any running speech and sequence timers
  const stopLetterAudio = useCallback(() => {
    if (sequenceTimerRef.current) {
      clearTimeout(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    }
    cancelSpeech();
  }, [cancelSpeech]);

  // 3-Stage Phonics Audio Experience with natural breathing space:
  // Stage 1: "This is the letter [Letter]."
  // (650ms pause)
  // Stage 2: "[Letter] makes the sound, [phonicsSpoken]."
  // (650ms pause)
  // Stage 3: "[phonicsSpoken], as in [exampleWord]. [Letter] is for [exampleWord]."
  const playLetterAudio = useCallback(
    (item) => {
      stopLetterAudio();
      activeLetterRef.current = item.letter;

      const sound = item.phonicsSpoken || item.phonicsSound;

      // Stage 1: Letter Identification
      const stage1Text = `This is the letter ${item.letter}.`;
      const stage1Subtitle = `This is the letter ${item.letter}.`;

      // Stage 2: Letter Sound
      const stage2Text = `${item.letter} makes the sound, ${sound}.`;
      const stage2Subtitle = `${item.letter} makes the sound, ${item.phonicsSound}.`;

      // Stage 3: Example Word & Association Sentence
      const stage3Text = item.letter === 'X'
        ? `${sound}, as in ${item.exampleWord.toLowerCase()}. X is in ${item.exampleWord}.`
        : `${sound}, as in ${item.exampleWord.toLowerCase()}. ${item.letter} is for ${item.exampleWord}.`;
      const stage3Subtitle = `${item.letter}${item.lowercase} • ${item.phonicsSound} • ${item.exampleWord} ${item.icon}`;

      const runStage3 = () => {
        if (activeLetterRef.current !== item.letter) return;
        speak(stage3Text, null, stage3Subtitle);
      };

      const runStage2 = () => {
        if (activeLetterRef.current !== item.letter) return;
        let stage3Triggered = false;
        const triggerStage3 = () => {
          if (stage3Triggered || activeLetterRef.current !== item.letter) return;
          stage3Triggered = true;
          sequenceTimerRef.current = setTimeout(runStage3, 650);
        };

        speak(stage2Text, triggerStage3, stage2Subtitle);
        sequenceTimerRef.current = setTimeout(triggerStage3, 2800);
      };

      let stage2Triggered = false;
      const triggerStage2 = () => {
        if (stage2Triggered || activeLetterRef.current !== item.letter) return;
        stage2Triggered = true;
        sequenceTimerRef.current = setTimeout(runStage2, 650);
      };

      speak(stage1Text, triggerStage2, stage1Subtitle);
      sequenceTimerRef.current = setTimeout(triggerStage2, 2800);
    },
    [speak, stopLetterAudio]
  );

  // Independent Interaction Handlers
  const handlePlayLetterName = (item) => {
    playTap();
    stopLetterAudio();
    speak(`This is the letter ${item.letter}.`, null, `Letter ${item.letter} (${item.letter}${item.lowercase})`);
  };

  const handlePlayPhonemeOnly = (item) => {
    playTap();
    stopLetterAudio();
    const sound = item.phonicsSpoken || item.phonicsSound;
    speak(
      `${item.letter} makes the sound, ${sound}! ${sound}!`,
      null,
      `Phonics sound: "${item.phonicsSound}"`
    );
  };

  const handlePlayWordOnly = (item) => {
    playTap();
    stopLetterAudio();
    speak(`${item.exampleWord}.`, null, `${item.exampleWord} ${item.icon}`);
  };

  const handlePlaySentenceOnly = (item) => {
    playTap();
    stopLetterAudio();
    const sentence = item.letter === 'X'
      ? 'X is in box.'
      : `${item.letter} is for ${item.exampleWord.toLowerCase()}.`;
    speak(sentence, null, `${item.letter} is for ${item.exampleWord} ${item.icon}`);
  };

  // Initial welcome on mounting
  useEffect(() => {
    speak(
      'Welcome to Alphabet and Phonics! Tap any letter to hear its sound.',
      null,
      'Tap any letter to hear its sound! 🔤'
    );
  }, [speak]);

  // Cleanup animation and audio sequence timer on unmount
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
      stopLetterAudio();
    };
  }, [stopLetterAudio]);

  const handleCardClick = (item) => {
    playTap();
    setSelectedLetter(item);
    setAnimatingLetter(item.letter);

    if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    animationTimerRef.current = setTimeout(() => {
      setAnimatingLetter(null);
    }, 450);

    playLetterAudio(item);

    const newCount = exploredCount + 1;
    setExploredCount(newCount);

    // Award a star after exploring 5 letters
    if (newCount === 5) {
      awardStar('phonics');
      setShowCelebration(true);
    }
  };

  const handlePlayAgain = () => {
    setShowCelebration(false);
    setExploredCount(0);
  };

  return (
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-2 flex flex-col items-center select-none">
        {/* Active Card Showcase */}
        <div className="w-full max-w-md bg-white border-4 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-md text-center mb-3 transition-all">
          {/* Example Word Illustration */}
          <div
            key={selectedLetter.letter}
            className="text-6xl sm:text-7xl mb-1 animate-bounce cursor-pointer inline-block active:scale-95 transition-transform"
            onClick={() => handlePlayWordOnly(selectedLetter)}
            title="Tap to hear example word"
          >
            {selectedLetter.icon}
          </div>

          {/* Uppercase and Lowercase Displayed Together (Interactive button) */}
          <button
            type="button"
            onClick={() => handlePlayLetterName(selectedLetter)}
            title="Tap to hear letter name"
            className="flex items-baseline justify-center gap-2 mb-1 mx-auto px-4 py-0.5 rounded-2xl hover:bg-amber-50 active:scale-95 transition-all cursor-pointer group"
          >
            <span className="text-5xl sm:text-6xl font-black text-amber-600 group-hover:scale-105 transition-transform">
              {selectedLetter.letter}
            </span>
            <span className="text-4xl sm:text-5xl font-extrabold text-slate-500">
              {selectedLetter.lowercase}
            </span>
            <span className="text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-md font-bold ml-1">
              Letter
            </span>
          </button>

          {/* Example Word (Interactive button) */}
          <button
            type="button"
            onClick={() => handlePlayWordOnly(selectedLetter)}
            title="Tap to hear word"
            className="text-2xl sm:text-3xl font-black text-slate-800 hover:text-amber-700 active:scale-95 transition-all cursor-pointer px-3 py-0.5 rounded-xl hover:bg-amber-50"
          >
            {selectedLetter.exampleWord}
          </button>

          {/* Phonics Sound Badge & Action Controls */}
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handlePlayPhonemeOnly(selectedLetter)}
              title="Tap to hear phonics sound"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold rounded-full text-sm sm:text-base border border-amber-300 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <span>Phonics Sound: &ldquo;{selectedLetter.phonicsSound}&rdquo;</span>
              <span className="text-xs">🔊</span>
            </button>

            <button
              type="button"
              onClick={() => handlePlaySentenceOnly(selectedLetter)}
              title="Tap to hear sentence"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold rounded-full text-xs sm:text-sm border border-sky-300 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <span>{selectedLetter.letter} is for {selectedLetter.exampleWord}</span>
              <span className="text-xs">💬</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTap();
                playLetterAudio(selectedLetter);
              }}
              aria-label={`Replay audio for ${selectedLetter.letter}`}
              className="w-9 h-9 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 flex items-center justify-center text-sm border border-emerald-300 active:scale-90 transition-transform cursor-pointer shadow-xs"
              title="Replay audio"
            >
              🔁
            </button>
          </div>
        </div>

            {/* Subtitle Banner with Repeat Button */}
            <SubtitleBanner onRepeat={() => playLetterAudio(selectedLetter)} />

            {/* Progress Counter Towards Next Star */}
              <div className="text-xs sm:text-sm font-bold text-slate-600 mb-3 bg-white/80 px-4 py-1.5 rounded-full border border-amber-200 shadow-xs">
                Letters Explored in this Round: <span className="text-amber-600 font-black">{exploredCount % 5}/5</span> ⭐
              </div>

                {/* A–Z Letter Grid: Large child-friendly touch targets with Aa, Bb format */}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-9 gap-2 sm:gap-2.5 w-full max-w-3xl mb-6">
                  {PHONICS_ALPHABET.map((item) => {
                    const isSelected = selectedLetter.letter === item.letter;
                    const isAnimating = animatingLetter === item.letter;

                    return (
                      <button
                        key={item.letter}
                        type="button"
                        onClick={() => handleCardClick(item)}
                        aria-pressed={isSelected}
                        className={`min-h-[64px] min-w-[64px] sm:min-h-[72px] sm:min-w-[72px] rounded-2xl flex flex-col items-center justify-center p-1.5 sm:p-2 border-2 cursor-pointer active:scale-90 transition-all focus:outline-none focus:ring-4 focus:ring-amber-300 ${isSelected
                            ? 'bg-amber-400 border-amber-600 text-amber-950 scale-105 shadow-md ring-4 ring-amber-300'
                            : 'bg-white hover:bg-amber-50 border-amber-200 text-slate-800 shadow-xs'
              } ${ isAnimating? 'animate-pop scale-110 ring-4 ring-amber-400': '' }`}
            >
              {/* Display uppercase and lowercase together (Aa, Bb, Cc) */}
              <span className="flex items-baseline leading-none font-black text-lg sm:text-xl">
                <span>{item.letter}</span>
                <span className="text-sm sm:text-base font-bold opacity-75">{item.lowercase}</span>
              </span>
              <span className="text-lg sm:text-xl mt-0.5 leading-none" role="img" aria-hidden="true">
                {item.icon}
              </span>
            </button>
          );
        })}
      </div>

      {/* Celebration Modal */}
      <ConfettiModal
        isOpen={showCelebration}
        activityTitle="Alphabet & Phonics"
        onPlayAgain={handlePlayAgain}
        onClose={onHome}
      />
    </div>
  );
}
