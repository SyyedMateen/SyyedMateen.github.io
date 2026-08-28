import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { services } from "../data/content";
import "./Services.css";

export default function Services() {
  const [active, setActive] = useState(0);

  const activeService = services[active];

  return (
    <section id="services" className="services section">
      <div className="container">

        <motion.div
          className="services__intro"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div>
            <p className="eyebrow">What I do</p>
          </div>

          <div>
            <h2 className="services__heading font-display">
              AI automation
              <span>& digital growth</span>
            </h2>

            <p className="services__intro-copy">
              I build practical systems that reduce friction,
              create growth, and make businesses easier to run.
            </p>
          </div>
        </motion.div>

        <div className="services__layout">

          {/* SERVICE NAV */}
          <div className="services__list">
            {services.map((service, index) => {
              const isActive = active === index;

              return (
                <motion.button
                  type="button"
                  key={service.index}
                  className={`services__item ${
                    isActive ? "is-active" : ""
                  }`}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  onClick={() => setActive(index)}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.65,
                    delay: index * 0.07,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <span className="services__index font-mono">
                    {service.index}
                  </span>

                  <span className="services__item-title font-display">
                    {service.title}
                  </span>

                  <span className="services__item-dot" />
                </motion.button>
              );
            })}
          </div>

          {/* ACTIVE SERVICE */}
          <motion.div
            className="services__panel"
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div className="services__panel-top">
              <span className="services__panel-number font-mono">
                {activeService.index}
              </span>

              <span className="services__panel-label font-mono">
                SERVICE
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeService.index}
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -12,
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <h3 className="services__panel-title font-display">
                  {activeService.title}
                </h3>

                <p className="services__copy">
                  {activeService.copy}
                </p>

                <ul className="services__tags">
                  {activeService.items.map((item, index) => (
                    <li key={item}>
                      <span className="services__tag-number font-mono">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            <div className="services__panel-foot">
              <span>Built around the bottleneck.</span>

              <motion.span
                aria-hidden="true"
                animate={{
                  x: [0, 5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                →
              </motion.span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}