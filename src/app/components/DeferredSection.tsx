import React, { useEffect, useRef, useState } from 'react';

/**
 * Renders its children once the placeholder comes within reach of the viewport, so sections
 * further down the page don't add to the work done while the page first loads.
 */
export const DeferredSection = ({ children, minHeight = 600 }: { children: React.ReactNode; minHeight?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || visible) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '300px 0px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  return visible ? <>{children}</> : <div ref={ref} style={{ minHeight }} aria-hidden="true" />;
};
