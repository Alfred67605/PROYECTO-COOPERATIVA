import { useEffect, useRef } from 'react';
import anime from 'animejs';

interface AnimatedBackgroundProps {
  dotCount?: number;
}

export const AnimatedBackground = ({ dotCount = 160 }: AnimatedBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = ''; // Clear previous

    const dots = [];

    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('div');
      dot.classList.add('absolute', 'rounded-full');
      
      const isEmber = Math.random() > 0.45; // 55% embers, 45% dark ashes
      
      if (isEmber) {
        // Glowing Ember (orange/red/gold gradient)
        dot.classList.add('bg-gradient-to-t', 'from-red-500', 'to-amber-400');
        const size = Math.random() * 4 + 1.5; // 1.5px to 5.5px
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        // Apply beautiful ambient glow shadow
        dot.style.boxShadow = `0 0 ${Math.random() * 6 + 4}px rgba(239, 68, 68, 0.8), 0 0 ${Math.random() * 4 + 2}px rgba(245, 158, 11, 0.6)`;
      } else {
        // Dark ash (dark grey/charcoal)
        dot.classList.add('bg-stone-600/30');
        const size = Math.random() * 3.5 + 1; // 1px to 4.5px
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
      }
      
      dot.style.left = `${Math.random() * 100}%`;
      // Position just below the screen bottom
      dot.style.top = `${100 + Math.random() * 5}%`;
      
      container.appendChild(dot);
      dots.push(dot);
    }

    const animation = anime({
      targets: dots,
      translateY: () => [0, -window.innerHeight - 100],
      translateX: () => [0, anime.random(-150, 150)],
      scale: [0.5, () => anime.random(1.2, 2.2), 0.1],
      opacity: [0, 0.8, 0],
      duration: () => anime.random(6000, 14000),
      easing: 'linear',
      loop: true,
      delay: () => anime.random(0, 12000),
    });

    return () => {
      animation.pause();
    };
  }, [dotCount]);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-75"
      ref={containerRef}
    />
  );
};
