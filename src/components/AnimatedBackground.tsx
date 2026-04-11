"use client";
import React from 'react';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-[10] overflow-hidden pointer-events-none bg-[#131318]">
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/20 rounded-full blur-[120px] animate-pulse"
        style={{ animationDuration: '8s' }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-secondary/10 rounded-full blur-[150px] animate-pulse"
        style={{ animationDuration: '12s', animationDelay: '2s' }}
      />
      <div 
        className="absolute top-[40%] left-[60%] w-[40vw] h-[40vw] bg-tertiary/10 rounded-full blur-[100px] animate-pulse"
        style={{ animationDuration: '10s', animationDelay: '5s' }}
      />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
    </div>
  );
}
