import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { nav } from "../data/content";
import "./Nav.css";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
        <motion.div
          className="nav__shell"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <a
            href="#top"
            className="nav__brand"
            aria-label={`${nav.name} home`}
          >
            <span className="nav__brand-mark">
              <span />
              <span />
            </span>

            <span className="nav__brand-name font-display">
              {nav.name}
            </span>
          </a>

          <nav className="nav__links" aria-label="Primary navigation">
            {nav.links.map((link, index) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="nav__link"
                data-cursor="link"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.18 + index * 0.06,
                  duration: 0.55,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <span className="nav__link-index">
                  0{index + 1}
                </span>

                <span>{link.label}</span>
              </motion.a>
            ))}
          </nav>

          <a
            href={nav.cta.href}
            className="nav__cta"
            data-cursor="link"
          >
            <span>{nav.cta.label}</span>

            <span className="nav__cta-arrow" aria-hidden="true">
              ↗
            </span>
          </a>

          <button
            className={`nav__burger ${open ? "is-open" : ""}`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </motion.div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{
              opacity: 0,
              clipPath: "circle(0% at calc(100% - 42px) 42px)",
            }}
            animate={{
              opacity: 1,
              clipPath: "circle(150% at calc(100% - 42px) 42px)",
            }}
            exit={{
              opacity: 0,
              clipPath: "circle(0% at calc(100% - 42px) 42px)",
            }}
            transition={{
              duration: 0.75,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div className="mobile-menu__glow" />

            <div className="mobile-menu__content">
              <p className="mobile-menu__eyebrow font-mono">
                Navigation / 2026
              </p>

              <nav
                className="mobile-menu__links"
                aria-label="Mobile navigation"
              >
                {nav.links.map((link, index) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.18 + index * 0.08,
                      duration: 0.65,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <span className="font-mono">
                      0{index + 1}
                    </span>

                    <strong className="font-display">
                      {link.label}
                    </strong>

                    <i aria-hidden="true">↗</i>
                  </motion.a>
                ))}
              </nav>

              <motion.a
                href={nav.cta.href}
                className="mobile-menu__cta"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.2 + nav.links.length * 0.08,
                  duration: 0.65,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <span>{nav.cta.label}</span>
                <span>↗</span>
              </motion.a>
            </div>

            <div className="mobile-menu__footer">
              <span className="font-mono">
                DIGITAL GROWTH / AI SYSTEMS
              </span>

              <span className="font-mono">
                SCROLL TO EXPLORE
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}