import { motion } from "framer-motion";
import { about } from "../data/content";
import { images } from "../data/images";
import "./About.css";

export default function About() {
  return (
    <section id="about" className="about section">
      <div className="container">
        <div className="about__top">
          <motion.p
            className="about__eyebrow font-mono"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            / ABOUT ME
          </motion.p>

          <motion.p
            className="about__index font-mono"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            01 — 04
          </motion.p>
        </div>

        <div className="about__layout">
          <motion.div
            className="about__copy"
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <h2 className="about__title font-display">
              I build what happens
              <span>behind growth</span>
            </h2>

            <div className="about__body">
              {about.paragraphs.map((paragraph, index) => (
                <motion.p
                  key={paragraph}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    duration: 0.65,
                    delay: 0.15 + index * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>

            <div className="about__signature">
              <span className="font-mono">SYED MATEEN</span>
              <span>Growth, systems & intelligent execution.</span>
            </div>
          </motion.div>

          <motion.figure
            className="about__portrait"
            initial={{ opacity: 0, y: 50, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 1,
              delay: 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div className="about__portrait-frame">
              <img
                src={images.aboutPortrait.url}
                alt={images.aboutPortrait.alt}
                loading="lazy"
              />

              <div className="about__portrait-shade" />

              <div className="about__portrait-meta">
                <span className="font-mono">PROFILE / 2026</span>
                <span className="about__live">
                  <i />
                  AVAILABLE FOR SELECT WORK
                </span>
              </div>
            </div>

            <span className="about__side-text font-mono">
              STRATEGY — SYSTEMS — EXECUTION
            </span>
          </motion.figure>
        </div>

        <motion.div
          className="about__bottom"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div className="about__principle">
            <span className="font-mono">01</span>
            <p>Think deeper</p>
          </div>

          <div className="about__principle">
            <span className="font-mono">02</span>
            <p>Build smarter</p>
          </div>

          <div className="about__principle">
            <span className="font-mono">03</span>
            <p>Grow deliberately</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}