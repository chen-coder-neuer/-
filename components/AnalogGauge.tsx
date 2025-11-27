import React from 'react';

interface GaugeProps {
  value: number; // 0-100
  label: string;
}

export const AnalogGauge: React.FC<GaugeProps> = ({ value, label }) => {
  // SVG Parameters
  const radius = 80;
  const stroke = 12;
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const angle = (normalizedValue / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-64 h-32 overflow-hidden mb-2">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Gauge Background */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1a4d3a"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          
          {/* Ticks */}
          {[0, 20, 40, 60, 80, 100].map((tick) => {
             const tickAngle = (tick / 100) * 180 - 180;
             const x1 = 100 + 70 * Math.cos(tickAngle * Math.PI / 180);
             const y1 = 100 + 70 * Math.sin(tickAngle * Math.PI / 180);
             const x2 = 100 + 85 * Math.cos(tickAngle * Math.PI / 180);
             const y2 = 100 + 85 * Math.sin(tickAngle * Math.PI / 180);
             return (
               <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D4AF37" strokeWidth="2" />
             );
          })}

          {/* Color Zones (simplified overlay) */}
          <path d="M 20 100 A 80 80 0 0 1 60 44" fill="none" stroke="#EF4444" strokeWidth="4" opacity="0.5" />
          <path d="M 60 44 A 80 80 0 0 1 140 44" fill="none" stroke="#EAB308" strokeWidth="4" opacity="0.5" />
          <path d="M 140 44 A 80 80 0 0 1 180 100" fill="none" stroke="#22C55E" strokeWidth="4" opacity="0.5" />

          {/* Needle */}
          <g transform={`translate(100, 100) rotate(${angle})`}>
            <polygon points="-4,0 0,-75 4,0" fill="#D4AF37" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.5))" />
            <circle cx="0" cy="0" r="6" fill="#111827" stroke="#D4AF37" strokeWidth="2" />
          </g>
        </svg>
      </div>
      <div className="text-3xl font-bold text-gold font-serif">{value.toFixed(1)}%</div>
      <div className="text-xs uppercase tracking-widest text-emerald-100/60 mt-1">{label}</div>
    </div>
  );
};