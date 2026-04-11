"use client";
import React, { useEffect, useState } from 'react';

export default function MouseFollower() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      if (window.getComputedStyle(target).cursor === 'pointer' || target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button') {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="fixed pointer-events-none z-[9999] rounded-full mix-blend-screen transition-transform duration-100 ease-out"
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) scale(${isHovering ? 1.5 : 1})`,
        width: isHovering ? '12px' : '6px',
        height: isHovering ? '12px' : '6px',
        background: 'rgba(168,85,247,0.5)',
        boxShadow: '0 0 10px 4px rgba(168,85,247,0.3), 0 0 20px 8px rgba(76,215,246,0.15)',
        filter: 'none',
        opacity: position.x === -100 ? 0 : 1
      }}
    />
  );
}
