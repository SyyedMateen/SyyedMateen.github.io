import { motion } from "framer-motion";
import { personality } from "../data/content";
import { images } from "../data/images";
import "./Personality.css";

export default function Personality() {
  return (
    <section className="personality">
      <motion.div
        className="personality__imgwrap"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1 }}
      >
        <img src={images.personalityPortrait.url} alt={images.personalityPortrait.alt} />
        <div className="personality__scrim" />
      </motion.div>

      <div className="container personality__content">
        <motion.h2
          className="font-display"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {personality.statement}
        </motion.h2>
      </div>
    </section>
  );
}
