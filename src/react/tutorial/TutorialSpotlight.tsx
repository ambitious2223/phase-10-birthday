import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface TutorialSpotlightProps {
  target: string | null;
  children: React.ReactNode;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function TutorialSpotlight({ target, children }: TutorialSpotlightProps) {
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!target) {
      setRect(null);
      return;
    }

    const update = () => {
      const el = document.querySelector(`[data-tutorial="${target}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ x: r.x - 8, y: r.y - 8, width: r.width + 16, height: r.height + 16 });
      }
    };

    update();
    const interval = setInterval(update, 300);
    return () => clearInterval(interval);
  }, [target]);

  return (
    <>
      {children}
      {target && rect && (
        <motion.div
          className="tutorial-spotlight"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </>
  );
}
