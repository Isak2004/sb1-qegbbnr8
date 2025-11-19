import React, { useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';

interface HeartParticle {
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
  const heartsRef = useRef<HeartParticle[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hearts, setHearts] = React.useState<HeartParticle[]>([]);

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setHearts([]);
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
      
      const newHeart: HeartParticle = {
        x: Math.random() * width,
        y: height + 50,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: Math.random() * 25 + 15,
        opacity: 0,
        maxOpacity: Math.random() * 0.3 + 0.8,
        life: 0,
        maxLife: Math.random() * 400 + 300,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        color: heartColors[Math.floor(Math.random() * heartColors.length)],
        bounceCount: 0,
      };
      
      heartsRef.current.push(newHeart);
    };

    let lastHeartTime = 0;
    const HEART_INTERVAL = 200;

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

      // Update hearts
      heartsRef.current.forEach((heart, index) => {
        // Update physics
        heart.life++;
        heart.x += heart.vx;
        heart.y += heart.vy;
        heart.rotation += heart.rotationSpeed;

        // Bounce off walls
        if (heart.x <= heart.size || heart.x >= window.innerWidth - heart.size) {
          heart.vx = -heart.vx * 0.8;
          heart.x = Math.max(heart.size, Math.min(window.innerWidth - heart.size, heart.x));
          heart.bounceCount++;
        }
        
        if (heart.y <= heart.size || heart.y >= window.innerHeight - heart.size) {
          heart.vy = -heart.vy * 0.8;
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
          heart.opacity = (ageRatio / 0.1) * heart.maxOpacity;
        } else if (ageRatio > 0.8) {
          heart.opacity = heart.maxOpacity * (1 - (ageRatio - 0.8) / 0.2);
        } else {
          heart.opacity = heart.maxOpacity * (0.9 + 0.1 * Math.sin(timeRef.current * 0.05));
        }

        // Remove old hearts
        if (heart.life > heart.maxLife || heart.opacity <= 0) {
          heartsRef.current.splice(index, 1);
          return;
        }
      });

      // Update React state to trigger re-render
      setHearts([...heartsRef.current]);

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
      {hearts.map((heart, index) => (
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