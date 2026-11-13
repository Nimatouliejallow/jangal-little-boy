import { useState, useEffect } from 'react';
import { useApp } from '../../context/useApp';

export default function SubjectHubView({ onSelectActivity }) {
  const { profile, progress, speak, playTap } = useApp();
  const [selectedLevel, setSelectedLevel] = useState('level1'); // 'level1' | 'level2' | 'level3' | 'all'
  const [selectedSubject, setSelectedSubject] = useState('all'); // 'all' | 'english' | 'math'

  useEffect(() => {
    speak(
      `Hi ${profile.nickname || 'Little Explorer'}! Welcome to your learning adventure. Tap an activity to begin!`
    );
  }, [profile.nickname, speak]);

  const handlePick = (activityId, title, promptText) => {
    playTap();
    speak(promptText);
    onSelectActivity(activityId);
  };

  const isCompleted = (id) => progress.completedActivityIds.includes(id);

  const activities = [
    // Level 1: Early Foundation (Ages 3–5)
    {
      id: 'phonics',
      subject: 'english',
      level: 'level1',
      levelName: 'Level 1: Ages 3–5',
      title: 'Alphabet & Phonics',
      icon: '🅰️',
      tag: 'Phonics A–Z',
      desc: 'Explore letters Aa–Zz with sounds and example words.',
      prompt: "Let's explore the Alphabet and Phonics sounds! Tap any letter to hear its sound.",
      cardBg: 'from-sky-400 to-sky-500 text-sky-950 border-sky-600',
    },
    {
      id: 'cvc_words',
      subject: 'english',
      level: 'level1',
      levelName: 'Level 1: Ages 3–5',
      title: 'First Words Match',
      icon: '🐱',
      tag: 'CVC Phonics',
      desc: 'Match pictures with 3-letter decodable words.',
      prompt: "Let's match words and pictures! Find the word that matches the picture.",
      cardBg: 'from-blue-300 to-blue-400 text-blue-950 border-blue-500',
    },
    {
      id: 'counting',
      subject: 'math',
      level: 'level1',
      levelName: 'Level 1: Ages 3–5',
      title: 'Counting 1 to 10',
      icon: '⭐',
      tag: 'Numbers 1–10',
      desc: 'Tap concrete objects one by one to count.',
      prompt: "Let's count together! Tap each item to count.",
      cardBg: 'from-emerald-400 to-emerald-500 text-emerald-950 border-emerald-600',
    },
    {
      id: 'shapes_colours',
      subject: 'math',
      level: 'level1',
      levelName: 'Level 1: Ages 3–5',
      title: 'Shapes & Colours',
      icon: '🎨',
      tag: '6 Shapes & 5 Colours',
      desc: 'Identify Circle, Square, Triangle, Rectangle, Oval, Star.',
      prompt: "Can you find the right shape and colour? Let's play!",
      cardBg: 'from-teal-300 to-teal-400 text-teal-950 border-teal-500',
    },
    {
      id: 'comparisons',
      subject: 'math',
      level: 'level1',
      levelName: 'Level 1: Ages 3–5',
      title: 'Number Comparison',
      icon: '⚖️',
      tag: 'More, Fewer & Equal',
      desc: 'Compare visual groups to see which has more or fewer.',
      prompt: "Let's compare number groups! Which group has more?",
      cardBg: 'from-amber-300 to-amber-400 text-amber-950 border-amber-500',
    },

    // Level 2: Developing Foundation (Ages 5–7)
    {
      id: 'vocabulary',
      subject: 'english',
      level: 'level2',
      levelName: 'Level 2: Ages 5–7',
      title: 'Thematic Vocabulary',
      icon: '🐘',
      tag: 'Animals, Food & Nature',
      desc: 'Discover words and pictures across rich themes.',
      prompt: "Let's expand our vocabulary! Match words with their pictures.",
      cardBg: 'from-indigo-300 to-indigo-400 text-indigo-950 border-indigo-500',
    },
    {
      id: 'spelling',
      subject: 'english',
      level: 'level2',
      levelName: 'Level 2: Ages 5–7',
      title: 'Spelling Builder',
      icon: '✏️',
      tag: 'Missing Letters',
      desc: 'Fill in missing letters to complete familiar words.',
      prompt: "Can you spell the words? Find the missing letter!",
      cardBg: 'from-amber-400 to-amber-500 text-amber-950 border-amber-600',
    },
    {
      id: 'sentence_builder',
      subject: 'english',
      level: 'level2',
      levelName: 'Level 2: Ages 5–7',
      title: 'Sentence Builder',
      icon: '🧩',
      tag: 'Word Arrangement',
      desc: 'Arrange scrambled words to build complete sentences.',
      prompt: "Let's build sentences! Put the words in the right order.",
      cardBg: 'from-sky-300 to-blue-400 text-sky-950 border-sky-500',
    },
    {
      id: 'math_operations',
      subject: 'math',
      level: 'level2',
      levelName: 'Level 2: Ages 5–7',
      title: 'Addition & Subtraction',
      icon: '➕',
      tag: 'Visual Math',
      desc: 'Combine and take away objects to solve number sentences.',
      prompt: "Let's do addition and subtraction together!",
      cardBg: 'from-emerald-400 to-green-500 text-emerald-950 border-emerald-600',
    },
    {
      id: 'multiplication',
      subject: 'math',
      level: 'level2',
      levelName: 'Level 2: Ages 5–7',
      title: 'Equal Groups & Multiplication',
      icon: '✖️',
      tag: 'Repeated Addition',
      desc: 'Understand multiplication through equal groups of items.',
      prompt: "Let's discover equal groups and multiplication!",
      cardBg: 'from-orange-300 to-amber-400 text-orange-950 border-orange-500',
    },

    // Level 3: Expanding Knowledge (Ages 7–10)
    {
      id: 'grammar',
      subject: 'english',
      level: 'level3',
      levelName: 'Level 3: Ages 7–10',
      title: 'Grammar Detective',
      icon: '🔍',
      tag: 'Nouns, Verbs & Adjectives',
      desc: 'Identify naming words, action words, and describing words.',
      prompt: "Let's explore grammar! Find nouns, verbs, and adjectives.",
      cardBg: 'from-purple-300 to-purple-400 text-purple-950 border-purple-500',
    },
    {
      id: 'reading_comprehension',
      subject: 'english',
      level: 'level3',
      levelName: 'Level 3: Ages 7–10',
      title: 'Story Comprehension',
      icon: '📖',
      tag: 'Short Stories',
      desc: 'Read or listen to illustrated stories and answer fun questions.',
      prompt: "Let's read a story together and answer questions!",
      cardBg: 'from-rose-300 to-pink-400 text-rose-950 border-rose-500',
    },
    {
      id: 'division',
      subject: 'math',
      level: 'level3',
      levelName: 'Level 3: Ages 7–10',
      title: 'Fair Sharing & Division',
      icon: '➗',
      tag: 'Equal Sharing',
      desc: 'Share items fairly into equal groups.',
      prompt: "Let's share items equally to understand division!",
      cardBg: 'from-cyan-300 to-sky-400 text-cyan-950 border-cyan-500',
    },
    {
      id: 'fractions',
      subject: 'math',
      level: 'level3',
      levelName: 'Level 3: Ages 7–10',
      title: 'Fractions Explorer',
      icon: '🍕',
      tag: 'Halves & Quarters',
      desc: 'Explore halves, quarters, and equal parts of shapes.',
      prompt: "Let's explore fractions and equal parts of shapes!",
      cardBg: 'from-teal-400 to-emerald-500 text-teal-950 border-teal-600',
    },
    {
      id: 'math_reasoning',
      subject: 'math',
      level: 'level3',
      levelName: 'Level 3: Ages 7–10',
      title: 'Math Reasoning & Puzzles',
      icon: '💡',
      tag: 'Patterns & Logic',
      desc: 'Solve fun pattern sequences, word problems, and logic riddles.',
      prompt: "Put on your thinking cap! Let's solve math puzzles.",
      cardBg: 'from-yellow-300 to-amber-400 text-amber-950 border-amber-500',
    },
  ];

  // Filter activities based on selected Level and Subject
  const filteredActivities = activities.filter((act) => {
    const levelMatch = selectedLevel === 'all' || act.level === selectedLevel;
    const subjectMatch = selectedSubject === 'all' || act.subject === selectedSubject;
    return levelMatch && subjectMatch;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-3 flex flex-col items-center select-none">
      {/* Welcome Header */}
      <div className="text-center mb-4">
        <h1 className="text-3xl sm:text-4xl font-black text-amber-950 mb-1">
          Welcome, {profile.nickname || 'Explorer'}! ⭐
        </h1>
        <p className="text-base sm:text-lg text-slate-700 font-semibold">
          Choose your learning adventure:
        </p>
      </div>

      {/* Level Selection Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-3 bg-white/90 p-1.5 rounded-2xl border-2 border-amber-300 shadow-xs">
        <button
          type="button"
          onClick={() => {
            playTap();
            setSelectedLevel('level1');
          }}
          className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm cursor-pointer transition-all ${
            selectedLevel === 'level1'
              ? 'bg-amber-400 text-amber-950 shadow-xs'
              : 'text-slate-600 hover:bg-amber-100'
          }`}
        >
          ⭐ Level 1 (Ages 3–5)
        </button>

        <button
          type="button"
          onClick={() => {
            playTap();
            setSelectedLevel('level2');
          }}
          className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm cursor-pointer transition-all ${
            selectedLevel === 'level2'
              ? 'bg-amber-400 text-amber-950 shadow-xs'
              : 'text-slate-600 hover:bg-amber-100'
          }`}
        >
          🚀 Level 2 (Ages 5–7)
        </button>

        <button
          type="button"
          onClick={() => {
            playTap();
            setSelectedLevel('level3');
          }}
          className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm cursor-pointer transition-all ${
            selectedLevel === 'level3'
              ? 'bg-amber-400 text-amber-950 shadow-xs'
              : 'text-slate-600 hover:bg-amber-100'
          }`}
        >
          💡 Level 3 (Ages 7–10)
        </button>

        <button
          type="button"
          onClick={() => {
            playTap();
            setSelectedLevel('all');
          }}
          className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm cursor-pointer transition-all ${
            selectedLevel === 'all'
              ? 'bg-amber-400 text-amber-950 shadow-xs'
              : 'text-slate-600 hover:bg-amber-100'
          }`}
        >
          🌟 All Levels
        </button>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-2 mb-5">
        <button
          type="button"
          onClick={() => {
            playTap();
            setSelectedSubject('all');
          }}
          className={`px-3 py-1 rounded-full font-bold text-xs cursor-pointer border ${
            selectedSubject === 'all'
              ? 'bg-slate-800 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          All Subjects
        </button>

        <button
          type="button"
          onClick={() => {
            playTap();
            setSelectedSubject('english');
          }}
          className={`px-3 py-1 rounded-full font-bold text-xs cursor-pointer border flex items-center gap-1 ${
            selectedSubject === 'english'
              ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
              : 'bg-white text-sky-800 border-sky-200 hover:bg-sky-50'
          }`}
        >
          <span>🔤</span>
          <span>English World</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playTap();
            setSelectedSubject('math');
          }}
          className={`px-3 py-1 rounded-full font-bold text-xs cursor-pointer border flex items-center gap-1 ${
            selectedSubject === 'math'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
              : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <span>🔢</span>
          <span>Math World</span>
        </button>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {filteredActivities.map((act) => {
          const completed = isCompleted(act.id);
          return (
            <div
              key={act.id}
              onClick={() => handlePick(act.id, act.title, act.prompt)}
              className="group bg-white border-3 border-amber-200 hover:border-amber-400 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between active:scale-98"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-4xl p-2 bg-amber-50 rounded-2xl border border-amber-200 group-hover:scale-110 transition-transform">
                    {act.icon}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        act.subject === 'english'
                          ? 'bg-sky-100 text-sky-900 border-sky-200'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                      }`}
                    >
                      {act.subject === 'english' ? 'English' : 'Math'}
                    </span>
                    {completed && <span className="text-lg">⭐</span>}
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-amber-800 transition-colors">
                  {act.title}
                </h3>

                <p className="text-xs font-semibold text-slate-500 mb-2">
                  {act.tag}
                </p>

                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                  {act.desc}
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePick(act.id, act.title, act.prompt);
                }}
                className={`btn-tactile w-full py-2.5 px-4 bg-gradient-to-r ${act.cardBg} font-black text-base rounded-2xl flex items-center justify-between border-2 cursor-pointer active:scale-95 transition-all shadow-xs`}
              >
                <span>Play Adventure</span>
                <span>{completed ? '🌟' : '➡️'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
