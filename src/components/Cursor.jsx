import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import "./Cursor.css";

export default function Cursor() {
  const [enabled, setEnabled] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  const springX = useSpring(x, {
    stiffness: 180,
    damping: 22,
    mass: 0.35,
  });

  const springY = useSpring(y, {
    stiffness: 180,
    damping: 22,
    mass: 0.35,
  });

  useEffect(() => {
    const canHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!canHover || reducedMotion) return;

    setEnabled(true);

    const handleMouseMove = (event) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      className="cursor"
      style={{
        left: springX,
        top: springY,
      }}
      aria-hidden="true"
    />
  );
}