import { useEffect, useRef } from 'react';
import anime from 'animejs';

export const AnimatedBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = ''; // Clear previous

    const dotCount = 50;
    const dots = [];

    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('div');
      dot.classList.add('absolute', 'rounded-full', 'bg-copper-500/20');
      
      const size = Math.random() * 4 + 2;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.top = `${Math.random() * 100}%`;
      
      container.appendChild(dot);
      dots.push(dot);
    }

    const animation = anime({
      targets: dots,
      translateY: () => anime.random(-150, 150),
      translateX: () => anime.random(-150, 150),
      scale: () => anime.random(0.5, 2),
      opacity: [0, 0.5, 0],
      duration: () => anime.random(4000, 8000),
      easing: 'easeInOutQuad',
      loop: true,
      direction: 'alternate',
      delay: anime.stagger(100),
    });

    return () => {
      animation.pause();
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50"
      ref={containerRef}
    />
  );
};
