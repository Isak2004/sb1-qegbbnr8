import React, { useEffect, useRef } from 'react';

interface Balloon {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  opacity: number;
  drift: number;
  stringLength: number;
}

interface BalloonsEffectProps {
  isActive: boolean;
}

export const BalloonsEffect: React.FC<BalloonsEffectProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const balloonsRef = useRef<Balloon[]>([]);
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

    // Balloon colors
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];

    // Initialize balloons
    const initBalloons = () => {
      balloonsRef.current = [];
      for (let i = 0; i < 15; i++) {
        balloonsRef.current.push({
          x: Math.random() * canvas.width,
          y: canvas.height + Math.random() * 200,
          size: Math.random() * 30 + 20,
          speed: Math.random() * 1.5 + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.3 + 0.7,
          drift: Math.random() * 1 - 0.5,
          stringLength: Math.random() * 50 + 30,
        });
      }
    };

    initBalloons();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      balloonsRef.current.forEach((balloon) => {
        // Update position
        balloon.y -= balloon.speed;
        balloon.x += balloon.drift;

        // Reset balloon if it goes off screen
        if (balloon.y < -balloon.size - balloon.stringLength) {
          balloon.y = canvas.height + Math.random() * 200;
          balloon.x = Math.random() * canvas.width;
        }

        // Keep balloons within horizontal bounds
        if (balloon.x > canvas.width + balloon.size) {
          balloon.x = -balloon.size;
        } else if (balloon.x < -balloon.size) {
          balloon.x = canvas.width + balloon.size;
        }

        // Draw balloon string
        ctx.save();
        ctx.globalAlpha = balloon.opacity * 0.6;
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(balloon.x, balloon.y + balloon.size);
        ctx.lineTo(balloon.x, balloon.y + balloon.size + balloon.stringLength);
        ctx.stroke();
        ctx.restore();

        // Draw balloon
        ctx.save();
        ctx.globalAlpha = balloon.opacity;
        
        // Balloon gradient
        const gradient = ctx.createRadialGradient(
          balloon.x - balloon.size * 0.3,
          balloon.y - balloon.size * 0.3,
          0,
          balloon.x,
          balloon.y,
          balloon.size
        );
        gradient.addColorStop(0, balloon.color);
        gradient.addColorStop(0.7, balloon.color);
        gradient.addColorStop(1, `${balloon.color}80`);
        
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 15;
        ctx.shadowColor = balloon.color;
        
        // Draw balloon shape
        ctx.beginPath();
        ctx.arc(balloon.x, balloon.y, balloon.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Balloon highlight
        ctx.globalAlpha = balloon.opacity * 0.4;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(
          balloon.x - balloon.size * 0.3,
          balloon.y - balloon.size * 0.3,
          balloon.size * 0.3,
          0,
          Math.PI * 2
        );
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
    />
  );
};