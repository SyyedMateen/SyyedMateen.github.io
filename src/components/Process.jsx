import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";

import { process } from "../data/content";
import ProcessVisual from "./ProcessVisual";

import "./Process.css";

export default function Process() {
  const ref = useRef(null);

  const [active, setActive] = useState(0);

  const steps = process.steps;

  const totalSteps = steps.length;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });


  /*
    Slow atmospheric movement.
  */
  const fieldRotate = useTransform(
    scrollYProgress,
    [0, 1],
    [0, 10]
  );


  /*
    Active step.
  */
  useMotionValueEvent(
    scrollYProgress,
    "change",
    (value) => {
      const safeValue = Math.max(
        0,
        Math.min(0.999999, value)
      );

      const nextIndex = Math.min(
        totalSteps - 1,
        Math.floor(
          safeValue * totalSteps
        )
      );

      setActive(nextIndex);
    }
  );


  return (
    <section
      ref={ref}
      className="process"
      style={{
        height: `${totalSteps * 68}vh`,
      }}
    >

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="process__sticky">

        <motion.div
          className="process__field"
          style={{
            rotate: fieldRotate,
          }}
          aria-hidden="true"
        />


        {/* ===================================================
            CONTENT
        =================================================== */}

        <div className="container process__inner">

          <p className="eyebrow eyebrow--light">
            {process.kicker}
          </p>


          <div className="process__body">


            {/* =================================================
                STEP LIST
            ================================================= */}

            <ol className="process__list">

              {steps.map((step, index) => {

                const isActive =
                  index === active;

                const isPast =
                  index < active;

                return (
                  <li
                    key={step.index}
                    className={[
                      "process__step",

                      isActive
                        ? "is-active"
                        : "",

                      isPast
                        ? "is-past"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >

                    <span className="process__step-index font-mono">
                      {step.index}
                    </span>

                    <span className="process__step-title font-display">
                      {step.title}
                    </span>

                  </li>
                );
              })}

            </ol>


            {/* =================================================
                DETAIL
            ================================================= */}

            <div className="process__detail">

              <div className="process__visual-wrap">
                <ProcessVisual active={active} />
              </div>


              <span className="process__detail-index font-mono">
                {steps[active].index} /{" "}
                {String(totalSteps).padStart(2, "0")}
              </span>


              <motion.p
                key={active}
                className="process__detail-copy"

                initial={{
                  opacity: 0,
                  y: 16,
                }}

                animate={{
                  opacity: 1,
                  y: 0,
                }}

                transition={{
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {steps[active].body}
              </motion.p>


              {/* =================================================
                  PROGRESS
              ================================================= */}

              <div
                className="process__progress"
                aria-hidden="true"
              >

                {steps.map((step, index) => (
                  <span
                    key={step.index}
                    className={
                      index <= active
                        ? "is-filled"
                        : ""
                    }
                  />
                ))}

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}