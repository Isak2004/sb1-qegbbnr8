import React, { useEffect, useRef } from 'react';

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
}

interface SmokeWispsEffectProps {
  isActive: boolean;
}

export const SmokeWispsEffect: React.FC<SmokeWispsEffectProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<SmokeParticle[]>([]);
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

    // Smoke colors (various grays and whites)
    const smokeColors = [
      'rgba(200, 200, 200, ',
      'rgba(180, 180, 180, ',
      'rgba(220, 220, 220, ',
      'rgba(160, 160, 160, ',
      'rgba(240, 240, 240, ',
      'rgba(190, 190, 190, ',
    ];

    // Create smoke particle
    const createSmokeParticle = (x?: number, y?: number) => {
      const startX = x !== undefined ? x : Math.random() * canvas.width;
      const startY = y !== undefined ? y : canvas.height + 20;
      
      particlesRef.current.push({
        x: startX,
        y: startY,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 2 - 1,
        size: Math.random() * 30 + 20,
        opacity: Math.random() * 0.6 + 0.3,
        life: 0,
        maxLife: Math.random() * 200 + 150,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        color: smokeColors[Math.floor(Math.random() * smokeColors.length)],
      });
    };

    // Initialize particles
    for (let i = 0; i < 15; i++) {
      createSmokeParticle(
        Math.random() * canvas.width,
        Math.random() * canvas.height
      );
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      timeRef.current += 1;

      // Occasionally create new smoke particles
      if (Math.random() < 0.03) {
        createSmokeParticle();
      }

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        // Update physics
        particle.life++;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;

        // Add wind effect
        particle.vx += Math.sin(timeRef.current * 0.01 + particle.x * 0.001) * 0.02;
        particle.vy += Math.cos(timeRef.current * 0.008 + particle.y * 0.001) * 0.01;

        // Slow down over time (air resistance)
        particle.vx *= 0.995;
        particle.vy *= 0.995;

        // Grow and fade over time
        const ageRatio = particle.life / particle.maxLife;
        particle.size += 0.2; // Smoke expands
        particle.opacity = Math.max(0, particle.opacity * 0.998); // Gradual fade

        // Remove old particles
        if (particle.life > particle.maxLife || particle.opacity < 0.01 || particle.y < -100) {
          particlesRef.current.splice(index, 1);
          return;
        }

        // Draw smoke particle with multiple layers for realistic effect
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.globalAlpha = particle.opacity;

        // Outer wispy layer
        const outerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 1.5);
        outerGradient.addColorStop(0, particle.color + (particle.opacity * 0.1) + ')');
        outerGradient.addColorStop(0.4, particle.color + (particle.opacity * 0.05) + ')');
        outerGradient.addColorStop(1, particle.color + '0)');

        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Main smoke body
        const mainGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
        mainGradient.addColorStop(0, particle.color + (particle.opacity * 0.4) + ')');
        mainGradient.addColorStop(0.5, particle.color + (particle.opacity * 0.2) + ')');
        mainGradient.addColorStop(1, particle.color + '0)');

        ctx.fillStyle = mainGradient;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Inner dense core
        const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 0.4);
        coreGradient.addColorStop(0, particle.color + (particle.opacity * 0.6) + ')');
        coreGradient.addColorStop(1, particle.color + (particle.opacity * 0.1) + ')');

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 0.4, 0, Math.PI * 2);
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