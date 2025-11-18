import React, { useEffect, useRef } from 'react';

interface Raindrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  angle: number;
  width: number;
}

interface Splash {
  x: number;
  y: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  particles: { x: number; y: number; vx: number; vy: number; life: number }[];
}

interface RainEffectProps {
  isActive: boolean;
}

export const RainEffect: React.FC<RainEffectProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raindropsRef = useRef<Raindrop[]>([]);
  const splashesRef = useRef<Splash[]>([]);
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

    // Initialize raindrops
    const initRain = () => {
      raindropsRef.current = [];
      for (let i = 0; i < 150; i++) {
        createRaindrop();
      }
    };

    const createRaindrop = () => {
      raindropsRef.current.push({
        x: Math.random() * (canvas.width + 200) - 100,
        y: Math.random() * canvas.height - canvas.height,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 8 + 12,
        opacity: Math.random() * 0.6 + 0.4,
        angle: Math.random() * 0.2 - 0.1, // Slight angle variation
        width: Math.random() * 1.5 + 0.5,
      });
    };

    const createSplash = (x: number, y: number) => {
      const particleCount = Math.random() * 6 + 4;
      const particles = [];
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: x + (Math.random() - 0.5) * 4,
          y: y + (Math.random() - 0.5) * 2,
          vx: (Math.random() - 0.5) * 8,
          vy: Math.random() * -4 - 2,
          life: 0,
        });
      }

      splashesRef.current.push({
        x,
        y,
        size: Math.random() * 8 + 4,
        opacity: 0.8,
        life: 0,
        maxLife: 30,
        particles,
      });
    };

    initRain();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw raindrops
      raindropsRef.current.forEach((drop, index) => {
        // Update position
        drop.y += drop.speed;
        drop.x += drop.angle * drop.speed;

        // Create splash when hitting bottom
        if (drop.y > canvas.height) {
          if (Math.random() < 0.3) { // 30% chance to create splash
            createSplash(drop.x, canvas.height);
          }
          
          // Reset raindrop
          drop.x = Math.random() * (canvas.width + 200) - 100;
          drop.y = -drop.length;
          drop.speed = Math.random() * 8 + 12;
        }

        // Remove raindrops that are too far off screen
        if (drop.x < -100 || drop.x > canvas.width + 100) {
          drop.x = Math.random() * (canvas.width + 200) - 100;
          drop.y = -drop.length;
        }

        // Draw raindrop
        ctx.save();
        ctx.globalAlpha = drop.opacity;
        ctx.strokeStyle = '#87CEEB';
        ctx.lineWidth = drop.width;
        ctx.lineCap = 'round';

        // Add slight glow
        ctx.shadowBlur = 2;
        ctx.shadowColor = '#87CEEB';

        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.angle * drop.length, drop.y - drop.length);
        ctx.stroke();

        // Brighter core
        ctx.globalAlpha = drop.opacity * 0.8;
        ctx.strokeStyle = '#B0E0E6';
        ctx.lineWidth = drop.width * 0.5;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.angle * drop.length, drop.y - drop.length);
        ctx.stroke();

        ctx.restore();
      });

      // Update and draw splashes
      splashesRef.current.forEach((splash, index) => {
        splash.life++;
        splash.opacity = Math.max(0, 1 - splash.life / splash.maxLife);

        // Update splash particles
        splash.particles.forEach((particle) => {
          particle.life++;
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vy += 0.3; // Gravity
          particle.vx *= 0.98; // Air resistance
        });

        // Draw splash particles
        ctx.save();
        ctx.globalAlpha = splash.opacity;
        
        splash.particles.forEach((particle) => {
          const particleOpacity = Math.max(0, 1 - particle.life / 20);
          ctx.globalAlpha = splash.opacity * particleOpacity;
          
          // Draw particle
          ctx.fillStyle = '#87CEEB';
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
          ctx.fill();

          // Draw small trail
          ctx.strokeStyle = '#B0E0E6';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x - particle.vx, particle.y - particle.vy);
          ctx.stroke();
        });

        // Draw main splash circle
        ctx.globalAlpha = splash.opacity * 0.3;
        ctx.strokeStyle = '#87CEEB';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(splash.x, splash.y, splash.size * (splash.life / splash.maxLife), 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        // Remove old splashes
        if (splash.life > splash.maxLife) {
          splashesRef.current.splice(index, 1);
        }
      });

      // Occasionally add new raindrops for varying intensity
      if (Math.random() < 0.1 && raindropsRef.current.length < 200) {
        createRaindrop();
      }

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