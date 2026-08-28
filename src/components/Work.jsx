import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import { work } from "../data/content";
import { images } from "../data/images";
import "./Work.css";

const EASE = [0.16, 1, 0.3, 1];

/* ========================================
   IMAGE CONTROL
======================================== */

/*
  IMPORTANT:
  Image par koi scale nahi hai.

  Agar image ko chhota/bada karna ho to
  CSS mein --work-image-scale change karo.
*/

const IMAGE_X = 0;
const IMAGE_Y = 0;

/* ========================================
   MOTION PRESETS
======================================== */

const MOTION_PRESETS = [
  {
    imageInitial: {
      clipPath: "inset(8% 8% 8% 8% round 14px)",
    },

    imageShow: {
      clipPath: "inset(0% 0% 0% 0% round 0px)",
    },

    textInitial: {
      y: 30,
      opacity: 0,
    },

    textShow: {
      y: 0,
      opacity: 1,
    },
  },

  {
    imageInitial: {
      clipPath: "inset(0% 100% 0% 0%)",
    },

    imageShow: {
      clipPath: "inset(0% 0% 0% 0%)",
    },

    textInitial: {
      x: -28,
      opacity: 0,
    },

    textShow: {
      x: 0,
      opacity: 1,
    },
  },

  {
    imageInitial: {
      clipPath: "inset(100% 0% 0% 0%)",
    },

    imageShow: {
      clipPath: "inset(0% 0% 0% 0%)",
    },

    textInitial: {
      y: 28,
      opacity: 0,
    },

    textShow: {
      y: 0,
      opacity: 1,
    },
  },
];

/* ========================================
   STATUS
======================================== */

function getStatusType(status = "") {
  const value = status.toLowerCase();

  if (value.includes("live")) return "live";
  if (value.includes("development")) return "development";
  if (value.includes("ongoing")) return "ongoing";

  return "default";
}

/* ========================================
   IMAGE RESOLVER
======================================== */

function resolveProjectImage(project) {
  if (project.image === "whatsapp-yakka-HQ.gif") {
    return {
      url: "/whatsapp-yakka-HQ.gif",
      alt: project.title || "WhatsApp Yakka HQ",
    };
  }

  return images[project.image];
}

/* ========================================
   PROJECT CARD
======================================== */

function ProjectCard({ project, index }) {
  const ref = useRef(null);

  const isInView = useInView(ref, {
    once: false,
    amount: 0.25,
    margin: "0px 0px -10% 0px",
  });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /*
    ONLY vertical parallax.

    NO scale.
  */
  const parallax = useTransform(
    scrollYProgress,
    [0, 1],
    index === 0
      ? [-12, 12]
      : index === 1
        ? [10, -10]
        : [-8, 8]
  );

  const image = resolveProjectImage(project);

  const preset =
    MOTION_PRESETS[index % MOTION_PRESETS.length];

  const statusType = getStatusType(project.status);

  return (
    <motion.article
      ref={ref}
      className={`work-card work-card--${
        project.layout || "large"
      } work-card--accent-${
        project.accent || "purple"
      }`}
      data-cursor="project"
      initial={{
        opacity: 0,
        y: 55,
      }}
      animate={
        isInView
          ? {
              opacity: 1,
              y: 0,
            }
          : {
              opacity: 0,
              y: 55,
            }
      }
      transition={{
        duration: 0.9,
        ease: EASE,
      }}
    >
      <motion.div
        className="work-card__frame"
        whileHover={{
          y: -6,
        }}
        transition={{
          duration: 0.7,
          ease: EASE,
        }}
      >
        {/* AMBIENT */}
        <div
          className="work-card__ambient"
          aria-hidden="true"
        />

        {/* ========================================
            IMAGE
        ======================================== */}

        <motion.div
          className="work-card__image-wrap"
          style={{
            y: parallax,
            x: IMAGE_X,
          }}
          initial={{
            ...preset.imageInitial,
          }}
          animate={
            isInView
              ? {
                  ...preset.imageShow,
                }
              : {
                  ...preset.imageInitial,
                }
          }
          transition={{
            duration: 1.15,
            delay: 0.08,
            ease: EASE,
          }}
        >
          {image?.url ? (
            <img
              src={image.url}
              alt={image.alt || project.title}
              loading={index === 0 ? "eager" : "lazy"}
              draggable="false"
            />
          ) : (
            <div className="work-card__image-fallback">
              <span>{project.title}</span>
            </div>
          )}
        </motion.div>

        {/* SCRIM */}
        <div
          className="work-card__scrim"
          aria-hidden="true"
        />

        {/* TOP INFO */}
        <div className="work-card__top">
          <span
            className={`work-card__status work-card__status--${statusType} font-mono`}
          >
            <span className="work-card__status-dot" />

            {project.status}
          </span>

          <span className="work-card__number font-mono">
            {project.id}
          </span>
        </div>

        {/* CASE STUDY */}
        <div className="work-card__marker font-mono">
          <span>CASE STUDY</span>

          <span>
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* OVERLAY */}
        <div className="work-card__overlay-content">
          <p className="work-card__overlay-category font-mono">
            {project.category}
          </p>

          <div className="work-card__overlay-heading">
            <h3 className="font-display">
              {project.title}
            </h3>

            <span
              className="work-card__overlay-arrow"
              aria-hidden="true"
            >
              ↗
            </span>
          </div>
        </div>

        {/* ACCENT */}
        <div
          className="work-card__accent-line"
          aria-hidden="true"
        />
      </motion.div>

      {/* META */}
      <motion.div
        className="work-card__meta"
        initial={preset.textInitial}
        animate={
          isInView
            ? preset.textShow
            : preset.textInitial
        }
        transition={{
          duration: 0.8,
          delay: 0.22,
          ease: EASE,
        }}
      >
        <div className="work-card__meta-left">
          <span className="font-mono">
            SYSTEM / {project.id}
          </span>

          <span className="work-card__meta-index font-mono">
            2026
          </span>
        </div>

        <div className="work-card__meta-right">
          <p className="work-card__description">
            {project.description}
          </p>

          <div className="work-card__meta-bottom">
            <div className="work-card__tags">
              {project.tags?.map((tag) => (
                <span
                  key={tag}
                  className="work-card__tag font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>

            <span className="work-card__view font-mono">
              VIEW SYSTEM ↗
            </span>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

/* ========================================
   WORK
======================================== */

export default function Work() {
  return (
    <section
      id="work"
      className="work section"
    >
      <div
        className="work__glow work__glow--one"
        aria-hidden="true"
      />

      <div
        className="work__glow work__glow--two"
        aria-hidden="true"
      />

      <div
        className="work__grid-bg"
        aria-hidden="true"
      />

      <div className="container">

        {/* INTRO */}
        <motion.div
          className="work__intro"
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.9,
            ease: EASE,
          }}
        >
          <div className="work__intro-main">
            <div className="work__eyebrow-row">
              <span className="work__eyebrow-line" />

              <p className="eyebrow">
                {work.kicker}
              </p>
            </div>

            <h2 className="font-display work__heading">
              Systems
              <span>that actually</span>
              <em>ship</em>
            </h2>
          </div>

          <div className="work__intro-side">
            <p className="work__intro-copy">
              A small selection of AI systems and digital
              products built to solve real problems — not
              just look impressive in a demo.
            </p>

            <div className="work__intro-status">
              <span className="work__intro-dot" />

              <span className="font-mono">
                SELECTED WORK / 2026
              </span>
            </div>
          </div>
        </motion.div>

        {/* PROJECTS */}
        <div className="work__list">
          {work.projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
            />
          ))}
        </div>

        {/* END */}
        <motion.div
          className="work__end"
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.5,
          }}
          transition={{
            duration: 0.8,
            ease: EASE,
          }}
        >
          <span className="font-mono">
            MORE SYSTEMS IN PROGRESS
          </span>

          <span className="work__end-line" />

          <span className="font-mono">
            {String(work.projects.length).padStart(2, "0")}{" "}
            /{" "}
            {String(work.projects.length).padStart(2, "0")}
          </span>
        </motion.div>

      </div>
    </section>
  );
}
