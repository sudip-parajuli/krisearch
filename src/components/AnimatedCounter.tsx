"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

/** Counts up from 0 to `value` once it scrolls into view — a small, cheap
 * motion touch (no 3D/WebGL) that reads as "alive" without hurting
 * low-end-phone performance. */
export function AnimatedCounter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}
