"use client";
import React from 'react';

export default function AIThinkingIndicator() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8 animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center">
         {/* Core glowing dot */}
         <div className="w-4 h-4 bg-primary rounded-full animate-pulse z-10 shadow-[0_0_15px_rgba(168,85,247,0.8)]"></div>
         {/* Expanding rings */}
         <div className="absolute w-4 h-4 bg-primary rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75"></div>
         <div className="absolute w-4 h-4 bg-secondary rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_100ms] opacity-50"></div>
      </div>
      <p className="text-sm font-headline font-medium text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary animate-pulse tracking-wide">
        Reading underlying clauses...
      </p>
    </div>
  );
}
