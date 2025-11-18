import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  prevX: number;
  prevY: number;
  size: number;
  opacity: number;
  color: string;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface StarfieldEffectProps {
  isActive: boolean;
}

export const StarfieldEffect: React.FC<StarfieldEffectProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const speedRef = useRef<number>(2);

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

    // Star colors
    const starColors = [
      '#FFFFFF', '#FFF8DC', '#F0F8FF', '#E6E6FA', '#FFFACD',
      '#FFE4E1', '#F5F5DC', '#FFEFD5', '#FDF5E6', '#FAF0E6'
    ];

    // Initialize stars
    const initStars = () => {
      starsRef.current = [];
      for (let i = 0; i < 200; i++) {
        const star: Star = {
          x: (Math.random() - 0.5) * 2000,
          y: (Math.random() - 0.5) * 2000,
          z: Math.random() * 1000 + 1,
          prevX: 0,
          prevY: 0,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2,
        };
        star.prevX = star.x;
        star.prevY = star.y;
        starsRef.current.push(star);
      }
    };

    initStars();

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      timeRef.current += 0.01;
      
      // Dynamic speed variation
      speedRef.current = 2 + Math.sin(timeRef.current * 0.5) * 1;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      starsRef.current.forEach((star) => {
        // Store previous position for trail effect
        star.prevX = star.x / star.z * 500 + centerX;
        star.prevY = star.y / star.z * 500 + centerY;

        // Move star towards viewer
        star.z -= speedRef.current;

        // Reset star if it's too close
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * 2000;
          star.y = (Math.random() - 0.5) * 2000;
          star.z = 1000;
        }

        // Calculate screen position
        const screenX = star.x / star.z * 500 + centerX;
        const screenY = star.y / star.z * 500 + centerY;

        // Skip if off screen
        if (screenX < -50 || screenX > canvas.width + 50 || 
            screenY < -50 || screenY > canvas.height + 50) {
          return;
        }

        // Calculate star properties based on distance
        const distance = 1 - star.z / 1000;
        const starSize = star.size * distance * 3;
        const twinkle = Math.sin(timeRef.current * 60 * star.twinkleSpeed + star.twinklePhase);
        const starOpacity = star.opacity * distance * (0.8 + twinkle * 0.2);

        // Draw star trail for fast-moving stars
        if (distance > 0.3 && speedRef.current > 2) {
          ctx.save();
          ctx.globalAlpha = starOpacity * 0.3;
          ctx.strokeStyle = star.color;
          ctx.lineWidth = starSize * 0.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(star.prevX, star.prevY);
          ctx.lineTo(screenX, screenY);
          ctx.stroke();
          ctx.restore();
        }

        // Draw main star
        ctx.save();
        ctx.globalAlpha = starOpacity;
        
        // Star glow
        const glowSize = starSize * 3;
        const glowGradient = ctx.createRadialGradient(
          screenX, screenY, 0,
          screenX, screenY, glowSize
        );
        glowGradient.addColorStop(0, star.color);
        glowGradient.addColorStop(0.3, star.color + '80');
        glowGradient.addColorStop(1, star.color + '00');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Star core
        ctx.globalAlpha = starOpacity * 1.2;
        ctx.fillStyle = star.color;
        ctx.shadowBlur = starSize * 2;
        ctx.shadowColor = star.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, starSize, 0, Math.PI * 2);
        ctx.fill();

        // Bright center
        ctx.globalAlpha = starOpacity * 1.5;
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = starSize;
        ctx.beginPath();
        ctx.arc(screenX, screenY, starSize * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
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