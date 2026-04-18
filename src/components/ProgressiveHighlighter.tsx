"use client";
import React, { useEffect, useRef, useState } from 'react';
import DetectionPulse from './DetectionPulse';

export default function ProgressiveHighlighter({ 
  children, 
  onComplete,
  isScanning 
}: { 
  children: React.ReactNode,
  onComplete: () => void,
  isScanning: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scanProgress, setScanProgress] = useState(0); // 0 to 100 percentage
  const [pulses, setPulses] = useState<{id: number, x: number, y: number}[]>([]);
  const scanDuration = 2500; // 2.5 seconds
  const requestRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const pulseCount = useRef(0);

  useEffect(() => {
    if (!isScanning) return;

    const container = containerRef.current;
    if (!container) {
       onComplete(); // Skip if no container safely
       return;
    }

    const highlightNodes = Array.from(container.querySelectorAll('.flag-highlight')) as HTMLElement[];
    // Add ghost class initially
    highlightNodes.forEach(node => node.classList.add('ghost-highlight'));

    const containerHeight = container.getBoundingClientRect().height;
    
    // Sort nodes vertically
    const nodesData = highlightNodes.map(node => {
      // Calculate relative Y percentage
      // offsetTop gives position relative to the container if container is relative positioned
      const topPct = (node.offsetTop / containerHeight) * 100;
      return { node, topPct, revealed: false, type: node.getAttribute('data-type') };
    });

    const animate = (time: number) => {
      if (startTimeRef.current === undefined) {
        startTimeRef.current = time;
      }
      
      const elapsed = time - startTimeRef.current;
      const progress = Math.min((elapsed / scanDuration) * 100, 100);
      setScanProgress(progress);

      // Check nodes
      nodesData.forEach(item => {
        if (!item.revealed && item.topPct <= progress + 5) { // Slight lookahead (+5%)
           item.node.classList.add('revealed');
           item.revealed = true;
           
           // If high risk, spawn pulse
           if (item.type === 'red') {
              const rect = item.node.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();
              
              const xPos = rect.left - containerRect.left;
              const yPos = rect.top - containerRect.top + (rect.height / 2);
              
              pulseCount.current += 1;
              const newPulse = { id: pulseCount.current, x: xPos, y: yPos };
              setPulses(p => [...p, newPulse]);
           }
        }
      });

      if (progress < 100) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isScanning, onComplete]);

  return (
    <div className="relative" ref={containerRef}>
      {children}
      
      {/* Scan Beam Overlay */}
      {isScanning && (
        <div 
          className="absolute left-0 right-0 h-10 -ml-4 -mr-4 pointer-events-none z-10 opacity-75"
          style={{
            top: `${scanProgress}%`,
            transition: 'none',
            background: 'linear-gradient(to bottom, transparent 0%, rgba(76,215,246,0.3) 50%, rgba(168,85,247,0.8) 100%)',
            borderBottom: '1px solid rgba(168,85,247,0.9)',
            boxShadow: '0 8px 30px rgba(168,85,247,0.3)'
          }}
        />
      )}
      
      {/* Discovery Pulses Layer */}
      {pulses.map(pulse => (
         <DetectionPulse key={pulse.id} x={pulse.x} y={pulse.y} />
      ))}
    </div>
  );
}
