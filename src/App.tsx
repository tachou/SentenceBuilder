import { useGameStore } from './store/gameStore';
import { LanguageSelection } from './components/LanguageSelection';
import { SentenceBuilder } from './components/SentenceBuilder';

function App() {
  const language = useGameStore((s) => s.language);
  const highContrast = useGameStore((s) => s.highContrast);

  return (
    <div className={highContrast ? 'high-contrast' : ''}>
      {!language ? <LanguageSelection /> : <SentenceBuilder />}
    </div>
  );
}

export default App;
