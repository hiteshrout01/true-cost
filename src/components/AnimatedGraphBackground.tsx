"use client";
import React, { useEffect, useState } from 'react';

export default function AnimatedGraphBackground() {
  const [mounted, setMounted] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-auto rounded-inherit group">
      {/* Background gradients */}
      <div 
        className="absolute w-full h-full opacity-10 animate-[spin_20s_linear_infinite] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 70% 30%, rgba(168,85,247,1) 0%, transparent 60%)',
          filter: 'blur(60px)',
          transformOrigin: '50% 50%',
        }}
      />
      <div 
        className="absolute w-full h-full opacity-15 animate-[spin_30s_linear_infinite_reverse] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 70%, rgba(76,215,246,1) 0%, transparent 50%)',
          filter: 'blur(70px)',
          transformOrigin: '40% 60%',
        }}
      />
      
      {/* Simulated interactive graph lines for enhanced UX */}
      <div className="absolute inset-0 z-10 opacity-30 group-hover:opacity-60 transition-opacity duration-500 flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-[60%] px-4 overflow-visible">
           {/* Soft glow stroke */}
           <path 
             d="M0,80 Q25,20 50,60 T100,30" 
             fill="none" 
             stroke="rgba(168,85,247,0.5)" 
             strokeWidth="2"
             className="drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-draw-line"
           />
           {/* Sharp internal stroke */}
           <path 
             d="M0,80 Q25,20 50,60 T100,30" 
             fill="none" 
             stroke="rgba(255,255,255,0.4)" 
             strokeWidth="0.5"
             className="transition-colors duration-300 animate-draw-line"
             style={{ animationDelay: "200ms" }}
           />
           
           {/* Interactive Points */}
           {[
             { cx: 12.5, cy: 50 },
             { cx: 50, cy: 60 },
             { cx: 75, cy: 45 },
             { cx: 100, cy: 30 }
           ].map((pt, i) => (
             <g key={i} className="pointer-events-auto cursor-crosshair animate-in zoom-in fade-in duration-500 fill-mode-both" style={{ animationDelay: `${500 + i * 200}ms` }} onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}>
               <circle 
                 cx={pt.cx} 
                 cy={pt.cy} 
                 r="2" 
                 fill={hoveredPoint === i ? "#fff" : "rgba(168,85,247,0.8)"} 
                 className="transition-all duration-300"
               />
               <circle 
                 cx={pt.cx} 
                 cy={pt.cy} 
                 r={hoveredPoint === i ? "6" : "0"} 
                 fill="none"
                 stroke="rgba(168,85,247,0.8)"
                 strokeWidth="0.5"
                 className="transition-all duration-300 opacity-50"
               />
             </g>
           ))}
        </svg>
      </div>
    </div>
  );
}
