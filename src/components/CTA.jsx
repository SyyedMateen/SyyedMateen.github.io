import { motion } from "framer-motion";
import { finalCta } from "../data/content";
import "./CTA.css";


function EmailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />

      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}


function LinkedInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M5.1 3.5A2.5 2.5 0 1 1 5.1 8.5a2.5 2.5 0 0 1 0-5ZM3 9.5h4.2V21H3V9.5Zm6.8 0H14v1.57h.06c.56-1.02 1.93-2.1 3.98-2.1 4.26 0 5.05 2.8 5.05 6.44V21h-4.2v-4.95c0-1.18-.02-2.7-1.65-2.7-1.65 0-1.9 1.28-1.9 2.61V21H9.8V9.5Z" />
    </svg>
  );
}


function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
      />

      <circle
        cx="17.4"
        cy="6.7"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}


function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M12 2.5a9.5 9.5 0 0 0-8.1 14.45L2.5 21.5l4.7-1.37A9.5 9.5 0 1 0 12 2.5Zm0 17a7.45 7.45 0 0 1-3.8-1.04l-.27-.16-2.78.81.83-2.71-.18-.28A7.48 7.48 0 1 1 12 19.5Zm4.07-5.48c-.22-.11-1.3-.64-1.5-.71-.2-.08-.35-.11-.5.11-.15.22-.57.71-.7.86-.13.15-.26.17-.48.06-.22-.11-.94-.35-1.8-1.1-.67-.59-1.12-1.31-1.25-1.53-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.06-.11-.5-1.2-.69-1.65-.18-.43-.36-.37-.5-.38h-.43c-.15 0-.39.06-.59.28-.2.22-.77.75-.77 1.83s.79 2.12.9 2.27c.11.15 1.55 2.36 3.75 3.31.52.23.93.37 1.25.48.52.17 1 .15 1.37.09.42-.06 1.3-.53 1.49-1.04.18-.5.18-.93.13-1.03-.06-.1-.2-.15-.42-.26Z" />
    </svg>
  );
}


function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H7.08l4.713 6.231 6.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}


function ContactIcon({ label }) {
  switch (label.toLowerCase()) {
    case "email":
      return <EmailIcon />;

    case "instagram":
      return <InstagramIcon />;

case "linkedin":
      return <LinkedInIcon />;

    case "whatsapp":
      return <WhatsAppIcon />;

    case "x":
      return <XIcon />;

    default:
      return null;
  }
}


export default function CTA() {
  return (
    <section
      id="contact"
      className="cta section"
    >

      <div className="container cta__inner">

        {/* =================================================
            HEADING
        ================================================= */}

        <motion.h2
          className="font-display"
          initial={{
            opacity: 0,
            y: 34,
            scale: 0.97,
            filter: "blur(8px)",
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
          }}
          viewport={{
            once: true,
            amount: 0.5,
          }}
          transition={{
            duration: 0.95,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {finalCta.heading}
        </motion.h2>


        {/* =================================================
            BODY
        ================================================= */}

        <motion.p
          className="cta__body"
          initial={{
            opacity: 0,
            y: 18,
            filter: "blur(5px)",
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          viewport={{
            once: true,
            amount: 0.6,
          }}
          transition={{
            duration: 0.7,
            delay: 0.12,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {finalCta.body}
        </motion.p>


        {/* =================================================
            BUTTON
        ================================================= */}

        <motion.a
          href={finalCta.ctaHref}
          className="cta__button"
          data-cursor="link"
          initial={{
            opacity: 0,
            y: 18,
            scale: 0.97,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
            delay: 0.25,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {finalCta.ctaLabel}

          <span aria-hidden="true">
            →
          </span>
        </motion.a>


        {/* =================================================
            CONTACTS
        ================================================= */}

        <ul className="cta__contacts">

          {finalCta.contacts.map(
            (c, index) => (
              <motion.li
                key={c.label}
                initial={{
                  opacity: 0,
                  y: 16,
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
                  duration: 0.55,
                  delay:
                    0.35 +
                    index * 0.08,
                  ease: [
                    0.16,
                    1,
                    0.3,
                    1,
                  ],
                }}
              >

                <a
                  href={c.href}
                  data-cursor="link"
                >

                  <span className="cta__contact-icon">
                    <ContactIcon
                      label={c.label}
                    />
                  </span>

                  <span className="font-mono">
                    {c.label}
                  </span>

                  <span>
                    {c.value}
                  </span>

                </a>

              </motion.li>
            )
          )}

        </ul>

      </div>

    </section>
  );
}
