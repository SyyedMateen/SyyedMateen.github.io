import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { hero } from "../data/content";
import { images } from "../data/images";
import "./Hero.css";

const lineVariants = {
  hidden: {
    y: "120%",
    opacity: 0,
  },
  show: (index) => ({
    y: "0%",
    opacity: 1,
    transition: {
      duration: 1.05,
      delay: 0.25 + index * 0.1,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const metaVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: 1.35 + index * 0.1,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export default function Hero() {
  const ref = useRef(null);

  /* --------------------------------
     SCROLL MOTION
  -------------------------------- */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const rawHeadlineY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -150]
  );

  const rawPortraitY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, 100]
  );

  const rawBackgroundY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, 70]
  );

  const rawFade = useTransform(
    scrollYProgress,
    [0, 0.8],
    [1, 0]
  );

  const headlineY = useSpring(rawHeadlineY, {
    stiffness: 90,
    damping: 22,
    mass: 0.8,
  });

  const portraitY = useSpring(rawPortraitY, {
    stiffness: 75,
    damping: 20,
    mass: 0.8,
  });

  const backgroundY = useSpring(rawBackgroundY, {
    stiffness: 55,
    damping: 24,
    mass: 1,
  });

  const fade = useSpring(rawFade, {
    stiffness: 100,
    damping: 25,
  });

  /* --------------------------------
     MOUSE TILT
  -------------------------------- */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [5, -5]),
    {
      stiffness: 180,
      damping: 22,
      mass: 0.5,
    }
  );

  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-5, 5]),
    {
      stiffness: 180,
      damping: 22,
      mass: 0.5,
    }
  );

  const handlePortraitMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) / rect.width - 0.5;

    const y =
      (event.clientY - rect.top) / rect.height - 0.5;

    mouseX.set(x);
    mouseY.set(y);
  };

  const resetPortrait = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section id="top" className="hero" ref={ref}>

      {/* --------------------------------
          BACKGROUND
      -------------------------------- */}
      <motion.div
        className="hero__field"
        style={{ y: backgroundY }}
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 1.5,
          delay: 0.05,
          ease: [0.16, 1, 0.3, 1],
        }}
        aria-hidden="true"
      />

      {/* --------------------------------
          EYEBROW
      -------------------------------- */}
      <motion.p
        className="eyebrow hero__eyebrow"
        initial={{
          opacity: 0,
          y: 18,
          filter: "blur(10px)",
        }}
        animate={{
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
        }}
        transition={{
          duration: 0.9,
          delay: 0.15,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {hero.eyebrow}
      </motion.p>

      {/* --------------------------------
          MAIN GRID
      -------------------------------- */}
      <motion.div
        className="hero__grid"
        style={{
          y: headlineY,
          opacity: fade,
        }}
      >

        {/* HEADLINE */}
        <motion.h1
          className="hero__headline font-display"
          initial="hidden"
          animate="show"
        >
          {hero.headlineLines.map((line, index) => (
            <span
              className="hero__line-mask"
              key={line}
            >
              <motion.span
                className={`hero__line ${
                  line === hero.emphasisWord
                    ? "is-emphasis"
                    : ""
                }`}
                custom={index}
                variants={lineVariants}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        {/* --------------------------------
            PORTRAIT
        -------------------------------- */}
        <motion.figure
          className="hero__portrait"
          style={{
            y: portraitY,
            rotateX,
            rotateY,
          }}
          initial={{
            opacity: 0,
            scale: 0.82,
            y: 35,
            clipPath: "ellipse(0% 0% at 50% 50%)",
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            clipPath: "ellipse(50% 50% at 50% 50%)",
          }}
          transition={{
            opacity: {
              duration: 0.8,
              delay: 0.25,
            },
            scale: {
              duration: 1.2,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1],
            },
            y: {
              duration: 1.2,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1],
            },
            clipPath: {
              duration: 1.25,
              delay: 0.25,
              ease: [0.16, 1, 0.3, 1],
            },
          }}
          onMouseMove={handlePortraitMove}
          onMouseLeave={resetPortrait}
        >
          <motion.img
            src={images.heroPortrait.url}
            alt={images.heroPortrait.alt}
            draggable="false"
            animate={{
              scale: [1, 1.025, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <span
            className="hero__portrait-glow"
            aria-hidden="true"
          />
        </motion.figure>
      </motion.div>

      {/* --------------------------------
          FOOT
      -------------------------------- */}
      <motion.div
        className="hero__foot"
        initial={{
          opacity: 0,
          y: 24,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 1.45,
          duration: 0.85,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <ul className="hero__meta">
          {hero.meta.map((item, index) => (
            <motion.li
              key={item.label}
              custom={index}
              variants={metaVariants}
              initial="hidden"
              animate="show"
            >
              <span className="font-mono">
                {item.label}
              </span>

              <span>
                {item.value}
              </span>
            </motion.li>
          ))}
        </ul>

        <motion.a
          href={hero.ctaHref}
          className="hero__cta"
          data-cursor="link"
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.94,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            delay: 1.65,
            duration: 0.75,
            ease: [0.16, 1, 0.3, 1],
          }}
          whileHover={{
            y: -4,
            scale: 1.04,
          }}
          whileTap={{
            scale: 0.96,
          }}
        >
          <span>{hero.ctaLabel}</span>

          <motion.span
            className="hero__cta-arrow"
            aria-hidden="true"
            animate={{
              y: [0, 5, 0],
            }}
            transition={{
              duration: 1.7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ↓
          </motion.span>
        </motion.a>
      </motion.div>
    </section>
  );
}