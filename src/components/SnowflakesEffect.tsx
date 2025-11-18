import React, { useEffect, useRef } from 'react';

interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  drift: number;
}

interface SnowPile {
  x: number;
  height: number;
  width: number;
  opacity: number;
}

interface SnowflakesEffectProps {
  isActive: boolean;
}

export const SnowflakesEffect: React.FC<SnowflakesEffectProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snowflakesRef = useRef<Snowflake[]>([]);
  const snowPilesRef = useRef<SnowPile[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize snowflakes
    const initSnowflakes = () => {
      snowflakesRef.current = [];
      snowPilesRef.current = [];
      
      // Initialize snow piles across the bottom
      const pileWidth = 20;
      const pileCount = Math.ceil(canvas.width / pileWidth);
      for (let i = 0; i < pileCount; i++) {
        snowPilesRef.current.push({
          x: i * pileWidth,
          height: 0,
          width: pileWidth,
          opacity: 0.8,
        });
      }
      
      for (let i = 0; i < 100; i++) {
        snowflakesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 4 + 2,
          speed: Math.random() * 2 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          drift: Math.random() * 2 - 1,
        });
      }
    };

    initSnowflakes();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakesRef.current.forEach((snowflake) => {
        // Update position
        snowflake.y += snowflake.speed;
        snowflake.x += snowflake.drift;

        // Check if snowflake hits the ground or accumulated snow
        const pileIndex = Math.floor(snowflake.x / 20);
        const pile = snowPilesRef.current[pileIndex];
        const groundLevel = pile ? canvas.height - pile.height : canvas.height;
        
        if (snowflake.y > groundLevel - snowflake.size) {
          // Add to snow pile
          if (pile && Math.random() < 0.8) { // 80% chance to stick and build up
            pile.height += snowflake.size * 0.5; // Much faster accumulation
            pile.height = Math.min(pile.height, canvas.height * 0.7); // Much higher max height
          }
          
          // Reset snowflake
          snowflake.y = -10;
          snowflake.x = Math.random() * canvas.width;
        }
        
        if (snowflake.x > canvas.width) {
          snowflake.x = 0;
        } else if (snowflake.x < 0) {
          snowflake.x = canvas.width;
        }

        // Draw snowflake
        ctx.save();
        ctx.globalAlpha = snowflake.opacity;
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        
        ctx.beginPath();
        ctx.arc(snowflake.x, snowflake.y, snowflake.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw snow piles at the bottom
      snowPilesRef.current.forEach((pile) => {
        if (pile.height > 0) {
          ctx.save();
          ctx.globalAlpha = pile.opacity;
          
          // Create gradient for snow pile
          const pileGradient = ctx.createLinearGradient(
            pile.x, canvas.height - pile.height,
            pile.x, canvas.height
          );
          pileGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
          pileGradient.addColorStop(0.5, 'rgba(240, 240, 255, 0.8)');
          pileGradient.addColorStop(1, 'rgba(220, 220, 240, 0.7)');
          
          ctx.fillStyle = pileGradient;
          
          // Draw rounded snow pile
          ctx.beginPath();
          ctx.moveTo(pile.x, canvas.height);
          ctx.quadraticCurveTo(
            pile.x + pile.width / 2, 
            canvas.height - pile.height - 5,
            pile.x + pile.width, 
            canvas.height
          );
          ctx.lineTo(pile.x, canvas.height);
          ctx.fill();
          
          // Add subtle shadow
          ctx.globalAlpha = pile.opacity * 0.3;
          ctx.fillStyle = 'rgba(200, 200, 220, 0.5)';
          ctx.fillRect(pile.x, canvas.height - 2, pile.width, 2);
          
          // Add sparkle effect on snow piles
          if (Math.random() < 0.1) {
            const sparkleX = pile.x + Math.random() * pile.width;
            const sparkleY = canvas.height - pile.height + Math.random() * pile.height * 0.5;
            
            ctx.globalAlpha = pile.opacity;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, 1, 0, Math.PI * 2);
            ctx.fill();
          }
          
          ctx.restore();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};