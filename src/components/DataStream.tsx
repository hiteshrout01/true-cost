"use client";
import React, { useEffect, useRef } from 'react';

export default function DataStream() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match the parent
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Characters used for the matrix rain: numbers and statistics/finance formulas
    const characters = '0123456789%∑∫≈Δ$€£¥+-/\\*∞μσπ';
    const charArray = characters.split('');
    
    const fontSize = 16;
    const columns = Math.ceil(canvas.width / fontSize);
    
    // Array of drops - one per column
    const drops: number[] = [];
    for (let x = 0; x < columns; x++) {
      // Create a random starting Y position so they don't all start falling at once
      drops[x] = Math.random() * (canvas.height / fontSize) * -1;
    }

    const draw = () => {
      // Translucent background to create trail effect
      ctx.fillStyle = 'rgba(19, 19, 24, 0.15)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `bold ${fontSize}px "Space Grotesk", monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Randomly alternate between theme colors
        const colorSeed = Math.random();
        if (colorSeed > 0.8) {
          ctx.fillStyle = 'rgba(168, 85, 247, 0.8)'; // Primary (Purple)
        } else if (colorSeed > 0.5) {
          ctx.fillStyle = 'rgba(76, 215, 246, 0.8)'; // Secondary (Cyan)
        } else {
          ctx.fillStyle = 'rgba(78, 222, 163, 0.8)'; // Tertiary (Green)
        }

        // Random character
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        
        // Draw the character
        const currentY = drops[i] * fontSize;
        if (currentY > 0) {
            ctx.fillText(text, i * fontSize, currentY);
        }

        // Reset drop to top randomly after it crosses the screen
        if (currentY > canvas.height && Math.random() > 0.95) {
          drops[i] = 0;
        }
        
        // Move drop down
        drops[i] += 0.5; // Controls the falling speed
      }
    };

    let animationFrameId: number;
    let lastDrawTime = 0;
    const fps = 30; // 30 FPS for matrix effect
    const interval = 1000 / fps;

    const render = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (timestamp - lastDrawTime > interval) {
        draw();
        lastDrawTime = timestamp;
      }
    };

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      const newColumns = Math.ceil(canvas.width / fontSize);
      if (newColumns > drops.length) {
        for (let x = drops.length; x < newColumns; x++) {
          drops[x] = Math.random() * (canvas.height / fontSize) * -1;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full absolute inset-0" style={{ mixBlendMode: 'screen' }} />;
}
