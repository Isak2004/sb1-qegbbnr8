import React, { useEffect, useRef } from 'react';

interface Heart {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  maxOpacity: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  bounceCount: number;
}

interface BouncingHeartsEffectProps {
  isActive: boolean;
}

export const BouncingHeartsEffect: React.FC<BouncingHeartsEffectProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heartsRef = useRef<Heart[]>([]);
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

    // Heart colors (romantic pinks and reds)
    const heartColors = [
      '#FF69B4', // Hot pink
      '#FF1493', // Deep pink
      '#DC143C', // Crimson
      '#FF6347', // Tomato
      '#FF4500', // Orange red
      '#FF0080', // Bright pink
      '#E91E63', // Pink
      '#F06292', // Light pink
    ];

    // Create heart particle
    const createHeart = (x?: number, y?: number) => {
      const startX = x !== undefined ? x : Math.random() * canvas.width;
      const startY = y !== undefined ? y : Math.random() * canvas.height;
      
      heartsRef.current.push({
        x: startX,
        y: startY,
        vx: (Math.random() - 0.5) * 8, // Faster horizontal movement
        vy: (Math.random() - 0.5) * 8, // Faster vertical movement
        size: Math.random() * 15 + 10, // Larger hearts
        size: Math.random() * 25 + 15, // Much bigger hearts
        opacity: 0,
        maxOpacity: Math.random() * 0.6 + 0.6, // Higher opacity
        life: 0,
        maxLife: Math.random() * 400 + 300,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        color: heartColors[Math.floor(Math.random() * heartColors.length)],
        bounceCount: 0,
      });
    };

    // Initialize with lots of hearts
    for (let i = 0; i < 50; i++) {
      createHeart();
    }

    // Draw heart shape
    const drawHeart = (ctx: CanvasRenderingContext2D, size: number) => {
      const scale = size / 20;
      ctx.beginPath();
      ctx.moveTo(0, 3 * scale);
      ctx.bezierCurveTo(-8 * scale, -5 * scale, -15 * scale, 0, 0, 15 * scale);
      ctx.bezierCurveTo(15 * scale, 0, 8 * scale, -5 * scale, 0, 3 * scale);
      ctx.closePath();
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      timeRef.current += 1;

      // Occasionally create new hearts (less frequent after initial burst)
      if (Math.random() < 0.02 && heartsRef.current.length < 30) {
        createHeart();
      }

      // Update and draw hearts
      heartsRef.current.forEach((heart, index) => {
        // Update physics
        heart.life++;
        heart.x += heart.vx;
        heart.y += heart.vy;
        heart.rotation += heart.rotationSpeed;

        // Bounce off walls
        if (heart.x <= heart.size || heart.x >= canvas.width - heart.size) {
          heart.vx = -heart.vx * 0.8; // Slight energy loss on bounce
          heart.x = Math.max(heart.size, Math.min(canvas.width - heart.size, heart.x));
          heart.bounceCount++;
        }
        
        if (heart.y <= heart.size || heart.y >= canvas.height - heart.size) {
          heart.vy = -heart.vy * 0.8; // Slight energy loss on bounce
          heart.y = Math.max(heart.size, Math.min(canvas.height - heart.size, heart.y));
          heart.bounceCount++;
        }

        // Add slight gravity
        heart.vy += 0.1;

        // Air resistance
        heart.vx *= 0.999;
        heart.vy *= 0.999;

        // Opacity lifecycle
        const ageRatio = heart.life / heart.maxLife;
        if (ageRatio < 0.1) {
          // Fade in
          heart.opacity = (ageRatio / 0.1) * heart.maxOpacity;
        } else if (ageRatio > 0.8) {
          // Fade out
          heart.opacity = heart.maxOpacity * (1 - (ageRatio - 0.8) / 0.2);
        } else {
          // Stable visibility with slight pulsing
          heart.opacity = heart.maxOpacity * (0.8 + 0.2 * Math.sin(timeRef.current * 0.05));
        }

        // Remove old hearts
        if (heart.life > heart.maxLife || heart.opacity <= 0) {
          heartsRef.current.splice(index, 1);
          return;
        }

        // Draw heart
        ctx.save();
        ctx.translate(heart.x, heart.y);
        ctx.rotate(heart.rotation);
        ctx.globalAlpha = heart.opacity;

        ctx.fillStyle = heart.color;
        drawHeart(ctx, heart.size);
        ctx.fill();

        // Sparkle effect occasionally
        if (Math.random() < 0.1) {
          ctx.globalAlpha = heart.opacity * 0.8;
          ctx.fillStyle = '#FFFFFF';
          const sparkleX = (Math.random() - 0.5) * heart.size;
          const sparkleY = (Math.random() - 0.5) * heart.size;
          ctx.beginPath();
          ctx.arc(sparkleX, sparkleY, 1, 0, Math.PI * 2);
          ctx.fill();
        }

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