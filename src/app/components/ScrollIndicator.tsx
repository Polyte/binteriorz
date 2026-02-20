import React from 'react';
import { motion } from 'motion/react';

export const ScrollIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 1 }}
      className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
    >
      <span
        className="text-[8px] uppercase tracking-[0.6em] text-white/40 font-bold"
        style={{ fontFamily: 'var(--font-josefin)' }}
      >
        Scroll
      </span>
      <div className="w-[1px] h-10 relative overflow-hidden">
        <motion.div
          animate={{ y: ['-100%', '100%'] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-transparent"
        />
        <div className="absolute inset-0 bg-white/10" />
      </div>
    </motion.div>
  );
};
