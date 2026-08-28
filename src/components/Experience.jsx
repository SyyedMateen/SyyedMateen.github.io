import { motion } from "framer-motion";
import { experience } from "../data/content";
import "./Experience.css";

export default function Experience() {
  return (
    <section id="experience" className="experience section">
      <div className="container experience__inner">
        <p className="eyebrow">{experience.kicker}</p>

        <motion.div
          className="experience__row"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="experience__period font-mono">{experience.period}</span>
          <div className="experience__org">
            <h3 className="font-display">{experience.org}</h3>
            <p className="experience__role">{experience.role}</p>
          </div>
        </motion.div>

        <ul className="experience__areas">
          {experience.areas.map((a, i) => (
            <motion.li
              key={a}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              {a}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
