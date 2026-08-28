import { motion } from "framer-motion";

const points = [
  { x: 28, y: 210 },
  { x: 105, y: 115 },
  { x: 190, y: 178 },
  { x: 142, y: 52 },
  { x: 245, y: 10 },
  { x: 330, y: 72 },
];


export default function ProcessVisual({
  active,
}) {
  const visiblePoints =
    points.slice(
      0,
      active + 1
    );


  const path = visiblePoints
    .map((point, index) => {
      return `${
        index === 0
          ? "M"
          : "L"
      } ${point.x} ${point.y}`;
    })
    .join(" ");


  return (
    <svg
      className="process-visual"
      viewBox="0 0 360 250"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >

      {/* =====================================================
          GRID
      ===================================================== */}

      <line
        x1="0"
        y1="225"
        x2="360"
        y2="225"
        className="process-visual__grid"
      />

      <line
        x1="0"
        y1="125"
        x2="360"
        y2="125"
        className="process-visual__grid"
      />

      <line
        x1="0"
        y1="25"
        x2="360"
        y2="25"
        className="process-visual__grid"
      />


      {/* =====================================================
          GRAPH
      ===================================================== */}

      {active > 0 && (
        <motion.path
          key={active}
          d={path}
          className="process-visual__line"
          fill="none"
          initial={{
            pathLength: 0,
            opacity: 0,
          }}
          animate={{
            pathLength: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      )}


      {/* =====================================================
          POINTS
      ===================================================== */}

      {points.map(
        (point, index) => {
          const isActive =
            index === active;

          const isPast =
            index < active;

          return (
            <g key={index}>

              {/* Glow */}

              {isActive && (
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r="24"
                  className="process-visual__glow"
                  initial={{
                    opacity: 0,
                    scale: 0.35,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.55,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              )}


              {/* Point */}

              <motion.circle
                cx={point.x}
                cy={point.y}
                r={
                  isActive
                    ? 6
                    : 3.5
                }
                className={[
                  "process-visual__point",
                  isActive
                    ? "is-active"
                    : "",
                  isPast
                    ? "is-past"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                animate={{
                  scale:
                    isActive
                      ? 1.28
                      : 1,
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />


              {/* Number */}

              <text
                x={point.x}
                y={point.y - 13}
                className={[
                  "process-visual__label",
                  isActive
                    ? "is-active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                0{index + 1}
              </text>

            </g>
          );
        }
      )}

    </svg>
  );
}