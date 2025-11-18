import React, { useEffect, useRef } from 'react';

interface DustParticle {
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
  driftSpeed: number;
}

interface DustParticlesEffectProps {
  isActive: boolean;
}

export const DustParticlesEffect: React.FC<DustParticlesEffectProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<DustParticle[]>([]);
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

    // Dust colors (warm, earthy tones)
    const dustColors = [
      'rgba(139, 125, 107, ', // Warm brown
      'rgba(160, 142, 122, ', // Light brown
      'rgba(205, 192, 176, ', // Beige
      'rgba(218, 206, 190, ', // Light beige
      'rgba(245, 235, 220, ', // Antique white
      'rgba(222, 184, 135, ', // Burlywood
      'rgba(188, 143, 143, ', // Rosy brown
      'rgba(210, 180, 140, ', // Tan
    ];

    // Create dust particle
    const createDustParticle = (x?: number, y?: number) => {
      const startX = x !== undefined ? x : Math.random() * canvas.width;
      const startY = y !== undefined ? y : Math.random() * canvas.height;
      
      particlesRef.current.push({
        x: startX,
        y: startY,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 3 + 1,
        opacity: 0,
        maxOpacity: Math.random() * 0.4 + 0.1,
        life: 0,
        maxLife: Math.random() * 400 + 200,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        color: dustColors[Math.floor(Math.random() * dustColors.length)],
        driftSpeed: Math.random() * 0.2 + 0.1,
      });
    };

    // Initialize particles
    for (let i = 0; i < 80; i++) {
      createDustParticle();
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      timeRef.current += 1;

      // Occasionally create new dust particles
      if (Math.random() < 0.02) {
        // Sometimes create from edges (like dust being stirred up)
        const edge = Math.random();
        if (edge < 0.25) {
          createDustParticle(-10, Math.random() * canvas.height); // Left edge
        } else if (edge < 0.5) {
          createDustParticle(canvas.width + 10, Math.random() * canvas.height); // Right edge
        } else if (edge < 0.75) {
          createDustParticle(Math.random() * canvas.width, -10); // Top edge
        } else {
          createDustParticle(Math.random() * canvas.width, canvas.height + 10); // Bottom edge
        }
      }

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        // Update physics
        particle.life++;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;

        // Add gentle floating motion
        particle.x += Math.sin(timeRef.current * 0.01 + particle.x * 0.001) * particle.driftSpeed;
        particle.y += Math.cos(timeRef.current * 0.008 + particle.y * 0.001) * particle.driftSpeed * 0.5;

        // Very subtle gravity
        particle.vy += 0.001;

        // Air resistance
        particle.vx *= 0.999;
        particle.vy *= 0.999;

        // Opacity lifecycle
        const ageRatio = particle.life / particle.maxLife;
        if (ageRatio < 0.1) {
          // Fade in
          particle.opacity = (ageRatio / 0.1) * particle.maxOpacity;
        } else if (ageRatio > 0.8) {
          // Fade out
          particle.opacity = particle.maxOpacity * (1 - (ageRatio - 0.8) / 0.2);
        } else {
          // Stable visibility with slight variation
          particle.opacity = particle.maxOpacity * (0.8 + Math.sin(timeRef.current * 0.02 + particle.life * 0.01) * 0.2);
        }

        // Remove old particles
        if (particle.life > particle.maxLife || 
            particle.x < -50 || particle.x > canvas.width + 50 ||
            particle.y < -50 || particle.y > canvas.height + 50) {
          particlesRef.current.splice(index, 1);
          return;
        }

        // Draw dust particle
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.globalAlpha = particle.opacity;

        // Outer soft glow
        const outerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 2);
        outerGradient.addColorStop(0, particle.color + (particle.opacity * 0.3) + ')');
        outerGradient.addColorStop(0.5, particle.color + (particle.opacity * 0.1) + ')');
        outerGradient.addColorStop(1, particle.color + '0)');

        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Main particle body (slightly irregular shape)
        ctx.globalAlpha = particle.opacity * 0.8;
        const mainGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
        mainGradient.addColorStop(0, particle.color + (particle.opacity * 0.8) + ')');
        mainGradient.addColorStop(0.7, particle.color + (particle.opacity * 0.4) + ')');
        mainGradient.addColorStop(1, particle.color + '0)');

        ctx.fillStyle = mainGradient;
        
        // Draw slightly irregular dust particle shape
        ctx.beginPath();
        const points = 6;
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const radius = particle.size * (0.8 + Math.random() * 0.4);
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.fill();

        // Subtle highlight
        ctx.globalAlpha = particle.opacity * 0.3;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(-particle.size * 0.3, -particle.size * 0.3, particle.size * 0.4, 0, Math.PI * 2);
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