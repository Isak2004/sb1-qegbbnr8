import React, { useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Default heart colors
    const heartColors = [
      '#8B0000', // Deep red
      '#FF1493', // Hot pink
      '#FF69B4', // Deep pink
      '#FF0000', // Bright red
      '#FF4500', // Orange red
      '#FFD700', // Gold
      '#32CD32', // Lime green
      '#00BFFF', // Electric blue
      '#8A2BE2', // Purple
    ];

    // Create heart particle
    const createHeart = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      heartsRef.current.push({
        x: Math.random() * width,
        y: height + 50,
        vx: (Math.random() - 0.5) * 8, // Faster horizontal movement
        vy: (Math.random() - 0.5) * 8, // Faster vertical movement
        size: Math.random() * 25 + 15, // Much bigger hearts
        opacity: 0,
        maxOpacity: Math.random() * 0.3 + 0.8, // Much higher opacity (0.8-1.1)
        life: 0,
        maxLife: Math.random() * 400 + 300,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        color: heartColors[Math.floor(Math.random() * heartColors.length)],
        bounceCount: 0,
      });
    };

    let lastHeartTime = 0;
    const HEART_INTERVAL = 200; // Create hearts more frequently

    // Animation loop
    const animate = () => {
      timeRef.current += 1;

      // Create new hearts at intervals
      if (timeRef.current - lastHeartTime > HEART_INTERVAL) {
        if (heartsRef.current.length < 30) {
          createHeart();
        }
        lastHeartTime = timeRef.current;
      }

      // Update and draw hearts
      heartsRef.current.forEach((heart, index) => {
        // Update physics
        heart.life++;
        heart.x += heart.vx;
        heart.y += heart.vy;
        heart.rotation += heart.rotationSpeed;

        // Bounce off walls
        if (heart.x <= heart.size || heart.x >= window.innerWidth - heart.size) {
          heart.vx = -heart.vx * 0.8; // Slight energy loss on bounce
          heart.x = Math.max(heart.size, Math.min(window.innerWidth - heart.size, heart.x));
          heart.bounceCount++;
        }
        
        if (heart.y <= heart.size || heart.y >= window.innerHeight - heart.size) {
          heart.vy = -heart.vy * 0.8; // Slight energy loss on bounce
          heart.y = Math.max(heart.size, Math.min(window.innerHeight - heart.size, heart.y));
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
          heart.opacity = heart.maxOpacity * (0.9 + 0.1 * Math.sin(timeRef.current * 0.05));
        }

        // Remove old hearts
        if (heart.life > heart.maxLife || heart.opacity <= 0) {
          heartsRef.current.splice(index, 1);
          return;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {heartsRef.current.map((heart, index) => (
        <div
          key={index}
          className="absolute transition-transform duration-75"
          style={{
            left: `${heart.x}px`,
            top: `${heart.y}px`,
            transform: `rotate(${heart.rotation}rad)`,
            opacity: heart.opacity,
          }}
        >
          <Heart
            size={heart.size}
            style={{ color: heart.color }}
            fill="currentColor"
          />
        </div>
      ))}
    </div>
  );
};