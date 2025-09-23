import React, { useEffect, useRef } from 'react';

interface Flare {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  type: 'circular' | 'hexagonal' | 'starburst' | 'ring';
  offset: number;
  rotation: number;
}

interface LensFlareEffectProps {
  isActive: boolean;
}

export const LensFlareEffect: React.FC<LensFlareEffectProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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

    // Mouse tracking for interactive flares
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      timeRef.current += 0.02;

      // Primary light source position (follows mouse with offset)
      const lightX = mouseRef.current.x + Math.cos(timeRef.current * 0.5) * 100;
      const lightY = mouseRef.current.y + Math.sin(timeRef.current * 0.3) * 50;

      // Screen center for flare alignment
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Vector from light to center
      const dx = centerX - lightX;
      const dy = centerY - lightY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Draw main light source
      drawMainLight(ctx, lightX, lightY);

      // Create lens flares along the light-to-center line
      const flares: Flare[] = [
        { x: 0, y: 0, size: 60, opacity: 0.8, color: 'rgba(255, 255, 255, ', type: 'circular', offset: 0.1, rotation: 0 },
        { x: 0, y: 0, size: 40, opacity: 0.6, color: 'rgba(100, 150, 255, ', type: 'hexagonal', offset: 0.25, rotation: timeRef.current * 0.5 },
        { x: 0, y: 0, size: 80, opacity: 0.4, color: 'rgba(255, 100, 150, ', type: 'ring', offset: 0.4, rotation: 0 },
        { x: 0, y: 0, size: 35, opacity: 0.7, color: 'rgba(150, 255, 100, ', type: 'circular', offset: 0.6, rotation: 0 },
        { x: 0, y: 0, size: 120, opacity: 0.3, color: 'rgba(255, 200, 100, ', type: 'starburst', offset: 0.8, rotation: timeRef.current * -0.3 },
        { x: 0, y: 0, size: 25, opacity: 0.8, color: 'rgba(100, 255, 255, ', type: 'hexagonal', offset: 1.0, rotation: timeRef.current * 0.7 },
        { x: 0, y: 0, size: 90, opacity: 0.2, color: 'rgba(255, 150, 255, ', type: 'ring', offset: 1.2, rotation: 0 },
        { x: 0, y: 0, size: 45, opacity: 0.5, color: 'rgba(255, 255, 150, ', type: 'circular', offset: 1.4, rotation: 0 },
        { x: 0, y: 0, size: 30, opacity: 0.6, color: 'rgba(200, 100, 255, ', type: 'hexagonal', offset: 1.6, rotation: timeRef.current * -0.4 },
      ];

      // Position and draw flares
      flares.forEach((flare) => {
        flare.x = lightX + dx * flare.offset;
        flare.y = lightY + dy * flare.offset;

        // Add subtle movement
        const wobble = Math.sin(timeRef.current * 3 + flare.offset * 10) * 3;
        flare.x += wobble;
        flare.y += wobble;

        // Fade based on distance from light source
        const distanceFactor = Math.max(0, 1 - distance / (canvas.width * 0.8));
        const adjustedOpacity = flare.opacity * distanceFactor;

        drawFlare(ctx, flare, adjustedOpacity);
      });

      // Draw chromatic aberration around main light
      drawChromaticAberration(ctx, lightX, lightY);

      // Draw anamorphic streaks
      drawAnamorphicStreaks(ctx, lightX, lightY, distance);

      animationRef.current = requestAnimationFrame(animate);
    };

    const drawMainLight = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      // Outer glow
      const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, 120);
      outerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      outerGlow.addColorStop(0.2, 'rgba(255, 255, 200, 0.6)');
      outerGlow.addColorStop(0.5, 'rgba(255, 200, 100, 0.3)');
      outerGlow.addColorStop(1, 'rgba(255, 150, 50, 0)');

      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(x, y, 120, 0, Math.PI * 2);
      ctx.fill();

      // Core light
      const coreGlow = ctx.createRadialGradient(x, y, 0, x, y, 30);
      coreGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
      coreGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
      coreGlow.addColorStop(1, 'rgba(255, 255, 255, 0.4)');

      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawFlare = (ctx: CanvasRenderingContext2D, flare: Flare, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(flare.x, flare.y);
      ctx.rotate(flare.rotation);

      switch (flare.type) {
        case 'circular':
          drawCircularFlare(ctx, flare);
          break;
        case 'hexagonal':
          drawHexagonalFlare(ctx, flare);
          break;
        case 'starburst':
          drawStarburstFlare(ctx, flare);
          break;
        case 'ring':
          drawRingFlare(ctx, flare);
          break;
      }

      ctx.restore();
    };

    const drawCircularFlare = (ctx: CanvasRenderingContext2D, flare: Flare) => {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, flare.size);
      gradient.addColorStop(0, flare.color + '0.8)');
      gradient.addColorStop(0.3, flare.color + '0.6)');
      gradient.addColorStop(0.7, flare.color + '0.2)');
      gradient.addColorStop(1, flare.color + '0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, flare.size, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawHexagonalFlare = (ctx: CanvasRenderingContext2D, flare: Flare) => {
      ctx.fillStyle = flare.color + '0.6)';
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * flare.size;
        const y = Math.sin(angle) * flare.size;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();

      // Inner glow
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, flare.size * 0.7);
      gradient.addColorStop(0, flare.color + '0.8)');
      gradient.addColorStop(1, flare.color + '0)');
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    const drawStarburstFlare = (ctx: CanvasRenderingContext2D, flare: Flare) => {
      const spikes = 8;
      ctx.strokeStyle = flare.color + '0.6)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      for (let i = 0; i < spikes; i++) {
        const angle = (i * Math.PI * 2) / spikes;
        const x = Math.cos(angle) * flare.size;
        const y = Math.sin(angle) * flare.size;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      // Center glow
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, flare.size * 0.3);
      gradient.addColorStop(0, flare.color + '0.8)');
      gradient.addColorStop(1, flare.color + '0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, flare.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawRingFlare = (ctx: CanvasRenderingContext2D, flare: Flare) => {
      const innerRadius = flare.size * 0.6;
      const outerRadius = flare.size;

      // Outer ring
      ctx.strokeStyle = flare.color + '0.6)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner ring
      ctx.strokeStyle = flare.color + '0.8)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
      ctx.stroke();
    };

    const drawChromaticAberration = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      const offset = 3;
      
      // Red channel
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.3;
      const redGradient = ctx.createRadialGradient(x - offset, y, 0, x - offset, y, 40);
      redGradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
      redGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = redGradient;
      ctx.beginPath();
      ctx.arc(x - offset, y, 40, 0, Math.PI * 2);
      ctx.fill();

      // Green channel
      const greenGradient = ctx.createRadialGradient(x, y, 0, x, y, 40);
      greenGradient.addColorStop(0, 'rgba(0, 255, 0, 0.8)');
      greenGradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
      ctx.fillStyle = greenGradient;
      ctx.beginPath();
      ctx.arc(x, y, 40, 0, Math.PI * 2);
      ctx.fill();

      // Blue channel
      const blueGradient = ctx.createRadialGradient(x + offset, y, 0, x + offset, y, 40);
      blueGradient.addColorStop(0, 'rgba(0, 0, 255, 0.8)');
      blueGradient.addColorStop(1, 'rgba(0, 0, 255, 0)');
      ctx.fillStyle = blueGradient;
      ctx.beginPath();
      ctx.arc(x + offset, y, 40, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawAnamorphicStreaks = (ctx: CanvasRenderingContext2D, x: number, y: number, intensity: number) => {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = Math.min(0.6, intensity / 200);

      // Horizontal streak
      const horizontalGradient = ctx.createLinearGradient(x - 200, y, x + 200, y);
      horizontalGradient.addColorStop(0, 'rgba(100, 150, 255, 0)');
      horizontalGradient.addColorStop(0.4, 'rgba(100, 150, 255, 0.6)');
      horizontalGradient.addColorStop(0.6, 'rgba(100, 150, 255, 0.6)');
      horizontalGradient.addColorStop(1, 'rgba(100, 150, 255, 0)');

      ctx.fillStyle = horizontalGradient;
      ctx.fillRect(x - 200, y - 2, 400, 4);

      // Vertical streak
      const verticalGradient = ctx.createLinearGradient(x, y - 200, x, y + 200);
      verticalGradient.addColorStop(0, 'rgba(255, 150, 100, 0)');
      verticalGradient.addColorStop(0.4, 'rgba(255, 150, 100, 0.4)');
      verticalGradient.addColorStop(0.6, 'rgba(255, 150, 100, 0.4)');
      verticalGradient.addColorStop(1, 'rgba(255, 150, 100, 0)');

      ctx.fillStyle = verticalGradient;
      ctx.fillRect(x - 2, y - 200, 4, 400);

      ctx.restore();
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
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