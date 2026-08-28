import { motion } from "framer-motion";
import { insights } from "../data/content";
import "./Insights.css";

export default function Insights() {
  return (
    <section id="insights" className="insights section">
      <div className="container">
        <p className="eyebrow">Notes</p>

        <h2 className="font-display insights__heading">
          {insights.kicker}
        </h2>

        <ul className="insights__list">
          {insights.topics.map((t, i) => (
            <motion.li
              key={t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{
                once: true,
                amount: 0.6
              }}
              transition={{
                duration: 0.6,
                delay: i * 0.07,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <span className="font-mono insights__tag">
                Coming soon
              </span>

              <span className="insights__title">
                {t}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}