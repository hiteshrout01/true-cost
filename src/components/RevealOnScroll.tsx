"use client";
import React, { useEffect, useRef, useState } from 'react';

export default function RevealOnScroll({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode,
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reveal everything immediately if window is smaller assuming mobile 
    // but the prompt specifies desktop mostly, still good for safety
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Unobserve once visible so it doesn't fade back out
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      {
        threshold: 0.1, // trigger when 10% is visible
        rootMargin: '0px 0px -50px 0px' 
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div 
      ref={ref} 
      className={`reveal-hidden ${isVisible ? 'reveal-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
