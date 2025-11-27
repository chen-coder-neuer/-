import React from 'react';
import { DiceValue } from '../types';

interface DiceIconProps {
  value: DiceValue;
  size?: number;
  selected?: boolean;
  onClick?: () => void;
  goldTint?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const DiceIcon: React.FC<DiceIconProps> = ({ 
  value, 
  size = 48, 
  selected, 
  onClick, 
  goldTint,
  style,
  className = ""
}) => {
  // Dot configurations
  const dots: Record<number, number[][]> = {
    1: [[50, 50]],
    2: [[20, 20], [80, 80]],
    3: [[20, 20], [50, 50], [80, 80]],
    4: [[20, 20], [20, 80], [80, 20], [80, 80]],
    5: [[20, 20], [20, 80], [50, 50], [80, 20], [80, 80]],
    6: [[20, 20], [20, 50], [20, 80], [80, 20], [80, 50], [80, 80]],
  };

  const isOne = value === 1;
  const dotColor = isOne && !goldTint ? "#DC2626" : "#1F2937"; // Red for 1, Dark Gray for others
  const baseColor = selected ? "#FFFBEB" : "#F3F4F6";
  const shadowColor = selected ? "rgba(212, 175, 55, 0.6)" : "rgba(0,0,0,0.4)";

  return (
    <div 
      onClick={onClick}
      className={`relative rounded-xl cursor-pointer transition-all duration-300 ${selected ? 'ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-[#0f3d2e]' : ''} ${className}`}
      style={{ 
        width: size, 
        height: size,
        boxShadow: selected ? `0 0 15px ${shadowColor}` : `2px 4px 8px ${shadowColor}`,
        ...style
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id={`grad-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: baseColor, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#D1D5DB", stopOpacity: 1 }} />
          </linearGradient>
           <filter id="inset-shadow">
            <feOffset dx="0" dy="1" />
            <feGaussianBlur stdDeviation="1" result="offset-blur" />
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
            <feFlood floodColor="black" floodOpacity="0.5" result="color" />
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
        </defs>
        
        {/* Die Body */}
        <rect x="2" y="2" width="96" height="96" rx="16" fill={`url(#grad-${value})`} stroke={selected ? "#D4AF37" : "#E5E7EB"} strokeWidth="2" />
        
        {/* Dots */}
        {dots[value].map((dot, idx) => (
          <circle 
            key={idx} 
            cx={dot[0]} 
            cy={dot[1]} 
            r={isOne ? 14 : 10} 
            fill={goldTint ? "#D4AF37" : dotColor}
            filter="url(#inset-shadow)"
          />
        ))}
      </svg>
    </div>
  );
};