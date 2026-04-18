"use client";
import React, { useEffect, useState } from 'react';

export default function DetectionPulse({ x, y }: { x: number, y: number }) {
  const [active, setActive] = useState(true);

  useEffect(() => {
    // Self-destruct logic to clear DOM
    const timer = setTimeout(() => setActive(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!active) return null;

  return (
    <div 
      className="absolute pointer-events-none z-50 animate-sonar-ping"
      style={{
        left: x,
        top: y,
        marginLeft: '-12px', // Center a 24x24 dot
        marginTop: '-12px'
      }}
    >
       <div className="w-6 h-6 rounded-full bg-error opacity-60 mix-blend-screen"></div>
    </div>
  );
}
