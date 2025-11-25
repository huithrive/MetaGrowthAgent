import React, { useEffect, useRef } from 'react';

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Star Trek "Warp" / Data Stream Effect
    interface Star {
      x: number;
      y: number;
      z: number;
      color: string;
    }

    const stars: Star[] = [];
    const starCount = 800;
    const colors = ['#FF9C00', '#99CCFF', '#CC99CC', '#FFFFFF'];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width,
        y: (Math.random() - 0.5) * height,
        z: Math.random() * width,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const render = () => {
      // Create trailing effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, width, height);
      
      const cx = width / 2;
      const cy = height / 2;

      stars.forEach(star => {
        // Move star closer
        star.z -= 4; // Speed
        if (star.z <= 0) {
          star.z = width;
          star.x = (Math.random() - 0.5) * width;
          star.y = (Math.random() - 0.5) * height;
        }

        const x = (star.x / star.z) * width + cx;
        const y = (star.y / star.z) * height + cy;
        
        // Calculate size based on depth
        const size = (1 - star.z / width) * 3;

        if (x >= 0 && x <= width && y >= 0 && y <= height) {
          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Grid Overlay (Holodeck style)
      ctx.strokeStyle = 'rgba(153, 204, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 100;
      
      for(let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for(let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
        if(canvas) {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default Background;