import { useEffect, useRef } from 'react';

/**
 * Hook tạo scroll reveal animation cho elements
 * Usage: const ref = useScrollReveal();
 *        <div ref={ref} className="reveal">...</div>
 */
const useScrollReveal = (options = {}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const { threshold = 0.12, rootMargin = '0px 0px -48px 0px' } = options;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Only reveal once
          }
        });
      },
      { threshold, rootMargin }
    );

    const container = containerRef.current || document;
    const elements = container.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return containerRef;
};

export default useScrollReveal;
