import React, { useEffect, useRef } from 'react';

interface WavePoint {
  x: number;
  y: number;
  height: number;
  velocity: number;
  damping: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
  age: number;
  maxAge: number;
  frequency: number;
}

interface RealisticWaterRippleEffectProps {
  isActive: boolean;
}

export const RealisticWaterRippleEffect: React.FC<RealisticWaterRippleEffectProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveGridRef = useRef<WavePoint[][]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const imageRef = useRef<HTMLImageElement>();
  const gridSize = 4; // Higher resolution grid for more detail

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const backgroundCanvas = backgroundCanvasRef.current;
    if (!canvas || !backgroundCanvas) return;

    const ctx = canvas.getContext('2d');
    const bgCtx = backgroundCanvas.getContext('2d');
    if (!ctx || !bgCtx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      backgroundCanvas.width = window.innerWidth;
      backgroundCanvas.height = window.innerHeight;
      initializeWaveGrid();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize wave simulation grid
    const initializeWaveGrid = () => {
      const cols = Math.ceil(canvas.width / gridSize);
      const rows = Math.ceil(canvas.height / gridSize);
      
      waveGridRef.current = [];
      for (let y = 0; y < rows; y++) {
        waveGridRef.current[y] = [];
        for (let x = 0; x < cols; x++) {
          waveGridRef.current[y][x] = {
            x: x * gridSize,
            y: y * gridSize,
            height: 0,
            velocity: 0,
            damping: 0.99
          };
        }
      }
    };

    // Load background image
    const loadBackgroundImage = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageRef.current = img;
        drawBackground();
      };
      img.onerror = () => {
        // Fallback to gradient background
        drawGradientBackground();
      };
      img.src = '/public/1758659008299-qbolrp.jpeg';
    };

    const drawBackground = () => {
      if (!imageRef.current) return;
      
      bgCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
      bgCtx.drawImage(
        imageRef.current,
        0, 0, imageRef.current.width, imageRef.current.height,
        0, 0, backgroundCanvas.width, backgroundCanvas.height
      );
    };

    const drawGradientBackground = () => {
      const gradient = bgCtx.createLinearGradient(0, 0, 0, backgroundCanvas.height);
      gradient.addColorStop(0, '#1e3a8a');
      gradient.addColorStop(0.5, '#3b82f6');
      gradient.addColorStop(1, '#1e40af');
      
      bgCtx.fillStyle = gradient;
      bgCtx.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
    };

    // Create ripple
    const createRipple = (x: number, y: number, strength: number = 0.5) => {
      ripplesRef.current.push({
        x,
        y,
        radius: 0,
        maxRadius: Math.random() * 150 + 100,
        strength,
        age: 0,
        maxAge: 120,
        frequency: Math.random() * 0.1 + 0.05
      });
    };

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() < 0.05) { // 5% chance on mouse move
        createRipple(e.clientX, e.clientY, 0.3);
      }
    };

    const handleClick = (e: MouseEvent) => {
      createRipple(e.clientX, e.clientY, 0.8);
      // Create secondary ripples
      setTimeout(() => createRipple(
        e.clientX + (Math.random() - 0.5) * 30, 
        e.clientY + (Math.random() - 0.5) * 30, 
        0.4
      ), 150);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Update wave simulation
    const updateWaveSimulation = () => {
      const grid = waveGridRef.current;
      if (!grid.length) return;

      const rows = grid.length;
      const cols = grid[0].length;

      // Apply ripple forces to grid
      ripplesRef.current.forEach(ripple => {
        const gridX = Math.floor(ripple.x / gridSize);
        const gridY = Math.floor(ripple.y / gridSize);
        
        const influence = Math.max(0, 1 - ripple.age / ripple.maxAge);
        const waveHeight = Math.sin(ripple.age * ripple.frequency) * ripple.strength * influence;
        
        // Apply force in circular pattern
        const radius = Math.floor(ripple.radius / gridSize);
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const gx = gridX + dx;
            const gy = gridY + dy;
            
            if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance <= radius) {
                const falloff = 1 - (distance / radius);
                grid[gy][gx].height += waveHeight * falloff * 0.1;
              }
            }
          }
        }
      });

      // Wave propagation simulation
      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
          const current = grid[y][x];
          
          // Calculate average height of neighbors
          const neighbors = [
            grid[y-1][x], grid[y+1][x], // vertical
            grid[y][x-1], grid[y][x+1], // horizontal
            grid[y-1][x-1], grid[y-1][x+1], // diagonal
            grid[y+1][x-1], grid[y+1][x+1]
          ];
          
          const avgHeight = neighbors.reduce((sum, n) => sum + n.height, 0) / neighbors.length;
          
          // Apply wave equation
          const acceleration = (avgHeight - current.height) * 0.2;
          current.velocity += acceleration;
          current.velocity *= current.damping;
          current.height += current.velocity;
          
          // Prevent extreme values
          current.height = Math.max(-2, Math.min(2, current.height));
        }
      }
    };

    // Render water surface with displacement
    const renderWaterSurface = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background with wave displacement
      const imageData = bgCtx.getImageData(0, 0, backgroundCanvas.width, backgroundCanvas.height);
      const newImageData = ctx.createImageData(canvas.width, canvas.height);
      
      const grid = waveGridRef.current;
      if (!grid.length) return;
      
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const gridX = Math.floor(x / gridSize);
          const gridY = Math.floor(y / gridSize);
          
          if (gridY < grid.length && gridX < grid[0].length) {
            const waveHeight = grid[gridY][gridX].height;
            
            // Calculate displacement based on wave height
            const displacementX = waveHeight * 3;
            const displacementY = waveHeight * 2;
            
            // Sample from displaced position
            const sourceX = Math.max(0, Math.min(backgroundCanvas.width - 1, x + displacementX));
            const sourceY = Math.max(0, Math.min(backgroundCanvas.height - 1, y + displacementY));
            
            const sourceIndex = (Math.floor(sourceY) * backgroundCanvas.width + Math.floor(sourceX)) * 4;
            const targetIndex = (y * canvas.width + x) * 4;
            
            if (sourceIndex >= 0 && sourceIndex < imageData.data.length - 3) {
              newImageData.data[targetIndex] = imageData.data[sourceIndex];     // R
              newImageData.data[targetIndex + 1] = imageData.data[sourceIndex + 1]; // G
              newImageData.data[targetIndex + 2] = imageData.data[sourceIndex + 2]; // B
              newImageData.data[targetIndex + 3] = 255; // A
            }
          }
        }
      }
      
      ctx.putImageData(newImageData, 0, 0);
      
      // Add water surface effects
      renderWaterEffects();
    };

    // Render additional water effects
    const renderWaterEffects = () => {
      const grid = waveGridRef.current;
      if (!grid.length) return;

      // Add surface highlights and shadows
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      
      for (let y = 1; y < grid.length - 1; y++) {
        for (let x = 1; x < grid[0].length - 1; x++) {
          const current = grid[y][x];
          const right = grid[y][x + 1];
          const down = grid[y + 1] ? grid[y + 1][x] : current;
          
          // Calculate surface normal
          const normalX = current.height - right.height;
          const normalY = current.height - down.height;
          const normalLength = Math.sqrt(normalX * normalX + normalY * normalY + 1);
          
          // Light direction (from top-left)
          const lightX = -0.6;
          const lightY = -0.8;
          
          // Calculate lighting
          const dot = (normalX * lightX + normalY * lightY + 1) / normalLength;
          const intensity = Math.max(0, Math.min(1, dot));
          
          // Apply lighting
          const alpha = Math.abs(current.height) * 0.3;
          if (alpha > 0.01) {
            ctx.globalAlpha = alpha;
            
            if (intensity > 0.5) {
              ctx.fillStyle = `rgba(255, 255, 255, ${(intensity - 0.5) * 0.4})`;
            } else {
              ctx.fillStyle = `rgba(0, 50, 100, ${(0.5 - intensity) * 0.3})`;
            }
            
            ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
          }
        }
      }
      
      ctx.restore();
      
      // Add caustic-like patterns
      renderCaustics();
    };

    // Render caustic light patterns
    const renderCaustics = () => {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.1;
      
      const grid = waveGridRef.current;
      for (let y = 0; y < grid.length - 1; y += 2) {
        for (let x = 0; x < grid[0].length - 1; x += 2) {
          const height = grid[y][x].height;
          if (Math.abs(height) > 0.1) {
            const intensity = Math.abs(height) * 0.5;
            const size = intensity * 20 + 5;
            
            const gradient = ctx.createRadialGradient(
              x * gridSize, y * gridSize, 0,
              x * gridSize, y * gridSize, size
            );
            gradient.addColorStop(0, `rgba(200, 230, 255, ${intensity})`);
            gradient.addColorStop(1, 'rgba(200, 230, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x * gridSize, y * gridSize, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      
      ctx.restore();
    };

    // Animation loop
    const animate = () => {
      timeRef.current += 1;
      
      // Occasionally create random ripples
      if (Math.random() < 0.02) {
        createRipple(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          0.2
        );
      }
      
      // Update ripples
      ripplesRef.current.forEach((ripple, index) => {
        ripple.age++;
        ripple.radius += 2;
        
        if (ripple.age > ripple.maxAge || ripple.radius > ripple.maxRadius) {
          ripplesRef.current.splice(index, 1);
        }
      });
      
      // Update wave simulation
      updateWaveSimulation();
      
      // Render
      renderWaterSurface();
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Initialize
    initializeWaveGrid();
    loadBackgroundImage();
    
    // Start animation
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
    <>
      <canvas
        ref={backgroundCanvasRef}
        className="hidden"
      />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-30"
      />
    </>
  );
};