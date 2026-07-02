'use client';

import { useEffect, useRef, useState } from 'react';

export function CursorGlow() {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [opacity, setOpacity] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    let last = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - last < 16) return;
      last = now;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => setPosition({ x: e.clientX, y: e.clientY }));
    };
    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => setOpacity(0);
    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(230, 195, 131, 0.05) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 9998,
        transform: `translate3d(${position.x - 200}px, ${position.y - 200}px, 0)`,
        opacity,
        transition: 'opacity 0.3s',
      }}
      aria-hidden
    />
  );
}
