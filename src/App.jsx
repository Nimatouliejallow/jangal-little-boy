import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp';
import Header from './components/layout/Header';
import WelcomeView from './components/views/WelcomeView';
import SubjectHubView from './components/views/SubjectHubView';
import CaregiverView from './components/views/CaregiverView';

// English Modules
import PhonicsBoard from './components/activities/PhonicsBoard';
import CvcWordMatcher from './components/activities/CvcWordMatcher';
import VocabularyExplorer from './components/activities/VocabularyExplorer';
import SpellingBuilder from './components/activities/SpellingBuilder';
import SentenceBuilder from './components/activities/SentenceBuilder';
import GrammarExplorer from './components/activities/GrammarExplorer';
import ReadingComprehension from './components/activities/ReadingComprehension';

// Mathematics Modules
import CountingBoard from './components/activities/CountingBoard';
import ShapeColorPicker from './components/activities/ShapeColorPicker';
import NumberComparison from './components/activities/NumberComparison';
import MathOperations from './components/activities/MathOperations';
import MultiplicationGroups from './components/activities/MultiplicationGroups';
import DivisionSharing from './components/activities/DivisionSharing';
import FractionsExplorer from './components/activities/FractionsExplorer';
import MathReasoning from './components/activities/MathReasoning';

function MainAppContent() {
  const { profile } = useApp();
  const [currentView, setCurrentView] = useState(() => {
    return profile.hasCompletedWelcome ? 'hub' : 'welcome';
  });

  const handleStartLearning = () => {
    setCurrentView('hub');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'welcome':
        return <WelcomeView onStart={handleStartLearning} />;
      case 'hub':
        return <SubjectHubView onSelectActivity={(id) => setCurrentView(id)} />;

      // English Modules
      case 'phonics':
        return <PhonicsBoard onHome={() => setCurrentView('hub')} />;
      case 'cvc_words':
        return <CvcWordMatcher onHome={() => setCurrentView('hub')} />;
      case 'vocabulary':
        return <VocabularyExplorer onHome={() => setCurrentView('hub')} />;
      case 'spelling':
        return <SpellingBuilder onHome={() => setCurrentView('hub')} />;
      case 'sentence_builder':
        return <SentenceBuilder onHome={() => setCurrentView('hub')} />;
      case 'grammar':
        return <GrammarExplorer onHome={() => setCurrentView('hub')} />;
      case 'reading_comprehension':
        return <ReadingComprehension onHome={() => setCurrentView('hub')} />;

      // Mathematics Modules
      case 'counting':
        return <CountingBoard onHome={() => setCurrentView('hub')} />;
      case 'shapes_colours':
        return <ShapeColorPicker onHome={() => setCurrentView('hub')} />;
      case 'comparisons':
        return <NumberComparison onHome={() => setCurrentView('hub')} />;
      case 'addition':
      case 'subtraction':
      case 'math_operations':
        return <MathOperations onHome={() => setCurrentView('hub')} />;
      case 'multiplication':
        return <MultiplicationGroups onHome={() => setCurrentView('hub')} />;
      case 'division':
        return <DivisionSharing onHome={() => setCurrentView('hub')} />;
      case 'fractions':
        return <FractionsExplorer onHome={() => setCurrentView('hub')} />;
      case 'math_reasoning':
        return <MathReasoning onHome={() => setCurrentView('hub')} />;

      // Caregiver Dashboard
      case 'caregiver':
        return <CaregiverView onBack={() => setCurrentView('hub')} />;

      default:
        return <SubjectHubView onSelectActivity={(id) => setCurrentView(id)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/40 to-yellow-50 text-slate-900 flex flex-col">
      {/* Top Header Navigation (shown on all screens except onboarding) */}
      {currentView !== 'welcome' && (
        <Header currentView={currentView} onNavigate={(view) => setCurrentView(view)} />
      )}

      {/* Main Learning Canvas */}
      <main className="flex-1 flex flex-col justify-center items-center py-2">
        {renderCurrentView()}
      </main>

      {/* Footer Branding & Cultural Note */}
      <footer className="w-full text-center py-3 text-xs text-amber-900/60 font-semibold select-none">
        Jangal Little Boy • Foundational Learning for Young Explorers • Wolof: <span className="italic">Jàngal (To Educate)</span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
