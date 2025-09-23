import React, { useEffect, useRef } from 'react';

interface Flare {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  offset: number;
}

interface SunflareEffectProps {
  isActive: boolean;
}

export const SunflareEffect: React.FC<SunflareEffectProps> = ({ isActive }) => {
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

      timeRef.current += 0.01;

      // Calculate sun position (moves in a slow arc across the screen)
      const sunX = canvas.width * 0.5 + Math.cos(timeRef.current * 0.3) * canvas.width * 0.4;
      const sunY = canvas.height * 0.3 + Math.sin(timeRef.current * 0.2) * canvas.height * 0.2;

      // Draw main sun
      drawSun(ctx, sunX, sunY);

      // Draw lens flares
      drawLensFlares(ctx, sunX, sunY, canvas.width, canvas.height);

      // Draw light rays
      drawLightRays(ctx, sunX, sunY, canvas.width, canvas.height);

      animationRef.current = requestAnimationFrame(animate);
    };

    const drawSun = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      // Main sun glow
      const sunRadius = 60;
      const glowRadius = 150;

      // Outer glow
      const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      outerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      outerGlow.addColorStop(0.1, 'rgba(255, 255, 200, 0.6)');
      outerGlow.addColorStop(0.3, 'rgba(255, 200, 100, 0.4)');
      outerGlow.addColorStop(0.6, 'rgba(255, 150, 50, 0.2)');
      outerGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');

      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Inner sun
      const innerGlow = ctx.createRadialGradient(x, y, 0, x, y, sunRadius);
      innerGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
      innerGlow.addColorStop(0.3, 'rgba(255, 255, 150, 0.9)');
      innerGlow.addColorStop(0.7, 'rgba(255, 200, 100, 0.7)');
      innerGlow.addColorStop(1, 'rgba(255, 150, 50, 0.5)');

      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(x, y, sunRadius, 0, Math.PI * 2);
      ctx.fill();

      // Core
      const coreGlow = ctx.createRadialGradient(x, y, 0, x, y, 20);
      coreGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
      coreGlow.addColorStop(1, 'rgba(255, 255, 255, 0.8)');

      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawLensFlares = (ctx: CanvasRenderingContext2D, sunX: number, sunY: number, width: number, height: number) => {
      // Center of screen for flare alignment
      const centerX = width / 2;
      const centerY = height / 2;

      // Vector from sun to center
      const dx = centerX - sunX;
      const dy = centerY - sunY;

      // Create lens flares along this line
      const flares: Flare[] = [
        { x: 0, y: 0, size: 40, opacity: 0.6, color: 'rgba(255, 200, 100, ', offset: 0.2 },
        { x: 0, y: 0, size: 25, opacity: 0.4, color: 'rgba(100, 200, 255, ', offset: 0.4 },
        { x: 0, y: 0, size: 60, opacity: 0.3, color: 'rgba(255, 100, 200, ', offset: 0.6 },
        { x: 0, y: 0, size: 30, opacity: 0.5, color: 'rgba(200, 255, 100, ', offset: 0.8 },
        { x: 0, y: 0, size: 45, opacity: 0.4, color: 'rgba(255, 150, 255, ', offset: 1.0 },
        { x: 0, y: 0, size: 20, opacity: 0.6, color: 'rgba(100, 255, 255, ', offset: 1.2 },
        { x: 0, y: 0, size: 35, opacity: 0.3, color: 'rgba(255, 255, 100, ', offset: 1.4 },
      ];

      flares.forEach((flare) => {
        // Position flare along the line from sun to center
        flare.x = sunX + dx * flare.offset;
        flare.y = sunY + dy * flare.offset;

        // Add some movement
        const wobble = Math.sin(timeRef.current * 2 + flare.offset * 10) * 5;
        flare.x += wobble;
        flare.y += wobble;

        // Draw flare
        const gradient = ctx.createRadialGradient(
          flare.x, flare.y, 0,
          flare.x, flare.y, flare.size
        );
        gradient.addColorStop(0, flare.color + (flare.opacity * 0.8) + ')');
        gradient.addColorStop(0.5, flare.color + (flare.opacity * 0.4) + ')');
        gradient.addColorStop(1, flare.color + '0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(flare.x, flare.y, flare.size, 0, Math.PI * 2);
        ctx.fill();

        // Add hexagonal flare shape for some flares
        if (flare.offset === 0.6 || flare.offset === 1.0) {
          drawHexagonalFlare(ctx, flare.x, flare.y, flare.size * 0.7, flare.color, flare.opacity * 0.6);
        }
      });
    };

    const drawHexagonalFlare = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color + opacity + ')';
      
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const px = x + Math.cos(angle) * size;
        const py = y + Math.sin(angle) * size;
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawLightRays = (ctx: CanvasRenderingContext2D, sunX: number, sunY: number, width: number, height: number) => {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // Draw multiple light rays
      const rayCount = 12;
      const rayLength = Math.max(width, height);

      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + timeRef.current * 0.5;
        const rayWidth = 3 + Math.sin(timeRef.current * 3 + i) * 2;
        
        // Calculate ray end point
        const endX = sunX + Math.cos(angle) * rayLength;
        const endY = sunY + Math.sin(angle) * rayLength;

        // Create gradient for ray
        const rayGradient = ctx.createLinearGradient(sunX, sunY, endX, endY);
        rayGradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
        rayGradient.addColorStop(0.1, 'rgba(255, 255, 150, 0.6)');
        rayGradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.3)');
        rayGradient.addColorStop(0.6, 'rgba(255, 150, 50, 0.1)');
        rayGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

        ctx.strokeStyle = rayGradient;
        ctx.lineWidth = rayWidth;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      // Add some shorter, brighter rays
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + timeRef.current * -0.3;
        const rayLength2 = 200 + Math.sin(timeRef.current * 2 + i) * 50;
        const rayWidth2 = 6 + Math.cos(timeRef.current * 4 + i) * 3;
        
        const endX = sunX + Math.cos(angle) * rayLength2;
        const endY = sunY + Math.sin(angle) * rayLength2;

        const rayGradient2 = ctx.createLinearGradient(sunX, sunY, endX, endY);
        rayGradient2.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        rayGradient2.addColorStop(0.2, 'rgba(255, 255, 200, 0.7)');
        rayGradient2.addColorStop(0.5, 'rgba(255, 200, 100, 0.4)');
        rayGradient2.addColorStop(1, 'rgba(255, 150, 50, 0)');

        ctx.strokeStyle = rayGradient2;
        ctx.lineWidth = rayWidth2;

        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      ctx.restore();
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
      style={{ mixBlendMode: 'screen' }}
    />
  );
};