import { useRef, useState } from "react";
import { motion } from "framer-motion";

// Botón magnético: persigue un poco al cursor y vuelve con resorte.
// En táctil se comporta como un botón normal.
export default function Magnetic({ children }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const move = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({
      x: (e.clientX - (r.left + r.width / 2)) * 0.25,
      y: (e.clientY - (r.top + r.height / 2)) * 0.25,
    });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 200, damping: 16 }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}
