"use client";
import React, { useEffect, useState, useRef } from 'react';

export default function MouseFollower() {
  const [cursorType, setCursorType] = useState('default');
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  // Physics DOM Refs
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Physics state (to bypass React re-renders)
  const mouse = useRef({ x: -100, y: -100 });
  const dot = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  
  // Trails geometry
  const numTrails = 5;
  const trailPositions = useRef(Array(numTrails).fill({x: -100, y: -100}));
  const requestRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(any-pointer: coarse)").matches) {
       setIsMobile(true);
       return;
    }
    setIsMobile(false);

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };

      const target = e.target as HTMLElement;
      // Identify clickable surfaces
      const computedCursor = window.getComputedStyle(target).cursor;
      const isPointer = computedCursor === 'pointer' || 
                        target.tagName.toLowerCase() === 'a' || 
                        target.tagName.toLowerCase() === 'button' || 
                        target.closest('a') || 
                        target.closest('button') ||
                        target.classList.contains('cursor-pointer');
      
      setIsHovering(!!isPointer);

      // Context-aware risk highlighting logic
      if (target.classList.contains('highlight-red') || target.closest('.highlight-red') || target.getAttribute('data-type') === 'red') {
          setCursorType('red');
      } else if (target.classList.contains('highlight-yellow') || target.closest('.highlight-yellow') || target.getAttribute('data-type') === 'yellow') {
          setCursorType('yellow');
      } else if (target.classList.contains('highlight-green') || target.closest('.highlight-green') || target.getAttribute('data-type') === 'green') {
          setCursorType('green');
      } else {
          setCursorType('default');
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    // Render loop running at 60fps directly affecting the DOM
    const render = () => {
      // 1. Snappy Dot
      dot.current.x += (mouse.current.x - dot.current.x) * 0.4;
      dot.current.y += (mouse.current.y - dot.current.y) * 0.4;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dot.current.x}px, ${dot.current.y}px, 0)`;
      }

      // 2. Smooth Ring Lag
      ring.current.x += (mouse.current.x - ring.current.x) * 0.15;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.15;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
      }

      // 3. Fluid Trailing Dots
      let prevPos = { ...dot.current };
      for (let i = 0; i < numTrails; i++) {
        const currentPos = trailPositions.current[i];
        currentPos.x += (prevPos.x - currentPos.x) * 0.3;
        currentPos.y += (prevPos.y - currentPos.y) * 0.3;
        
        if (trailsRef.current[i]) {
          trailsRef.current[i]!.style.transform = `translate3d(${currentPos.x}px, ${currentPos.y}px, 0)`;
        }
        prevPos = { ...currentPos };
      }

      requestRef.current = requestAnimationFrame(render);
    };
    
    requestRef.current = requestAnimationFrame(render);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  if (isMobile) return null;

  // --------------
  // Aesthetic Neon Theme
  // --------------
  let theme = {
     dotBg: 'linear-gradient(135deg, #00f0ff, #a855f7)',
     dotShadow: '0 0 12px 4px rgba(76,215,246,0.6)',
     ringBorder: 'rgba(76,215,246,0.5)',
     ringShadow: '0 0 20px 2px rgba(168,85,247,0.3)',
     trailBg: 'rgba(76,215,246,0.5)'
  };
  
  if (cursorType === 'red') {
      theme.dotBg = '#ff5449';
      theme.dotShadow = '0 0 15px 5px rgba(255,84,73,0.8), 0 0 30px 10px rgba(255,0,0,0.5)';
      theme.ringBorder = 'rgba(255,84,73,0.7)';
      theme.ringShadow = '0 0 20px 2px rgba(255,0,0,0.4)';
      theme.trailBg = 'rgba(255,84,73,0.6)';
  } else if (cursorType === 'yellow') {
      theme.dotBg = '#facc15';
      theme.dotShadow = '0 0 15px 5px rgba(250,204,21,0.8), 0 0 30px 10px rgba(200,150,0,0.5)';
      theme.ringBorder = 'rgba(250,204,21,0.7)';
      theme.ringShadow = '0 0 20px 2px rgba(200,150,0,0.4)';
      theme.trailBg = 'rgba(250,204,21,0.6)';
  } else if (cursorType === 'green') {
      theme.dotBg = '#4edea3';
      theme.dotShadow = '0 0 15px 5px rgba(78,222,163,0.8), 0 0 30px 10px rgba(0,255,100,0.5)';
      theme.ringBorder = 'rgba(78,222,163,0.7)';
      theme.ringShadow = '0 0 20px 2px rgba(0,255,100,0.4)';
      theme.trailBg = 'rgba(78,222,163,0.6)';
  }

  // Reactive Interaction Logic
  const isContextHover = cursorType !== 'default';
  const dotScale = isClicking ? 0.3 : (isHovering || isContextHover) ? 1.4 : 1;
  const ringScale = isClicking ? 1.2 : (isContextHover) ? 1.7 : isHovering ? 1.5 : 1;
  const ringOpacity = isClicking ? 0.8 : (isHovering || isContextHover) ? 1 : 0.5;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media (pointer: fine) {
          * { cursor: none !important; }
        }
      `}} />
      
      {/* TRAIL LAYER */}
      {Array.from({length: 5}).map((_, idx) => (
        <div 
          key={idx}
          ref={el => { trailsRef.current[idx] = el; }}
          className="fixed top-0 left-0 pointer-events-none z-[99997] mix-blend-screen will-change-transform"
          style={{ transform: 'translate3d(-100px, -100px, 0)' }}
        >
          <div 
             className="rounded-full absolute transition-colors duration-300"
             style={{
                width: `${5 - idx * 0.8}px`,
                height: `${5 - idx * 0.8}px`,
                background: theme.trailBg,
                opacity: 1 - (idx * 0.2),
                filter: 'blur(1px)',
                transform: 'translate(-50%, -50%)'
             }}
          />
        </div>
      ))}

      {/* OUTER RING LAYER */}
      <div 
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[99998] mix-blend-screen will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
         <div 
            className="rounded-full absolute transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{
              width: '32px', 
              height: '32px',
              border: `1.5px solid ${theme.ringBorder}`,
              boxShadow: theme.ringShadow,
              opacity: ringOpacity,
              background: isContextHover ? theme.trailBg : 'transparent',
              transform: `translate(-50%, -50%) scale(${ringScale})`
            }}
         />
      </div>

      {/* CORE DOT LAYER */}
      <div 
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[99999] mix-blend-screen will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
         <div 
            className="rounded-full absolute transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{
              width: '8px', 
              height: '8px',
              background: theme.dotBg,
              boxShadow: theme.dotShadow,
              transform: `translate(-50%, -50%) scale(${dotScale})`
            }}
         />
      </div>
    </>
  );
}
