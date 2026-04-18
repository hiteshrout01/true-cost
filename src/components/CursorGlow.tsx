"use client";
import React, { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on desktop, avoid mobile where hover/mouse is irrelevant
    if (window.innerWidth < 768) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let isActive = false;
    
    // Dynamic intensity variables
    let targetIntensity = 0;
    let currentIntensity = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isActive) {
        isActive = true;
        animate();
      }
      
      // Check if hovering over an interactive element
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, .glass-panel, [role="button"], .interactive-document span');
      if (isInteractive) {
        targetIntensity = 1; // 1 means full intensity boost
      } else {
        targetIntensity = 0;
      }
    };

    let animationFrameId: number;

    const animate = () => {
      // Linear interpolation for smooth trailing
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      
      // Lerp intensity
      currentIntensity += (targetIntensity - currentIntensity) * 0.08;

      if (glowRef.current) {
        // Center the 800px wide div exactly on the cursor
        // Reduce blur and increase opacity based on intensity
        const baseBlur = 80;
        const blurReduction = 30 * currentIntensity; // Reduces blur up to 50px
        const baseOpacity = 1; // base is 100% of underlying gradient colors
        const opacityBoost = 1 + (0.5 * currentIntensity); // Boost opacity up to 1.5x
        
        glowRef.current.style.transform = `translate(${currentX - 400}px, ${currentY - 400}px)`;
        glowRef.current.style.filter = `blur(${baseBlur - blurReduction}px)`;
        glowRef.current.style.opacity = `${opacityBoost}`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={glowRef}
      className="fixed top-0 left-0 w-[800px] h-[800px] rounded-full pointer-events-none z-50 mix-blend-screen hidden md:block pointer-events-none transition-colors duration-300"
      style={{
        background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(76,215,246,0.10) 30%, rgba(59,130,246,0.05) 50%, rgba(0,0,0,0) 70%)',
        filter: 'blur(80px)',
        transform: 'translate(-500px, -500px)', // start hidden off screen
        willChange: 'transform, filter, opacity'
      }}
    />
  );
}
