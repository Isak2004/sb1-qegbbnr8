import React, { useEffect, useRef } from 'react';

interface Firefly {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  opacity: number;
  maxOpacity: number;
  pulseSpeed: number;
  moveSpeed: number;
  color: string;
  trail: { x: number; y: number; opacity: number }[];
}

interface FirefliesEffectProps {
  isActive: boolean;
}

export const FirefliesEffect: React.FC<FirefliesEffectProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const firefliesRef = useRef<Firefly[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);

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

    // Firefly colors
    const colors = [
      '#FFD700', '#FFF700', '#FFFF00', '#90EE90', '#98FB98',
      '#F0E68C', '#FFFFE0', '#FFFACD', '#E6E6FA', '#F5F5DC'
    ];

    // Initialize fireflies
    const initFireflies = () => {
      firefliesRef.current = [];
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        firefliesRef.current.push({
          x,
          y,
          targetX: x,
          targetY: y,
          size: Math.random() * 3 + 2,
          opacity: 0,
          maxOpacity: Math.random() * 0.8 + 0.4,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          moveSpeed: Math.random() * 0.5 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          trail: [],
        });
      }
    };

    initFireflies();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      timeRef.current += 1;

      firefliesRef.current.forEach((firefly) => {
        // Update target position occasionally
        if (Math.random() < 0.005) {
          firefly.targetX = Math.random() * canvas.width;
          firefly.targetY = Math.random() * canvas.height;
        }

        // Move towards target
        const dx = firefly.targetX - firefly.x;
        const dy = firefly.targetY - firefly.y;
        firefly.x += dx * 0.01 * firefly.moveSpeed;
        firefly.y += dy * 0.01 * firefly.moveSpeed;

        // Add gentle floating motion
        firefly.x += Math.sin(timeRef.current * 0.01 + firefly.x * 0.001) * 0.5;
        firefly.y += Math.cos(timeRef.current * 0.008 + firefly.y * 0.001) * 0.3;

        // Keep within bounds
        if (firefly.x < 0) firefly.x = canvas.width;
        if (firefly.x > canvas.width) firefly.x = 0;
        if (firefly.y < 0) firefly.y = canvas.height;
        if (firefly.y > canvas.height) firefly.y = 0;

        // Update opacity with pulsing
        firefly.opacity = firefly.maxOpacity * (0.5 + 0.5 * Math.sin(timeRef.current * firefly.pulseSpeed));

        // Update trail
        firefly.trail.unshift({ x: firefly.x, y: firefly.y, opacity: firefly.opacity });
        if (firefly.trail.length > 8) {
          firefly.trail.pop();
        }

        // Draw trail
        firefly.trail.forEach((point, index) => {
          const trailOpacity = point.opacity * (1 - index / firefly.trail.length) * 0.3;
          const trailSize = firefly.size * (1 - index / firefly.trail.length) * 0.5;
          
          if (trailOpacity > 0.01) {
            ctx.save();
            ctx.globalAlpha = trailOpacity;
            ctx.fillStyle = firefly.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = firefly.color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, trailSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });

        // Draw main firefly
        ctx.save();
        ctx.globalAlpha = firefly.opacity;
        
        // Outer glow
        const outerGlow = ctx.createRadialGradient(
          firefly.x, firefly.y, 0,
          firefly.x, firefly.y, firefly.size * 4
        );
        outerGlow.addColorStop(0, firefly.color);
        outerGlow.addColorStop(0.3, firefly.color + '80');
        outerGlow.addColorStop(1, firefly.color + '00');
        
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(firefly.x, firefly.y, firefly.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        ctx.globalAlpha = firefly.opacity * 1.2;
        ctx.fillStyle = firefly.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = firefly.color;
        ctx.beginPath();
        ctx.arc(firefly.x, firefly.y, firefly.size, 0, Math.PI * 2);
        ctx.fill();

        // Bright center
        ctx.globalAlpha = firefly.opacity * 1.5;
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 5;
        ctx.shadowColor = firefly.color;
        ctx.beginPath();
        ctx.arc(firefly.x, firefly.y, firefly.size * 0.3, 0, Math.PI * 2);
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