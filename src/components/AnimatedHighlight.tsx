"use client";
import React, { ReactNode } from 'react';

type HighlightType = 'risk' | 'warning' | 'safe';

export default function AnimatedHighlight({ 
  children, 
  type,
  className = ""
}: { 
  children: ReactNode, 
  type: HighlightType,
  className?: string
}) {
  let animationClass = "";
  let baseClass = "";

  switch (type) {
    case 'risk':
      baseClass = "bg-error/10 border-l-[3px] border-error text-error font-semibold px-1 rounded-r-sm";
      animationClass = "animate-pulse-red";
      break;
    case 'warning':
      baseClass = "bg-[#facc15]/15 border-l-[3px] border-[#facc15] text-[#facc15] font-semibold px-1 rounded-r-sm";
      animationClass = "animate-shimmer-yellow";
      break;
    case 'safe':
      baseClass = "bg-tertiary/15 border-l-[3px] border-tertiary text-tertiary font-semibold px-1 rounded-r-sm";
      animationClass = "animate-fade-green";
      break;
  }

  return (
    <span className={`inline-block ${baseClass} ${animationClass} ${className}`}>
      {children}
    </span>
  );
}
