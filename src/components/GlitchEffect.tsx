import React, { useEffect, useRef } from 'react';

interface GlitchStrip {
  y: number;
  height: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
  color: 'red' | 'green' | 'blue';
  life: number;
  maxLife: number;
}

interface DigitalNoise {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  life: number;
}

interface GlitchEffectProps {
  isActive: boolean;
}

export const GlitchEffect: React.FC<GlitchEffectProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const glitchStripsRef = useRef<GlitchStrip[]>([]);
  const digitalNoiseRef = useRef<DigitalNoise[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const imageRef = useRef<HTMLImageElement>();

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const sourceCanvas = sourceCanvasRef.current;
    if (!canvas || !sourceCanvas) return;

    const ctx = canvas.getContext('2d');
    const sourceCtx = sourceCanvas.getContext('2d');
    if (!ctx || !sourceCtx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      sourceCanvas.width = window.innerWidth;
      sourceCanvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load the background image
    const loadImage = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageRef.current = img;
        drawSourceImage();
        animate();
      };
      img.src = '/public/1758659008299-qbolrp.jpeg';
    };

    const drawSourceImage = () => {
      if (!imageRef.current) return;
      
      // Draw the original image to source canvas
      sourceCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
      sourceCtx.drawImage(
        imageRef.current,
        0, 0, imageRef.current.width, imageRef.current.height,
        0, 0, sourceCanvas.width, sourceCanvas.height
      );
    };

    const createGlitchStrip = () => {
      const colors: ('red' | 'green' | 'blue')[] = ['red', 'green', 'blue'];
      glitchStripsRef.current.push({
        y: Math.random() * canvas.height,
        height: Math.random() * 20 + 5,
        offsetX: (Math.random() - 0.5) * 20,
        offsetY: (Math.random() - 0.5) * 10,
        opacity: Math.random() * 0.8 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: Math.random() * 30 + 10,
      });
    };

    const createDigitalNoise = () => {
      for (let i = 0; i < 20; i++) {
        digitalNoiseRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          width: Math.random() * 4 + 1,
          height: Math.random() * 4 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          life: 0,
        });
      }
    };

    // Animation loop
    const animate = () => {
      if (!imageRef.current) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      timeRef.current += 1;

      // Draw base image most of the time
      if (Math.random() > 0.1) { // 90% of the time show normal image
        ctx.drawImage(sourceCanvas, 0, 0);
      }

      // Randomly create glitch effects
      if (Math.random() < 0.05) { // 5% chance per frame
        createGlitchStrip();
      }

      if (Math.random() < 0.02) { // 2% chance per frame
        createDigitalNoise();
      }

      // Major glitch event occasionally
      const majorGlitch = Math.random() < 0.001; // Very rare major glitch

      if (majorGlitch) {
        // Screen-wide distortion
        for (let i = 0; i < 5; i++) {
          createGlitchStrip();
        }
        createDigitalNoise();
      }

      // Update and draw glitch strips
      glitchStripsRef.current.forEach((strip, index) => {
        strip.life++;

        // Draw RGB channel separation
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = strip.opacity * (1 - strip.life / strip.maxLife);

        // Get image data for this strip
        const imageData = sourceCtx.getImageData(0, strip.y, sourceCanvas.width, strip.height);
        
        // Create temporary canvas for color manipulation
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = sourceCanvas.width;
        tempCanvas.height = strip.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          tempCtx.putImageData(imageData, 0, 0);
          
          // Apply color filter
          tempCtx.globalCompositeOperation = 'multiply';
          tempCtx.fillStyle = strip.color === 'red' ? '#FF0000' : 
                             strip.color === 'green' ? '#00FF00' : '#0000FF';
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          
          // Draw the glitched strip with offset
          ctx.drawImage(
            tempCanvas,
            strip.offsetX,
            strip.y + strip.offsetY
          );
        }

        ctx.restore();

        // Remove old strips
        if (strip.life > strip.maxLife) {
          glitchStripsRef.current.splice(index, 1);
        }
      });

      // Update and draw digital noise
      digitalNoiseRef.current.forEach((noise, index) => {
        noise.life++;

        ctx.save();
        ctx.globalAlpha = noise.opacity * Math.max(0, 1 - noise.life / 20);
        
        // Random color for noise
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000'];
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(noise.x, noise.y, noise.width, noise.height);
        
        ctx.restore();

        // Remove old noise
        if (noise.life > 20) {
          digitalNoiseRef.current.splice(index, 1);
        }
      });

      // Scan lines effect
      if (Math.random() < 0.3) {
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#000000';
        for (let y = 0; y < canvas.height; y += 4) {
          ctx.fillRect(0, y, canvas.width, 2);
        }
        ctx.restore();
      }

      // Random screen flash
      if (Math.random() < 0.005) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = Math.random() > 0.5 ? '#FFFFFF' : '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // Chromatic aberration on major glitch
      if (majorGlitch) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.3;
        
        // Red channel
        ctx.fillStyle = '#FF0000';
        ctx.drawImage(sourceCanvas, -3, 0);
        
        // Blue channel  
        ctx.fillStyle = '#0000FF';
        ctx.drawImage(sourceCanvas, 3, 0);
        
        ctx.restore();
      }

      // Data corruption bars
      if (Math.random() < 0.02) {
        const barCount = Math.random() * 3 + 1;
        for (let i = 0; i < barCount; i++) {
          ctx.save();
          ctx.globalAlpha = 0.6;
          ctx.fillStyle = '#00FF00';
          const y = Math.random() * canvas.height;
          ctx.fillRect(0, y, canvas.width, 2);
          ctx.restore();
        }
      }

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
    <>
      <canvas
        ref={sourceCanvasRef}
        className="hidden"
      />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-30"
      />
    </>
  );
};