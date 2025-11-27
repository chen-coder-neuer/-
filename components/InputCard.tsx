import React, { useState, useEffect } from 'react';
import { GameState, DiceValue } from '../types';
import { DiceIcon } from './DiceIcon';

interface InputCardProps {
  title: string;
  isActive: boolean;
  isHidden: boolean;
  onActivate: () => void;
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  onCalculate: () => void;
}

// Component for numbers with blur-in animation on change
const AnimatedNumber = ({ value }: { value: string | number }) => (
  <span key={value} className="animate-blur-pop inline-block">
    {value}
  </span>
);

export const InputCard: React.FC<InputCardProps> = ({ 
  title, 
  isActive, 
  isHidden, 
  onActivate, 
  state, 
  setState,
  onCalculate
}) => {
  // We no longer return null on isHidden to allow for the "Dimmed" state visual.
  // Instead, we control visibility via CSS classes.

  // Determine if this is the "Analyzer" (Previous Bidder) card
  const isAnalyzer = title.includes("上家");

  // Local state to track which dice are currently rolling
  const [rollingDice, setRollingDice] = useState<Record<number, boolean>>({});

  // State for Dice Fan Animation (Scatter effect)
  const [isFanned, setIsFanned] = useState(false);

  useEffect(() => {
    if (isActive) {
      // Delay slightly to match the card expansion animation
      const timer = setTimeout(() => setIsFanned(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsFanned(false);
    }
  }, [isActive]);

  const updateHand = (index: number, value: DiceValue) => {
    const newHand = [...state.myHand];
    newHand[index] = value;
    setState(prev => ({ ...prev, myHand: newHand }));
  };

  const cycleDice = (index: number) => {
    // Prevent double clicking while rolling
    if (rollingDice[index]) return;

    // 1. Start Animation
    setRollingDice(prev => ({ ...prev, [index]: true }));

    // 2. Change Value halfway through the animation (when it's blurriest/mid-spin)
    setTimeout(() => {
      const current = state.myHand[index];
      const next = current === 6 ? 1 : (current + 1) as DiceValue;
      updateHand(index, next);
    }, 250); // 250ms is half of the 500ms animation

    // 3. End Animation
    setTimeout(() => {
      setRollingDice(prev => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
    }, 500);
  };

  const handleDiceCountChange = (delta: number) => {
    const newCount = Math.min(10, Math.max(1, state.dicePerPlayer + delta));
    if (newCount === state.dicePerPlayer) return;

    let newHand = [...state.myHand];
    if (newCount > newHand.length) {
      // Add dice (default 1)
      for(let i = newHand.length; i < newCount; i++) newHand.push(1);
    } else {
      // Remove dice
      newHand = newHand.slice(0, newCount);
    }
    setState(s => ({ ...s, dicePerPlayer: newCount, myHand: newHand }));
  };

  // 3D Embossed Button Style
  const controlBtnClass = "w-9 h-9 rounded-lg font-bold text-[#D4AF37] flex items-center justify-center transition-all duration-75 bg-gradient-to-b from-[#1a4d3a] to-[#0d261d] border-t border-white/20 border-b-4 border-[#020d0a] shadow-[0_4px_6px_rgba(0,0,0,0.4)] hover:brightness-110 active:border-b-0 active:translate-y-1 active:shadow-none active:bg-[#0d261d]";

  // Style for recessed slots (Input displays)
  const recessedSlotClass = "bg-gradient-to-b from-[#020d0a] to-[#0a261f] rounded-lg border-t border-l border-black/80 border-b border-r border-white/5 shadow-[inset_2px_2px_8px_rgba(0,0,0,0.9)] p-2 flex items-center";

  // Style for grouped panels
  const panelClass = "bg-[#082920] rounded-xl border-t border-white/5 border-b border-black/50 shadow-[0_8px_20px_rgba(0,0,0,0.4)] p-4 relative overflow-hidden";
  const decorativeCorner = (pos: string) => <div className={`absolute ${pos} w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8a6e1e] shadow-[1px_1px_2px_rgba(0,0,0,0.8)]`} />;

  // Logic to render dice in a "Fan" shape
  const renderHandFan = () => {
    const count = state.myHand.length;
    const centerIndex = (count - 1) / 2;
    const baseSize = 56; // Larger dice for better visibility
    const spacing = 40; // Horizontal spacing

    return (
      <div className="relative h-36 w-full flex justify-center items-end overflow-visible mt-2 mb-2 perspective-[600px]">
        {state.myHand.map((val, idx) => {
          // Calculate Fan Geometry
          const offsetFromCenter = idx - centerIndex;
          
          // Rotation: Fanning out from a pivot point below
          const rotateDeg = offsetFromCenter * 8; 
          
          // Translation: Spread horizontally, arch vertically
          const translateX = offsetFromCenter * spacing;
          const translateY = Math.abs(offsetFromCenter) * 12; // Middle is higher
          
          const isRolling = rollingDice[idx];

          // Scatter Animation Logic
          // If not fanned, bunch them at the bottom center
          const finalTransform = isFanned 
            ? `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotateDeg}deg)` 
            : `translateX(0px) translateY(100px) rotate(0deg) scale(0.5)`;
          
          const finalOpacity = isFanned ? 1 : 0;

          return (
            <div
              key={idx}
              className="absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer group"
              style={{
                transform: finalTransform,
                opacity: finalOpacity,
                zIndex: 10 + idx, 
                bottom: '20px',
                transformOrigin: '50% 120%', // Pivot point below the die
                transitionDelay: `${idx * 30}ms` // Stagger effect
              }}
            >
              <div className={`transform transition-transform duration-150 ${!isRolling ? 'group-hover:-translate-y-6 group-hover:scale-110' : ''} group-active:scale-90 group-active:translate-y-0`}>
                <DiceIcon 
                  value={val} 
                  size={baseSize} 
                  onClick={() => cycleDice(idx)} 
                  style={{
                    filter: 'drop-shadow(0px 8px 12px rgba(0,0,0,0.6))',
                    transform: 'translateZ(0)' // Hardware acceleration
                  }}
                  className={`${!isRolling ? 'group-hover:ring-2' : ''} ${isRolling ? 'animate-dice-roll' : ''} ring-[#D4AF37] ring-offset-2 ring-offset-black/50`}
                />
                {/* Number Badge (optional for clarity) */}
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-black/80 text-[#D4AF37] text-sm font-bold rounded-full flex items-center justify-center border border-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg">
                  {val}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Main Container Styles based on State
  let containerStyleClass = "";
  if (isActive) {
    // Hero Mode
    containerStyleClass = "scale-105 opacity-100 z-20 border-[3px] border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.2),0_20px_40px_rgba(0,0,0,0.6)] bg-[#051a14]";
  } else if (isHidden) {
    // Dimmed / Background Mode (The "other" card)
    containerStyleClass = "scale-90 opacity-60 z-0 border border-white/10 grayscale-[0.5] blur-[0.5px] hover:opacity-80 hover:grayscale-0 hover:blur-0 cursor-pointer bg-[#051a14]/80";
  } else {
    // Neutral Mode (Start Screen)
    containerStyleClass = "scale-100 opacity-90 z-10 border border-[#D4AF37]/50 shadow-xl cursor-pointer hover:border-[#D4AF37] hover:scale-[1.02] bg-[#051a14]";
  }

  return (
    <div 
      onClick={!isActive ? onActivate : undefined}
      className={`
        relative w-full max-w-md transition-all duration-700 cubic-bezier(0.25, 0.8, 0.25, 1) rounded-2xl overflow-hidden flex flex-col
        ${containerStyleClass}
        ${!isActive ? 'h-32 justify-center' : ''}
      `}
    >
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-[#0f3d2e] opacity-50 pointer-events-none z-0 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] opacity-30 pointer-events-none z-0"></div>

      {/* Header */}
      <div className={`relative z-10 text-center transition-all duration-500 ${!isActive ? 'p-0' : 'pt-6 pb-2'}`}>
        <h2 className={`font-serif text-gold font-bold transition-all duration-500 ${isActive ? 'text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-xl'}`}>
          {title}
        </h2>
        {!isActive && <p className="text-emerald-200/60 text-xs mt-2 uppercase tracking-widest animate-pulse">Tap to activate</p>}
      </div>

      {/* Form Content - only rendered fully if active to save resources, but we could render it hidden if needed */}
      {isActive && (
        <div className="relative z-10 p-5 space-y-6 animate-blur-pop">
          
          {/* Row 1: Player Settings */}
          <div className={`${panelClass} grid grid-cols-2 gap-4`}>
            {decorativeCorner('top-2 left-2')}
            {decorativeCorner('top-2 right-2')}
            {decorativeCorner('bottom-2 left-2')}
            {decorativeCorner('bottom-2 right-2')}

            {/* Total Players */}
            <div className="space-y-1 relative z-10">
              <label className="text-[10px] text-[#D4AF37]/70 uppercase tracking-wider font-semibold ml-1 drop-shadow-md">总人数</label>
              <div className={`${recessedSlotClass} space-x-2`}>
                <button 
                  onClick={() => setState(s => ({ ...s, totalPlayers: Math.max(2, s.totalPlayers - 1) }))}
                  className={controlBtnClass}
                >-</button>
                <span className="flex-1 text-center text-white font-mono text-xl tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                  <AnimatedNumber value={state.totalPlayers} />
                </span>
                <button 
                  onClick={() => setState(s => ({ ...s, totalPlayers: Math.min(20, s.totalPlayers + 1) }))}
                  className={controlBtnClass}
                >+</button>
              </div>
            </div>

            {/* Dice Per Player */}
            <div className="space-y-1 relative z-10">
              <label className="text-[10px] text-[#D4AF37]/70 uppercase tracking-wider font-semibold ml-1 drop-shadow-md">单人骰子数</label>
              <div className={`${recessedSlotClass} space-x-2`}>
                <button 
                  onClick={() => handleDiceCountChange(-1)}
                  className={controlBtnClass}
                >-</button>
                <span className="flex-1 text-center text-white font-mono text-xl tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                   <AnimatedNumber value={state.dicePerPlayer} />
                </span>
                <button 
                  onClick={() => handleDiceCountChange(1)}
                  className={controlBtnClass}
                >+</button>
              </div>
            </div>
          </div>

          {/* Row 2: My Hand (Fan Layout) */}
          <div className={`${panelClass} !p-0 bg-[#082920]/80`}>
             <div className="bg-[#051510]/60 p-2 border-b border-white/5 flex justify-between items-center backdrop-blur-sm relative z-10 shadow-md">
                <label className="text-[10px] text-[#D4AF37]/70 uppercase tracking-wider font-semibold ml-2">我的手牌</label>
                <span className="text-[9px] text-emerald-500/80 italic mr-2 tracking-wide">点击骰子切换</span>
             </div>
             <div className="relative">
                 {/* Stage Light Effect */}
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.1),transparent_70%)] pointer-events-none"></div>
                 {renderHandFan()}
             </div>
          </div>

          {/* Row 3: Bid Info */}
          <div className={panelClass}>
            {decorativeCorner('top-2 left-2')}
            {decorativeCorner('top-2 right-2')}
            
            <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] text-[#D4AF37]/70 uppercase tracking-wider font-semibold ml-1 drop-shadow-md">
                {title.includes("上家") ? "上家叫牌" : "场面计算"}
                </label>
            </div>

            <div className={`${recessedSlotClass} flex-col gap-0 !p-0 overflow-hidden`}>
               
               {/* Bid Controls */}
               <div className="flex items-center gap-4 p-3 w-full bg-[#051a14]/30">
                  {/* Quantity */}
                  <div className="flex flex-col items-center flex-1 border-r border-white/5 pr-2">
                    <span className="text-[9px] text-emerald-200/40 mb-1 tracking-wider uppercase">数量 (个)</span>
                    <div className="flex items-center w-full justify-between px-1">
                        <button 
                          onClick={() => setState(s => ({ ...s, bidQuantity: Math.max(1, s.bidQuantity - 1) }))}
                          className={`${controlBtnClass} w-8 h-8 rounded-md`}
                        >
                          <svg width="10" height="2" viewBox="0 0 12 2" fill="none"><rect width="12" height="2" rx="1" fill="currentColor"/></svg>
                        </button>
                        <span className="text-2xl font-serif text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                           <AnimatedNumber value={state.bidQuantity} />
                        </span>
                        <button 
                          onClick={() => setState(s => ({ ...s, bidQuantity: s.bidQuantity + 1 }))}
                          className={`${controlBtnClass} w-8 h-8 rounded-md`}
                        >
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M5 0H7V5H12V7H7V12H5V7H0V5H5V0Z" fill="currentColor"/></svg>
                        </button>
                    </div>
                  </div>
                  

                  {/* Face */}
                  <div className="flex flex-col items-center flex-1 pl-2">
                    <span className="text-[9px] text-emerald-200/40 mb-1 tracking-wider uppercase">点数</span>
                    <div className="relative group">
                      <div className="transition-transform duration-100 group-active:scale-90 group-active:rotate-3 drop-shadow-2xl">
                         <DiceIcon value={state.bidFace} size={42} selected goldTint />
                      </div>
                      <select 
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          value={state.bidFace}
                          onChange={(e) => setState(s => ({ ...s, bidFace: parseInt(e.target.value) as DiceValue }))}
                      >
                        {[1,2,3,4,5,6].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>
               </div>

               {/* Toggles: Pure and Fly */}
               <div className="flex items-center gap-3 py-2 px-3 w-full bg-[#08201a]/50 border-t border-black/40">
                 
                 {/* Pure Toggle */}
                 <div 
                    className="flex-1 flex items-center justify-between cursor-pointer group px-1"
                    onClick={() => setState(s => ({ ...s, isPure: !s.isPure }))}
                 >
                    <span className="text-[11px] text-[#D4AF37]/60 font-medium group-hover:text-[#D4AF37] transition-colors">斋 (Pure)</span>
                    <button 
                      className={`
                        relative w-10 h-6 rounded-full transition-all duration-200 focus:outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border-b border-white/10
                        ${state.isPure ? 'bg-[#D4AF37]' : 'bg-[#051510] border border-white/10'}
                      `}
                    >
                      <div className={`
                        absolute left-0.5 top-0.5 w-5 h-5 bg-gradient-to-br from-white to-gray-300 rounded-full transition-transform duration-200 shadow-md
                        ${state.isPure ? 'translate-x-4' : 'translate-x-0'}
                      `} />
                    </button>
                 </div>

                 {/* Fly Toggle (Only for Analyzer) */}
                 {isAnalyzer && (
                   <>
                     <div className="w-[1px] h-4 bg-white/10"></div>
                     <div 
                        className="flex-1 flex items-center justify-between cursor-pointer group px-1"
                        onClick={() => setState(s => ({ ...s, isFly: !s.isFly }))}
                     >
                        <span className="text-[11px] text-[#D4AF37]/60 font-medium group-hover:text-[#D4AF37] transition-colors">飞 (Fly)</span>
                        <button 
                          className={`
                            relative w-10 h-6 rounded-full transition-all duration-200 focus:outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border-b border-white/10
                            ${state.isFly ? 'bg-sky-600' : 'bg-[#051510] border border-white/10'}
                          `}
                        >
                          <div className={`
                            absolute left-0.5 top-0.5 w-5 h-5 bg-gradient-to-br from-white to-gray-300 rounded-full transition-transform duration-200 shadow-md
                            ${state.isFly ? 'translate-x-4' : 'translate-x-0'}
                          `} />
                        </button>
                     </div>
                   </>
                 )}

               </div>

            </div>
          </div>
          
          <button 
            onClick={onCalculate}
            className="w-full py-4 mt-6 bg-gradient-to-b from-[#F2D06B] to-[#B38B38] rounded-xl text-black font-bold text-lg shadow-[0_6px_0_#6d5218,0_10px_20px_rgba(0,0,0,0.4)] border-t border-white/40 uppercase tracking-widest hover:brightness-110 active:shadow-none active:translate-y-[6px] active:border-t-0 transition-all duration-100 relative overflow-hidden group"
          >
             <span className="relative z-10 drop-shadow-sm flex items-center justify-center gap-2">
               <span>开始计算</span>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
             </span>
             {/* Continuous Shimmer Effect */}
             <div className="absolute inset-0 z-0">
               <div className="absolute top-0 bottom-0 left-[-100%] w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg] animate-shimmer"></div>
             </div>
          </button>
        </div>
      )}
    </div>
  );
};