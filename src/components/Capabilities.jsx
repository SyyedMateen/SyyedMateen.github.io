import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { capabilities } from "../data/content";
import "./Capabilities.css";

export default function Capabilities() {
  const sectionRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const activeIndexRef = useRef(0);
  const wheelLockRef = useRef(false);
  const wheelTimerRef = useRef(null);
  const touchStartYRef = useRef(null);
  const touchLockRef = useRef(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const stageCount = capabilities.length;
  const lastStage = stageCount - 1;

  const updateActiveIndex = (index) => {
    const safeIndex = Math.max(0, Math.min(lastStage, index));

    activeIndexRef.current = safeIndex;
    setActiveIndex((current) =>
      current === safeIndex ? current : safeIndex
    );
  };

  const getStageScrollTop = (index) => {
    const section = sectionRef.current;

    if (!section) {
      return window.scrollY;
    }

    const sectionTop =
      section.getBoundingClientRect().top + window.scrollY;

    const scrollDistance = Math.max(
      0,
      section.offsetHeight - window.innerHeight
    );

    const stageProgress =
      lastStage === 0 ? 0 : index / lastStage;

    return sectionTop + scrollDistance * stageProgress;
  };

  const goToStage = (index, behavior = "smooth") => {
    const safeIndex = Math.max(0, Math.min(lastStage, index));

    updateActiveIndex(safeIndex);

    window.scrollTo({
      top: getStageScrollTop(safeIndex),
      behavior,
    });
  };

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const progress = Math.max(0, Math.min(1, latest));

    /*
      Four stages are distributed over the entire sticky travel:
      0%   = stage 1
      33%  = stage 2
      66%  = stage 3
      100% = stage 4
    */

    const nextIndex =
      lastStage === 0
        ? 0
        : Math.round(progress * lastStage);

    activeIndexRef.current = nextIndex;

    setActiveIndex((current) =>
      current === nextIndex ? current : nextIndex
    );
  });

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const unlockWheel = () => {
      wheelLockRef.current = false;
    };

    const handleWheel = (event) => {
      /*
        Don't interfere with browser zoom gestures.
      */
      if (event.ctrlKey) return;

      const direction = event.deltaY > 0 ? 1 : -1;

      const current = activeIndexRef.current;

      /*
        At the first stage:
        scrolling UP should leave Toolkit naturally.
      */
      if (direction < 0 && current <= 0) {
        return;
      }

      /*
        At the last stage:
        scrolling DOWN should leave Toolkit naturally.
      */
      if (direction > 0 && current >= lastStage) {
        return;
      }

      /*
        One wheel gesture = exactly one stage.
      */
      if (wheelLockRef.current) {
        event.preventDefault();
        return;
      }

      event.preventDefault();

      wheelLockRef.current = true;

      const nextStage = current + direction;

      goToStage(nextStage);

      clearTimeout(wheelTimerRef.current);

      wheelTimerRef.current = setTimeout(
        unlockWheel,
        800
      );
    };

    const handleTouchStart = (event) => {
      if (!event.touches?.length) return;

      touchStartYRef.current = event.touches[0].clientY;
      touchLockRef.current = false;
    };

    const handleTouchMove = (event) => {
      if (
        touchStartYRef.current === null ||
        !event.touches?.length
      ) {
        return;
      }

      const currentY = event.touches[0].clientY;
      const delta = touchStartYRef.current - currentY;

      if (Math.abs(delta) < 12) return;

      const direction = delta > 0 ? 1 : -1;
      const current = activeIndexRef.current;

      /*
        Swipe up = next stage
        Swipe down = previous stage
      */

      if (direction > 0 && current >= lastStage) {
        return;
      }

      if (direction < 0 && current <= 0) {
        return;
      }

      /*
        Lock native movement while the stage changes.
      */
      event.preventDefault();

      if (touchLockRef.current) return;

      touchLockRef.current = true;

      goToStage(current + direction);
    };

    const handleTouchEnd = () => {
      touchStartYRef.current = null;
      touchLockRef.current = false;
    };

    section.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    section.addEventListener(
      "touchstart",
      handleTouchStart,
      {
        passive: true,
      }
    );

    section.addEventListener(
      "touchmove",
      handleTouchMove,
      {
        passive: false,
      }
    );

    section.addEventListener(
      "touchend",
      handleTouchEnd,
      {
        passive: true,
      }
    );

    section.addEventListener(
      "touchcancel",
      handleTouchEnd,
      {
        passive: true,
      }
    );

    return () => {
      section.removeEventListener(
        "wheel",
        handleWheel
      );

      section.removeEventListener(
        "touchstart",
        handleTouchStart
      );

      section.removeEventListener(
        "touchmove",
        handleTouchMove
      );

      section.removeEventListener(
        "touchend",
        handleTouchEnd
      );

      section.removeEventListener(
        "touchcancel",
        handleTouchEnd
      );

      clearTimeout(wheelTimerRef.current);
    };
  }, [lastStage]);

  const activeGroup = capabilities[activeIndex];

  return (
    <section
      ref={sectionRef}
      id="capabilities"
      className="capabilities"
    >
      <div className="capabilities__sticky">
        <div className="container">

          {/* TOP */}
          <div className="capabilities__top">
            <p className="capabilities__eyebrow">
              / TOOLKIT
            </p>

            <p className="capabilities__counter">
              {String(activeIndex + 1).padStart(2, "0")}{" "}
              —{" "}
              {String(stageCount).padStart(2, "0")}
            </p>
          </div>

          {/* MAIN */}
          <div className="capabilities__layout">

            {/* LEFT */}
            <div className="capabilities__left">

              <p className="capabilities__label">
                WHAT I WORK WITH
              </p>

              <div className="capabilities__heading-wrap">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={activeGroup.group}
                    className="capabilities__heading font-display"
                    initial={{
                      opacity: 0,
                      y: 30,
                      filter: "blur(8px)",
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      y: -25,
                      filter: "blur(8px)",
                    }}
                    transition={{
                      duration: 0.55,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {activeGroup.group}
                  </motion.h2>
                </AnimatePresence>
              </div>

              <p className="capabilities__copy">
                A focused toolkit built around the problems —
                not the tools.
              </p>

              {/* PROGRESS */}
              <div className="capabilities__progress">
                {capabilities.map((group, index) => (
                  <button
                    key={group.group}
                    type="button"
                    className={`capabilities__progress-item ${
                      index === activeIndex
                        ? "is-active"
                        : ""
                    } ${
                      index < activeIndex
                        ? "is-passed"
                        : ""
                    }`}
                    onClick={() =>
                      goToStage(index)
                    }
                    aria-label={`View ${group.group}`}
                  >
                    <span className="capabilities__progress-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="capabilities__progress-line">
                      <i />
                    </span>

                    <span className="capabilities__progress-name">
                      {group.group}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <motion.div
              className="capabilities__right"
              layout
            >
              <div className="capabilities__tools-head">
                <span>
                  SELECTED TOOLS
                </span>

                <span>
                  {String(
                    activeGroup.items.length
                  ).padStart(2, "0")}{" "}
                  ITEMS
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.ul
                  key={activeGroup.group}
                  className="capabilities__tools"
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
                    y: -18,
                  }}
                  transition={{
                    duration: 0.45,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {activeGroup.items.map(
                    (item, index) => (
                      <motion.li
                        key={item}
                        initial={{
                          opacity: 0,
                          x: 18,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          duration: 0.4,
                          delay:
                            index * 0.045,
                          ease: [
                            0.16,
                            1,
                            0.3,
                            1,
                          ],
                        }}
                      >
                        <span className="capabilities__tool-index">
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </span>

                        <span className="capabilities__tool-name font-display">
                          {item}
                        </span>

                        <span className="capabilities__tool-arrow">
                          ↗
                        </span>
                      </motion.li>
                    )
                  )}
                </motion.ul>
              </AnimatePresence>

              <div className="capabilities__signal">
                <span className="capabilities__signal-dot" />

                <span>
                  BUILT AROUND THE PROBLEM —
                  NOT THE TOOL
                </span>
              </div>
            </motion.div>
          </div>

          {/* BOTTOM */}
          <div className="capabilities__bottom">
            <p>
              SCROLL TO EXPLORE
            </p>

            <span className="capabilities__scroll-line">
              <motion.i
                style={{
                  scaleX:
                    scrollYProgress,
                }}
              />
            </span>

            <span>
              {String(activeIndex + 1).padStart(
                2,
                "0"
              )}{" "}
              /{" "}
              {String(stageCount).padStart(
                2,
                "0"
              )}
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}