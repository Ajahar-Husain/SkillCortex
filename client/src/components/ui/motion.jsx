import React, { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring, animate } from 'framer-motion';

/* ------------------------------------------------------------------ */
/* Page transition — wrap every route so navigation feels cinematic.   */
/* ------------------------------------------------------------------ */
export const pageVariants = {
  initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -16, filter: 'blur(4px)', transition: { duration: 0.2, ease: 'easeIn' } },
};

export function PageTransition({ children, className = '' }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className={className}>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Scroll-reveal wrapper — fades/slides content in as it enters view.  */
/* ------------------------------------------------------------------ */
export function Reveal({ children, delay = 0, y = 28, className = '', once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Stagger container — children animate in one after another.          */
/* ------------------------------------------------------------------ */
export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function Stagger({ children, className = '', ...props }) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className={className} {...props}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '', ...props }) {
  return (
    <motion.div variants={staggerItem} className={className} {...props}>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* CountUp — number that eases up when scrolled into view.             */
/* ------------------------------------------------------------------ */
export function CountUp({ value = 0, duration = 1.4, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = React.useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, Number(value) || 0, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString()}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* MagneticButton — subtle magnetic pull toward the cursor.            */
/* ------------------------------------------------------------------ */
export function Magnetic({ children, className = '', strength = 14 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18 });
  const sy = useSpring(y, { stiffness: 220, damping: 18 });

  const onMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(((e.clientX - rect.left) / rect.width - 0.5) * strength * 2);
    y.set(((e.clientY - rect.top) / rect.height - 0.5) * strength * 2);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }} onMouseMove={onMove} onMouseLeave={onLeave} className={className}>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* TiltCard — 3D perspective tilt that follows the pointer.            */
/* ------------------------------------------------------------------ */
export function TiltCard({ children, className = '', max = 9 }) {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });

  const onMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d', perspective: 900 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Shared motion presets so pages stay consistent */
export const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});
