import { motion } from "framer-motion";
import { cinematic } from "../data/content";
import "./Cinematic.css";

export default function Cinematic() {
  return (
    <section className="cinematic">
      <div
        className="cinematic__field"
        aria-hidden="true"
      />

      <div className="cinematic__lines">

        <motion.p
          className="font-display"
          initial={{
            opacity: 0,
            y: 28,
            scale: 0.975,
            filter: "blur(10px)",
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
          }}
          viewport={{
            once: true,
            amount: 0.65,
          }}
          transition={{
            duration: 1.15,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {cinematic.lineOne}
        </motion.p>

        <motion.p
          className="font-display is-accent"
          initial={{
            opacity: 0,
            y: 34,
            scale: 0.97,
            filter: "blur(12px)",
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
          }}
          viewport={{
            once: true,
            amount: 0.65,
          }}
          transition={{
            duration: 1.15,
            delay: 0.28,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {cinematic.lineTwo}
        </motion.p>

      </div>
    </section>
  );
}