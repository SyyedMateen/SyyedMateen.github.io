import { motion } from "framer-motion";
import { proof } from "../data/content";
import "./Proof.css";

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      delay: index * 0.14,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export default function Proof() {
  return (
    <section className="proof section">
      <div className="container proof__grid">
        {proof.map((p, i) => (
          <motion.article
            className="proof__item"
            key={p.title}
            custom={i}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.35,
            }}
            whileHover={{
              y: -8,
              transition: {
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1],
              },
            }}
          >
            <div className="proof__index">
              0{i + 1}
            </div>

            <div className="proof__line" aria-hidden="true" />

            <div className="proof__content">
              <motion.h3
                className="font-display"
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  delay: 0.18 + i * 0.14,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {p.title}
              </motion.h3>

              <motion.p
                initial={{
                  opacity: 0,
                  y: 14,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.65,
                  delay: 0.28 + i * 0.14,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {p.body}
              </motion.p>
            </div>

            <motion.span
              className="proof__arrow"
              aria-hidden="true"
              initial={{
                opacity: 0,
                x: -10,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              whileHover={{
                x: 6,
              }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: 0.35 + i * 0.14,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              ↗
            </motion.span>
          </motion.article>
        ))}
      </div>
    </section>
  );
}