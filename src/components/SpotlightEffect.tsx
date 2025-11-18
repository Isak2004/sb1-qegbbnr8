import React, { useEffect, useRef } from 'react';

interface SpotlightEffectProps {
  isActive: boolean;
}

export const SpotlightEffect: React.FC<SpotlightEffectProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update time for smooth movement
      timeRef.current += 0.01;

      // Start with a lighter dark overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create 5 spotlights with different movement patterns
      const spotlights = [
        {
          x: canvas.width * 0.5 + Math.cos(timeRef.current) * canvas.width * 0.3,
          y: canvas.height * 0.5 + Math.sin(timeRef.current * 0.7) * canvas.height * 0.25,
          phase: 0
        },
        {
          x: canvas.width * 0.3 + Math.cos(timeRef.current * 1.3 + Math.PI) * canvas.width * 0.2,
          y: canvas.height * 0.3 + Math.sin(timeRef.current * 0.9 + Math.PI) * canvas.height * 0.2,
          phase: Math.PI / 2
        },
        {
          x: canvas.width * 0.7 + Math.cos(timeRef.current * 0.8 + Math.PI * 0.5) * canvas.width * 0.25,
          y: canvas.height * 0.7 + Math.sin(timeRef.current * 1.1 + Math.PI * 0.5) * canvas.height * 0.15,
          phase: Math.PI
        },
        {
          x: canvas.width * 0.2 + Math.cos(timeRef.current * 1.5 + Math.PI * 1.5) * canvas.width * 0.15,
          y: canvas.height * 0.8 + Math.sin(timeRef.current * 0.6 + Math.PI * 1.5) * canvas.height * 0.1,
          phase: Math.PI * 1.5
        },
        {
          x: canvas.width * 0.8 + Math.cos(timeRef.current * 0.9 + Math.PI * 0.25) * canvas.width * 0.2,
          y: canvas.height * 0.2 + Math.sin(timeRef.current * 1.2 + Math.PI * 0.25) * canvas.height * 0.2,
          phase: Math.PI * 0.25
        }
      ];

      // Set blend mode to lighten for spotlight effect
      ctx.globalCompositeOperation = 'lighten';

      // Draw each spotlight
      spotlights.forEach((spotlight, index) => {
        // Much smaller spotlight radius (about 1/3 of original)
        const spotlightRadius = Math.min(canvas.width, canvas.height) * 0.13;
        
        // Add flickering effect with different timing for each spotlight
        const flicker = 0.95 + Math.sin(timeRef.current * 15 + spotlight.phase) * 0.05;
        ctx.globalAlpha = flicker * 1.2; // Increased brightness
        
        // Create radial gradient for spotlight effect
        const gradient = ctx.createRadialGradient(
          spotlight.x, spotlight.y, 0,
          spotlight.x, spotlight.y, spotlightRadius
        );

        // Much tighter gradient for narrower bright center
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)'); // Much brighter center
        gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.9)'); // Very bright
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.6)'); // Still bright
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)'); // Gentle fade
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // Transparent edge

        // Draw the spotlight
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(spotlight.x, spotlight.y, spotlightRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Reset composite operation and alpha
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

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
      style={{ mixBlendMode: 'multiply' }}
    />
  );
};