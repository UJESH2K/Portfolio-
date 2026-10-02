"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * A pointer-driven 3D tilt card: rotateX/rotateY track the cursor position
 * within the card, springed for a smooth settle, plus a radial glow that
 * follows the pointer. Shared by the Process, Works, and Experiments
 * sections so the "3D hover depth" language is consistent everywhere.
 */
export default function TiltCard({
  children,
  className = "",
  glow = true,
  strength = 10,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const springOpts = { stiffness: 220, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [strength, -strength]), springOpts);
  const rotateY = useSpring(useTransform(px, [0, 1], [-strength, strength]), springOpts);
  const glowX = useTransform(px, [0, 1], ["0%", "100%"]);
  const glowY = useTransform(py, [0, 1], ["0%", "100%"]);
  const glowBackground = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(280px circle at ${x} ${y}, rgba(138,180,255,0.16), transparent 70%)`
  );

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function onLeave() {
    px.set(0.5);
    py.set(0.5);
    setHovered(false);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={`relative ${className}`}
    >
      {glow && (
        <motion.div
          aria-hidden
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glowBackground }}
        />
      )}
      {children}
    </motion.div>
  );
}
