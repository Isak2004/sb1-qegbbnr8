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

      // Calculate spotlight position using smooth circular motion
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radiusX = canvas.width * 0.3;
      const radiusY = canvas.height * 0.25;
      
      const spotlightX = centerX + Math.cos(timeRef.current) * radiusX;
      const spotlightY = centerY + Math.sin(timeRef.current * 0.7) * radiusY;

      // Create radial gradient for spotlight effect
      const spotlightRadius = Math.min(canvas.width, canvas.height) * 0.4;
      const gradient = ctx.createRadialGradient(
        spotlightX, spotlightY, 0,
        spotlightX, spotlightY, spotlightRadius
      );

      // Gradient stops for spotlight effect
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)'); // Transparent center (bright)
      gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.1)'); // Slight darkening
      gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.4)'); // More darkening
      gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.7)'); // Heavy darkening
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)'); // Very dark edges

      // Fill the entire canvas with the gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add a subtle inner glow effect at the spotlight center
      const innerGlow = ctx.createRadialGradient(
        spotlightX, spotlightY, 0,
        spotlightX, spotlightY, spotlightRadius * 0.2
      );
      innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      innerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = innerGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add some subtle flickering to make it more realistic
      const flicker = 0.95 + Math.sin(timeRef.current * 15) * 0.05;
      ctx.globalAlpha = flicker;

      // Redraw the main spotlight with flicker
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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