import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Center starting point
    gsap.set(cursor, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });

    const onMouseMove = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    const onMouseOverInteractive = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('a') || 
        target.closest('button') ||
        target.closest('[data-hover-glow]');

      if (isInteractive) {
        gsap.to(cursor, {
          width: 60,
          height: 60,
          backgroundColor: 'rgba(200, 169, 126, 0.15)',
          borderColor: 'rgba(200, 169, 126, 0.8)',
          duration: 0.3,
        });
      } else {
        gsap.to(cursor, {
          width: 30,
          height: 30,
          backgroundColor: 'rgba(200, 169, 126, 0.05)',
          borderColor: 'rgba(200, 169, 126, 0.4)',
          duration: 0.3,
        });
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOverInteractive);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOverInteractive);
    };
  }, []);

  return (
    <div 
      ref={cursorRef} 
      className="glow-cursor hidden md:block" 
      id="custom-glow-cursor"
    />
  );
}
