import { useEffect, useState } from 'react';

const EVENTS = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'] as const;

/**
 * Becomes true on the visitor's first real input. Heavy embeds (YouTube players, ~1MB each)
 * wait for this so they never slow down the initial page load.
 */
export const useUserInteracted = () => {
  const [interacted, setInteracted] = useState(false);
  useEffect(() => {
    if (interacted) return;
    const done = () => setInteracted(true);
    EVENTS.forEach((name) => window.addEventListener(name, done, { once: true, passive: true }));
    return () => EVENTS.forEach((name) => window.removeEventListener(name, done));
  }, [interacted]);
  return interacted;
};
