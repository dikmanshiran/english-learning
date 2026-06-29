import { useEffect, useRef } from 'react';

interface ConfettiProps {
  trigger: number; // increment to fire
}

const COLORS = ['#f59e0b', '#6c3fc5', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#a78bfa'];

export function Confetti({ trigger }: ConfettiProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trigger === 0) return;
    const container = containerRef.current;
    if (!container) return;
    const pieces: HTMLDivElement[] = [];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const isCircle = Math.random() > 0.5;
      piece.style.cssText = `
        left:${Math.random() * 100}%;
        background:${COLORS[Math.floor(Math.random() * COLORS.length)]};
        width:${6 + Math.random() * 8}px;
        height:${6 + Math.random() * 8}px;
        border-radius:${isCircle ? '50%' : '2px'};
        animation-duration:${1.5 + Math.random() * 2}s;
        animation-delay:${Math.random() * 0.5}s;
      `;
      container.appendChild(piece);
      pieces.push(piece);
    }
    const timer = setTimeout(() => {
      pieces.forEach((p) => p.remove());
    }, 4000);
    return () => {
      clearTimeout(timer);
      pieces.forEach((p) => p.remove());
    };
  }, [trigger]);

  return <div ref={containerRef} className="confetti-container" />;
}
