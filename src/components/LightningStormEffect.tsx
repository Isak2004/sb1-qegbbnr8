import React, { useEffect, useRef } from 'react';

interface LightningBolt {
  segments: { x: number; y: number }[];
  opacity: number;
  life: number;
  maxLife: number;
  thickness: number;
  color: string;
  branches: { segments: { x: number; y: number }[]; opacity: number }[];
}

interface LightningStormEffectProps {
  isActive: boolean;
}

export const LightningStormEffect: React.FC<LightningStormEffectProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boltsRef = useRef<LightningBolt[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const flashRef = useRef<{ opacity: number; life: number }>({ opacity: 0, life: 0 });

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

    // Generate lightning bolt path
    const generateLightningPath = (startX: number, startY: number, endX: number, endY: number, segments: number = 20) => {
      const path: { x: number; y: number }[] = [];
      
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        let x = startX + (endX - startX) * t;
        let y = startY + (endY - startY) * t;
        
        // Add randomness (jagged effect)
        if (i > 0 && i < segments) {
          x += (Math.random() - 0.5) * 60;
          y += (Math.random() - 0.5) * 30;
        }
        
        path.push({ x, y });
      }
      
      return path;
    };

    // Generate branches for lightning
    const generateBranches = (mainPath: { x: number; y: number }[], branchCount: number = 3) => {
      const branches: { segments: { x: number; y: number }[]; opacity: number }[] = [];
      
      for (let i = 0; i < branchCount; i++) {
        const branchStart = Math.floor(Math.random() * (mainPath.length - 2)) + 1;
        const startPoint = mainPath[branchStart];
        
        const branchLength = Math.random() * 100 + 50;
        const branchAngle = (Math.random() - 0.5) * Math.PI * 0.8;
        
        const endX = startPoint.x + Math.cos(branchAngle) * branchLength;
        const endY = startPoint.y + Math.sin(branchAngle) * branchLength;
        
        const branchSegments = generateLightningPath(
          startPoint.x, startPoint.y, endX, endY, 8
        );
        
        branches.push({
          segments: branchSegments,
          opacity: Math.random() * 0.8 + 0.2
        });
      }
      
      return branches;
    };

    // Create lightning bolt
    const createLightningBolt = () => {
      const startX = Math.random() * canvas.width;
      const startY = 0;
      const endX = startX + (Math.random() - 0.5) * 200;
      const endY = canvas.height;
      
      const segments = generateLightningPath(startX, startY, endX, endY, 25);
      const branches = generateBranches(segments);
      
      const colors = [
        '#FFFFFF',
        '#E6E6FA',
        '#B0C4DE',
        '#87CEEB',
        '#ADD8E6'
      ];
      
      boltsRef.current.push({
        segments,
        opacity: 1,
        life: 0,
        maxLife: Math.random() * 20 + 10,
        thickness: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        branches
      });

      // Trigger screen flash
      flashRef.current = { opacity: 0.3, life: 0 };
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      timeRef.current += 1;

      // Randomly create lightning bolts
      if (Math.random() < 0.008) { // About every 125 frames on average
        createLightningBolt();
      }

      // Update and draw lightning bolts
      boltsRef.current.forEach((bolt, index) => {
        bolt.life++;
        bolt.opacity = Math.max(0, 1 - bolt.life / bolt.maxLife);

        if (bolt.life > bolt.maxLife) {
          boltsRef.current.splice(index, 1);
          return;
        }

        // Draw main lightning bolt
        ctx.save();
        ctx.globalAlpha = bolt.opacity;
        ctx.strokeStyle = bolt.color;
        ctx.lineWidth = bolt.thickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 15;
        ctx.shadowColor = bolt.color;

        // Draw main path
        ctx.beginPath();
        bolt.segments.forEach((segment, i) => {
          if (i === 0) {
            ctx.moveTo(segment.x, segment.y);
          } else {
            ctx.lineTo(segment.x, segment.y);
          }
        });
        ctx.stroke();

        // Draw inner bright core
        ctx.globalAlpha = bolt.opacity * 1.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = bolt.thickness * 0.3;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        bolt.segments.forEach((segment, i) => {
          if (i === 0) {
            ctx.moveTo(segment.x, segment.y);
          } else {
            ctx.lineTo(segment.x, segment.y);
          }
        });
        ctx.stroke();

        // Draw branches
        bolt.branches.forEach((branch) => {
          ctx.globalAlpha = bolt.opacity * branch.opacity * 0.7;
          ctx.strokeStyle = bolt.color;
          ctx.lineWidth = bolt.thickness * 0.6;
          ctx.shadowBlur = 10;

          ctx.beginPath();
          branch.segments.forEach((segment, i) => {
            if (i === 0) {
              ctx.moveTo(segment.x, segment.y);
            } else {
              ctx.lineTo(segment.x, segment.y);
            }
          });
          ctx.stroke();

          // Branch core
          ctx.globalAlpha = bolt.opacity * branch.opacity;
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = bolt.thickness * 0.2;
          ctx.shadowBlur = 5;
          ctx.beginPath();
          branch.segments.forEach((segment, i) => {
            if (i === 0) {
              ctx.moveTo(segment.x, segment.y);
            } else {
              ctx.lineTo(segment.x, segment.y);
            }
          });
          ctx.stroke();
        });

        ctx.restore();
      });

      // Update and draw screen flash
      if (flashRef.current.opacity > 0) {
        flashRef.current.life++;
        flashRef.current.opacity = Math.max(0, flashRef.current.opacity - 0.02);

        ctx.save();
        ctx.globalAlpha = flashRef.current.opacity;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // Add atmospheric glow during storms
      if (boltsRef.current.length > 0) {
        ctx.save();
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
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