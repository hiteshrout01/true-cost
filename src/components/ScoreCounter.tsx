"use client";
import React, { useEffect, useState, useRef } from 'react';

export default function ScoreCounter({ 
  finalScore, 
  ringColor,
  riskCategory
}: { 
  finalScore: number, 
  ringColor: string,
  riskCategory: string
}) {
  const [currentScore, setCurrentScore] = useState(0);
  const [dashOffset, setDashOffset] = useState(364); // Full empty circle
  
  const finalDashOffset = 364 - (364 * (finalScore / 10));
  
  useEffect(() => {
    let startTimestamp: number;
    const duration = 1500; // 1.5 seconds to build
    
    // Safety
    const safeScore = isNaN(finalScore) ? 8.0 : finalScore;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing out curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      setCurrentScore(easeProgress * safeScore);
      setDashOffset(364 - ((364 - finalDashOffset) * easeProgress));
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    
    requestAnimationFrame(step);
  }, [finalScore, finalDashOffset]);

  return (
    <>
      <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full transform -rotate-90">
              <circle className="text-surface-container-highest" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
              {/* Note: Inlining stroke width and dynamic parameters avoids thrashing */}
              <circle 
                  style={{color: ringColor, strokeDashoffset: dashOffset}} 
                  className="drop-shadow-[0_0_8px_currentColor] transition-none" 
                  cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" 
                  strokeDasharray="364" strokeWidth="8"
              ></circle>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-headline font-bold text-white">
                 {currentScore.toFixed(1)}
              </span>
              <span className="text-[10px] text-outline uppercase font-label">Out of 10</span>
          </div>
      </div>
      
      {/* Risk Category fades in gracefully near the end */}
      <div 
        className={`mt-2 font-bold text-sm transition-opacity duration-700 ${currentScore > finalScore * 0.8 ? 'opacity-100' : 'opacity-0'}`} 
        style={{color: ringColor}}>
           {riskCategory}
      </div>
    </>
  );
}
