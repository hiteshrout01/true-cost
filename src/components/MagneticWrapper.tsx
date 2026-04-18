"use client";
import React, { useRef, useState, useEffect } from 'react';

export default function MagneticWrapper({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode,
  className?: string
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const position = useRef({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    let animationFrameId: number;
    let currentX = 0;
    let currentY = 0;

    const animate = () => {
      // Lerp towards target position
      currentX += (position.current.x - currentX) * 0.1;
      currentY += (position.current.y - currentY) * 0.1;

      if (wrapperRef.current) {
        // Move container slightly
        wrapperRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        
        // Find inner elements to move for parallax depth
        const innerContent = wrapperRef.current.querySelector('.magnetic-inner') as HTMLElement;
        if (innerContent) {
           innerContent.style.transform = `translate3d(${currentX * 0.5}px, ${currentY * 0.5}px, 0)`;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!wrapperRef.current) return;
    const { left, top, width, height } = wrapperRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Max movement is ~10px
    const distanceX = (e.clientX - centerX) * 0.15;
    const distanceY = (e.clientY - centerY) * 0.15;
    
    position.current = { x: distanceX, y: distanceY };
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    position.current = { x: 0, y: 0 };
  };

  return (
    <div 
      ref={wrapperRef}
      className={`relative inline-block transition-transform duration-100 ease-linear will-change-transform ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="magnetic-inner transition-transform duration-100 ease-linear will-change-transform">
         {children}
      </div>
    </div>
  );
}
