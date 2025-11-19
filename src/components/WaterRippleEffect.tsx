import React, { useEffect, useRef } from 'react';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  maxOpacity: number;
  speed: number;
  life: number;
  maxLife: number;
  frequency: number;
  amplitude: number;
}

interface WaterRippleEffectProps {
  isActive: boolean;
}

export const WaterRippleEffect: React.FC<WaterRippleEffectProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
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

    // Create ripple
    const createRipple = (x?: number, y?: number) => {
      const startX = x !== undefined ? x : Math.random() * canvas.width;
      const startY = y !== undefined ? y : Math.random() * canvas.height;
      
      const maxRadius = Math.random() * 200 + 100;
      
      ripplesRef.current.push({
        x: startX,
        y: startY,
        radius: 0,
        maxRadius,
        opacity: 0,
        maxOpacity: Math.random() * 0.6 + 0.4,
        speed: Math.random() * 2 + 1,
        life: 0,
        maxLife: maxRadius / 2,
        frequency: Math.random() * 0.02 + 0.01,
        amplitude: Math.random() * 3 + 2,
      });
    };

    // Mouse interaction for ripples
    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() < 0.1) { // 10% chance on mouse move
        createRipple(e.clientX, e.clientY);
      }
    };

    const handleClick = (e: MouseEvent) => {
      createRipple(e.clientX, e.clientY);
      // Create multiple ripples for click
      setTimeout(() => createRipple(e.clientX + (Math.random() - 0.5) * 20, e.clientY + (Math.random() - 0.5) * 20), 100);
      setTimeout(() => createRipple(e.clientX + (Math.random() - 0.5) * 30, e.clientY + (Math.random() - 0.5) * 30), 200);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Initialize with some ripples
    for (let i = 0; i < 5; i++) {
      setTimeout(() => createRipple(), i * 500);
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      timeRef.current += 1;

      // Occasionally create random ripples
      if (Math.random() < 0.02) {
        createRipple();
      }

      // Update and draw ripples
      ripplesRef.current.forEach((ripple, index) => {
        ripple.life++;
        ripple.radius += ripple.speed;

        // Opacity lifecycle
        const ageRatio = ripple.life / ripple.maxLife;
        if (ageRatio < 0.1) {
          // Fade in
          ripple.opacity = (ageRatio / 0.1) * ripple.maxOpacity;
        } else if (ageRatio > 0.7) {
          // Fade out
          ripple.opacity = ripple.maxOpacity * (1 - (ageRatio - 0.7) / 0.3);
        } else {
          // Stable visibility
          ripple.opacity = ripple.maxOpacity;
        }

        // Remove old ripples
        if (ripple.radius > ripple.maxRadius || ripple.opacity <= 0) {
          ripplesRef.current.splice(index, 1);
          return;
        }

        // Draw ripple with multiple concentric circles for realistic effect
        ctx.save();
        ctx.globalAlpha = ripple.opacity;

        // Draw multiple ripple rings
        for (let ring = 0; ring < 3; ring++) {
          const ringRadius = ripple.radius - ring * 15;
          if (ringRadius > 0) {
            const ringOpacity = ripple.opacity * (1 - ring * 0.3);
            ctx.globalAlpha = ringOpacity;

            // Create gradient for water-like appearance
            const gradient = ctx.createRadialGradient(
              ripple.x, ripple.y, Math.max(0, ringRadius - 5),
              ripple.x, ripple.y, ringRadius + 5
            );
            gradient.addColorStop(0, 'rgba(135, 206, 235, 0)'); // Transparent center
            gradient.addColorStop(0.5, `rgba(135, 206, 235, ${ringOpacity})`); // Sky blue
            gradient.addColorStop(1, 'rgba(135, 206, 235, 0)'); // Transparent edge

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 3 - ring;
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, Math.max(0, ringRadius), 0, Math.PI * 2);
            ctx.stroke();

            // Add inner highlight for 3D effect
            ctx.globalAlpha = ringOpacity * 0.6;
            ctx.strokeStyle = `rgba(255, 255, 255, ${ringOpacity * 0.8})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, Math.max(0, ringRadius - 1), 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // Add shimmer effect
        if (Math.random() < 0.3) {
          ctx.globalAlpha = ripple.opacity * 0.5;
          const shimmerAngle = Math.random() * Math.PI * 2;
          const shimmerDistance = ripple.radius * 0.8;
          const shimmerX = ripple.x + Math.cos(shimmerAngle) * shimmerDistance;
          const shimmerY = ripple.y + Math.sin(shimmerAngle) * shimmerDistance;

          const shimmerGradient = ctx.createRadialGradient(
            shimmerX, shimmerY, 0,
            shimmerX, shimmerY, 8
          );
          shimmerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
          shimmerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.fillStyle = shimmerGradient;
          ctx.beginPath();
          ctx.arc(shimmerX, shimmerY, 8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
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