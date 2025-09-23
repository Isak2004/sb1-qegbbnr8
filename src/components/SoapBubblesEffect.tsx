import React, { useEffect, useRef } from 'react';

interface Bubble {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  drift: number;
  wobble: number;
  wobbleSpeed: number;
  hue: number;
  life: number;
  maxLife: number;
}

interface SoapBubblesEffectProps {
  isActive: boolean;
}

export const SoapBubblesEffect: React.FC<SoapBubblesEffectProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
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

    // Initialize bubbles
    const initBubbles = () => {
      bubblesRef.current = [];
      for (let i = 0; i < 25; i++) {
        createBubble();
      }
    };

    const createBubble = () => {
      const maxLife = Math.random() * 300 + 200;
      bubblesRef.current.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 100,
        size: Math.random() * 40 + 20,
        speed: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.4,
        drift: Math.random() * 2 - 1,
        wobble: 0,
        wobbleSpeed: Math.random() * 0.02 + 0.01,
        hue: Math.random() * 60 + 180, // Blue to cyan range
        life: 0,
        maxLife: maxLife,
      });
    };

    initBubbles();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      timeRef.current += 1;

      // Occasionally create new bubbles
      if (Math.random() < 0.02 && bubblesRef.current.length < 30) {
        createBubble();
      }

      bubblesRef.current.forEach((bubble, index) => {
        // Update bubble physics
        bubble.life += 1;
        bubble.y -= bubble.speed;
        bubble.x += bubble.drift + Math.sin(bubble.wobble) * 0.5;
        bubble.wobble += bubble.wobbleSpeed;

        // Age-based opacity fade
        const ageRatio = bubble.life / bubble.maxLife;
        bubble.opacity = Math.max(0, 1 - ageRatio) * 0.8;

        // Remove old or off-screen bubbles
        if (bubble.y < -bubble.size - 50 || bubble.life > bubble.maxLife || bubble.opacity <= 0) {
          bubblesRef.current.splice(index, 1);
          return;
        }

        // Keep bubbles within horizontal bounds with wrapping
        if (bubble.x > canvas.width + bubble.size) {
          bubble.x = -bubble.size;
        } else if (bubble.x < -bubble.size) {
          bubble.x = canvas.width + bubble.size;
        }

        // Draw 3D bubble
        drawBubble(ctx, bubble);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const drawBubble = (ctx: CanvasRenderingContext2D, bubble: Bubble) => {
      ctx.save();
      ctx.globalAlpha = bubble.opacity;

      // Main bubble body with radial gradient for 3D effect
      const mainGradient = ctx.createRadialGradient(
        bubble.x - bubble.size * 0.3,
        bubble.y - bubble.size * 0.3,
        0,
        bubble.x,
        bubble.y,
        bubble.size
      );

      // Create iridescent colors
      const hue1 = (bubble.hue + Math.sin(timeRef.current * 0.01 + bubble.x * 0.01) * 30) % 360;
      const hue2 = (bubble.hue + 60 + Math.cos(timeRef.current * 0.01 + bubble.y * 0.01) * 30) % 360;
      const hue3 = (bubble.hue + 120) % 360;

      mainGradient.addColorStop(0, `hsla(${hue1}, 70%, 80%, 0.1)`);
      mainGradient.addColorStop(0.3, `hsla(${hue2}, 60%, 70%, 0.3)`);
      mainGradient.addColorStop(0.7, `hsla(${hue3}, 50%, 60%, 0.4)`);
      mainGradient.addColorStop(1, `hsla(${bubble.hue}, 40%, 50%, 0.6)`);

      // Draw main bubble
      ctx.fillStyle = mainGradient;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
      ctx.fill();

      // Add rim highlight for 3D effect
      ctx.globalAlpha = bubble.opacity * 0.8;
      ctx.strokeStyle = `hsla(${hue1}, 80%, 90%, 0.6)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.size - 1, 0, Math.PI * 2);
      ctx.stroke();

      // Primary highlight (top-left)
      ctx.globalAlpha = bubble.opacity * 0.9;
      const highlight1Gradient = ctx.createRadialGradient(
        bubble.x - bubble.size * 0.4,
        bubble.y - bubble.size * 0.4,
        0,
        bubble.x - bubble.size * 0.4,
        bubble.y - bubble.size * 0.4,
        bubble.size * 0.3
      );
      highlight1Gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      highlight1Gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
      highlight1Gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = highlight1Gradient;
      ctx.beginPath();
      ctx.arc(
        bubble.x - bubble.size * 0.4,
        bubble.y - bubble.size * 0.4,
        bubble.size * 0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Secondary highlight (smaller, top-right)
      ctx.globalAlpha = bubble.opacity * 0.6;
      const highlight2Gradient = ctx.createRadialGradient(
        bubble.x + bubble.size * 0.2,
        bubble.y - bubble.size * 0.6,
        0,
        bubble.x + bubble.size * 0.2,
        bubble.y - bubble.size * 0.6,
        bubble.size * 0.15
      );
      highlight2Gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      highlight2Gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = highlight2Gradient;
      ctx.beginPath();
      ctx.arc(
        bubble.x + bubble.size * 0.2,
        bubble.y - bubble.size * 0.6,
        bubble.size * 0.15,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Bottom reflection for extra 3D depth
      ctx.globalAlpha = bubble.opacity * 0.3;
      const bottomGradient = ctx.createRadialGradient(
        bubble.x,
        bubble.y + bubble.size * 0.3,
        0,
        bubble.x,
        bubble.y + bubble.size * 0.3,
        bubble.size * 0.4
      );
      bottomGradient.addColorStop(0, `hsla(${hue2}, 60%, 90%, 0.3)`);
      bottomGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = bottomGradient;
      ctx.beginPath();
      ctx.arc(
        bubble.x,
        bubble.y + bubble.size * 0.3,
        bubble.size * 0.4,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Subtle shadow effect
      ctx.globalAlpha = bubble.opacity * 0.1;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(bubble.x + 2, bubble.y + 2, bubble.size, 0, Math.PI * 2);
      ctx.fill();

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
    />
  );
};