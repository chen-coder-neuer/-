import React, { useState } from 'react';
import { GameState, AppMode, ProbabilityResult } from './types';
import { InputCard } from './components/InputCard';
import { ResultDrawer } from './components/ResultDrawer';
import { calculateLiarProbability } from './utils/probability';

const INITIAL_STATE: GameState = {
  totalPlayers: 4,
  dicePerPlayer: 5,
  myHand: [1, 2, 3, 4, 5],
  bidQuantity: 3,
  bidFace: 6,
  isPure: false,
  isFly: false
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(null);
  
  // State for Calculator Feature (Feature 1)
  const [calcState, setCalcState] = useState<GameState>({...INITIAL_STATE});
  
  // State for Analyzer Feature (Feature 2)
  const [analyzerState, setAnalyzerState] = useState<GameState>({...INITIAL_STATE});

  const [result, setResult] = useState<ProbabilityResult | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleActivate = (newMode: AppMode) => {
    setMode(newMode);
    setIsDrawerOpen(false);
  };

  const handleCalculate = () => {
    if (!mode) return;
    
    const activeState = mode === 'calculator' ? calcState : analyzerState;
    const res = calculateLiarProbability(activeState, mode === 'analyzer');
    
    setResult(res);
    setIsDrawerOpen(true);
  };

  const handleReset = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setMode(null), 300);
  };

  return (
    <div className="min-h-screen felt-bg text-white overflow-hidden flex flex-col items-center relative">
      
      {/* Top Bar */}
      <div className="w-full p-6 flex justify-between items-center z-10">
        <h1 className="text-[#D4AF37] font-serif text-lg tracking-widest border-b border-[#D4AF37] pb-1">ROYAL LIAR'S DICE</h1>
        {mode && (
          <button 
            onClick={handleReset}
            className="text-emerald-200/50 hover:text-white text-sm uppercase tracking-wider"
          >
            Reset
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 w-full max-w-lg flex flex-col items-center justify-center relative p-4 transition-all duration-500 ${mode ? 'gap-0' : 'gap-6'}`}>
        
        {/* Card 1: Calculator */}
        <InputCard 
          title="计算当前概率"
          isActive={mode === 'calculator'}
          isHidden={mode === 'analyzer'}
          onActivate={() => handleActivate('calculator')}
          state={calcState}
          setState={setCalcState}
          onCalculate={handleCalculate}
        />

        {/* Card 2: Analyzer */}
        <InputCard 
          title="判断上家叫牌"
          isActive={mode === 'analyzer'}
          isHidden={mode === 'calculator'}
          onActivate={() => handleActivate('analyzer')}
          state={analyzerState}
          setState={setAnalyzerState}
          onCalculate={handleCalculate}
        />
        
      </div>

      {/* Decorative Bottom */}
      <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      
      {/* Result Drawer */}
      <ResultDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        result={result}
        mode={mode}
      />

    </div>
  );
};

export default App;