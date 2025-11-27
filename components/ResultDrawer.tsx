import React from 'react';
import { ProbabilityResult, AppMode } from '../types';
import { AnalogGauge } from './AnalogGauge';

interface ResultDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  result: ProbabilityResult | null;
  mode: AppMode;
}

export const ResultDrawer: React.FC<ResultDrawerProps> = ({ isOpen, onClose, result, mode }) => {
  if (!result) return null;

  // Helper to split the advice string into Action and Reason
  const parseAdvice = (advice: string) => {
    if (!advice) return null;
    const parts = advice.split('：');
    if (parts.length < 2) return { action: advice, reason: '' };
    
    // "开！" or "不要开" is usually at the start of the second part
    const content = parts[1];
    const parenIndex = content.indexOf('(');
    
    if (parenIndex > -1) {
        return {
            action: content.substring(0, parenIndex).trim(),
            reason: content.substring(parenIndex)
        };
    }
    return { action: content, reason: '' };
  };

  const adviceData = mode === 'analyzer' && result.advice ? parseAdvice(result.advice) : null;
  const isRiskyToOpen = adviceData?.action.includes('不要'); // Safe to not open
  const shouldOpen = adviceData?.action.includes('开') && !isRiskyToOpen;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-md z-40 transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-[#0a261f] z-50 rounded-t-[2.5rem] border-t-2 border-[#D4AF37] shadow-[0_-10px_60px_rgba(0,0,0,0.8)] transform transition-transform duration-500 cubic-bezier(0.23, 1, 0.32, 1) ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="w-16 h-1.5 bg-[#1a4d3a]/50 rounded-full mx-auto mt-5 mb-3" />
        
        <div className="p-6 pb-12 space-y-8">
          <div className="text-center">
            <h3 className="text-[#D4AF37] font-serif text-3xl mb-1 tracking-wider drop-shadow-md">概率分析结果</h3>
            <p className="text-emerald-200/40 text-[10px] uppercase tracking-[0.3em] font-medium">Strategic Analysis</p>
          </div>

          <div className="bg-gradient-to-b from-[#051a14] to-black/40 rounded-3xl p-6 border border-[#D4AF37]/20 shadow-[inset_0_2px_10px_rgba(0,0,0,0.4)]">
            <AnalogGauge value={result.probability} label="存在概率" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
             <div className="bg-black/30 p-4 rounded-2xl border border-white/5 backdrop-blur-sm shadow-lg">
                <div className="text-3xl font-bold text-white font-serif">{result.k_me}</div>
                <div className="text-[10px] text-emerald-200/60 uppercase tracking-widest mt-1">我方贡献</div>
             </div>
             <div className="bg-black/30 p-4 rounded-2xl border border-white/5 backdrop-blur-sm shadow-lg">
                <div className="text-3xl font-bold text-white font-serif">{result.k_needed}</div>
                <div className="text-[10px] text-emerald-200/60 uppercase tracking-widest mt-1">仍需数量</div>
             </div>
          </div>

          <div className="text-center space-y-5">
             {/* Risk Badge */}
             <div className="inline-flex items-center px-5 py-2 rounded-full bg-[#1a4d3a]/40 text-[#D4AF37] text-sm font-bold border border-[#D4AF37]/30 shadow-lg uppercase tracking-wider backdrop-blur-md">
               <span className={`w-2 h-2 rounded-full mr-3 ${result.probability > 50 ? 'bg-[#D4AF37]' : 'bg-red-500'} animate-pulse shadow-[0_0_8px_currentColor]`}></span>
               {result.riskAssessment}
             </div>
             
             {/* Recommendation Card */}
             {adviceData && (
               <div className={`
                 relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-500 shadow-2xl
                 ${shouldOpen 
                   ? 'bg-gradient-to-br from-red-950/90 via-red-900/40 to-black border-red-500/40 shadow-red-900/20' 
                   : 'bg-gradient-to-br from-emerald-950/90 via-emerald-900/40 to-black border-emerald-500/40 shadow-emerald-900/20'}
               `}>
                 {/* Background Pattern */}
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                 
                 <div className="relative z-10 flex flex-col items-center">
                    <div className="text-[10px] text-[#D4AF37]/80 uppercase tracking-[0.4em] mb-3 font-serif border-b border-[#D4AF37]/20 pb-1">Dealer's Verdict</div>
                    
                    <div className={`text-4xl font-serif font-black mb-3 tracking-wide text-center leading-tight
                        ${shouldOpen ? 'text-red-400 drop-shadow-[0_2px_15px_rgba(248,113,113,0.4)]' : 'text-emerald-400 drop-shadow-[0_2px_15px_rgba(52,211,153,0.4)]'}
                    `}>
                        {adviceData.action}
                    </div>
                    
                    {adviceData.reason && (
                        <div className="text-white/80 font-light text-sm italic border-t border-white/10 pt-3 mt-1 px-4 text-center leading-relaxed">
                            "{adviceData.reason}"
                        </div>
                    )}
                 </div>
               </div>
             )}
          </div>
          
          <button 
             onClick={onClose}
             className="w-full py-4 bg-white/5 text-emerald-100/40 hover:bg-white/10 hover:text-white rounded-xl text-xs transition-colors uppercase tracking-[0.2em] font-medium"
          >
            Dismiss Analysis
          </button>
        </div>
      </div>
    </>
  );
};