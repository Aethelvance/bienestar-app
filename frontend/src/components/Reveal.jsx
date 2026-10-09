import { motion } from "framer-motion";
import { EASE } from "../lib/motion.js";

// Revelado por recorte: la celda "se abre" desde un borde.
// Se activa con `started` para orquestar la entrada del hero.
// direction: "up" | "down" | "left"
export default function Reveal({
  started,
  delay = 0,
  direction = "up",
  className = "",
  children,
}) {
  const from =
    direction === "up"
      ? "inset(0 0 100% 0)"
      : direction === "down"
        ? "inset(100% 0 0 0)"
        : "inset(0 100% 0 0)";
  return (
    <motion.div
      className={className}
      initial={{ clipPath: from }}
      animate={started ? { clipPath: "inset(0% 0% 0% 0%)" } : { clipPath: from }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
