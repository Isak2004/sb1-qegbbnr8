import React, { useEffect, useRef } from 'react';

interface Tile {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  width: number;
  height: number;
  rotation: number;
  targetRotation: number;
  scale: number;
  targetScale: number;
  opacity: number;
  targetOpacity: number;
}

interface ScrambleEffectProps {
  isActive: boolean;
}

export const ScrambleEffect: React.FC<ScrambleEffectProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tilesRef = useRef<Tile[]>([]);
  const animationRef = useRef<number>();
  const imageRef = useRef<HTMLImageElement>();
  const phaseRef = useRef<'scrambling' | 'scrambled' | 'descrambling' | 'normal'>('normal');
  const timeRef = useRef<number>(0);
  const cycleTimeRef = useRef<number>(0);

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

    // Load the background image
    const loadImage = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageRef.current = img;
        initializeTiles();
        animate();
      };
      img.src = '/public/1758659008299-qbolrp.jpeg';
    };

    // Initialize tiles
    const initializeTiles = () => {
      if (!imageRef.current) return;

      const tileSize = 80;
      const cols = Math.ceil(canvas.width / tileSize);
      const rows = Math.ceil(canvas.height / tileSize);

      tilesRef.current = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * tileSize;
          const y = row * tileSize;
          
          tilesRef.current.push({
            x,
            y,
            targetX: x,
            targetY: y,
            currentX: x,
            currentY: y,
            width: tileSize,
            height: tileSize,
            rotation: 0,
            targetRotation: 0,
            scale: 1,
            targetScale: 1,
            opacity: 1,
            targetOpacity: 1,
          });
        }
      }

      phaseRef.current = 'normal';
      cycleTimeRef.current = 0;
    };

    // Scramble tiles
    const scrambleTiles = () => {
      tilesRef.current.forEach((tile) => {
        // Random position within screen bounds
        tile.targetX = Math.random() * (canvas.width - tile.width);
        tile.targetY = Math.random() * (canvas.height - tile.height);
        
        // Random rotation
        tile.targetRotation = (Math.random() - 0.5) * Math.PI * 2;
        
        // Random scale
        tile.targetScale = 0.3 + Math.random() * 0.7;
        
        // Slight opacity variation
        tile.targetOpacity = 0.7 + Math.random() * 0.3;
      });
    };

    // Descramble tiles
    const descrambleTiles = () => {
      tilesRef.current.forEach((tile) => {
        tile.targetX = tile.x;
        tile.targetY = tile.y;
        tile.targetRotation = 0;
        tile.targetScale = 1;
        tile.targetOpacity = 1;
      });
    };

    // Animation loop
    const animate = () => {
      if (!imageRef.current) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      timeRef.current += 1;
      cycleTimeRef.current += 1;

      // Cycle through phases
      const cycleDuration = 300; // frames
      const phase1Duration = 60; // scrambling
      const phase2Duration = 120; // scrambled
      const phase3Duration = 60; // descrambling
      const phase4Duration = 60; // normal

      if (cycleTimeRef.current > cycleDuration) {
        cycleTimeRef.current = 0;
      }

      // Determine current phase
      if (cycleTimeRef.current < phase1Duration) {
        if (phaseRef.current !== 'scrambling') {
          phaseRef.current = 'scrambling';
          scrambleTiles();
        }
      } else if (cycleTimeRef.current < phase1Duration + phase2Duration) {
        phaseRef.current = 'scrambled';
      } else if (cycleTimeRef.current < phase1Duration + phase2Duration + phase3Duration) {
        if (phaseRef.current !== 'descrambling') {
          phaseRef.current = 'descrambling';
          descrambleTiles();
        }
      } else {
        phaseRef.current = 'normal';
      }

      // Update tile positions with smooth interpolation
      tilesRef.current.forEach((tile) => {
        const easing = 0.08;
        
        tile.currentX += (tile.targetX - tile.currentX) * easing;
        tile.currentY += (tile.targetY - tile.currentY) * easing;
        tile.rotation += (tile.targetRotation - tile.rotation) * easing;
        tile.scale += (tile.targetScale - tile.scale) * easing;
        tile.opacity += (tile.targetOpacity - tile.opacity) * easing;

        // Draw tile
        ctx.save();
        
        // Set opacity
        ctx.globalAlpha = tile.opacity;
        
        // Transform for rotation and scale
        ctx.translate(tile.currentX + tile.width / 2, tile.currentY + tile.height / 2);
        ctx.rotate(tile.rotation);
        ctx.scale(tile.scale, tile.scale);
        
        // Calculate source coordinates
        const scaleX = imageRef.current!.width / canvas.width;
        const scaleY = imageRef.current!.height / canvas.height;
        
        const sourceX = tile.x * scaleX;
        const sourceY = tile.y * scaleY;
        const sourceWidth = tile.width * scaleX;
        const sourceHeight = tile.height * scaleY;
        
        // Draw the tile
        try {
          ctx.drawImage(
            imageRef.current!,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            -tile.width / 2,
            -tile.height / 2,
            tile.width,
            tile.height
          );
        } catch (e) {
          // Fallback if image coordinates are out of bounds
          ctx.fillStyle = '#333';
          ctx.fillRect(-tile.width / 2, -tile.height / 2, tile.width, tile.height);
        }
        
        // Add subtle border during scrambled phase
        if (phaseRef.current === 'scrambled' || phaseRef.current === 'scrambling') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(-tile.width / 2, -tile.height / 2, tile.width, tile.height);
        }
        
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    loadImage();

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