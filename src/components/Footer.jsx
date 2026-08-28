import { footer } from "../data/content";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <p className="font-display footer__name">{footer.name}</p>
          <p className="footer__tagline">{footer.tagline}</p>
        </div>

        <ul className="footer__links">
          <li><a href="mailto:Syyedmaten@Gmail.com" data-cursor="link">Email</a></li>
          <li><a href="https://www.linkedin.com/in/syyedmateen/" data-cursor="link">LinkedIn</a></li>
          <li><a href="https://www.instagram.com/syyed_mateen/" data-cursor="link">Instagram</a></li>
          <li><a href="#" data-cursor="link">WhatsApp</a></li>
        </ul>

        <p className="footer__copy">© {footer.year} {footer.name}</p>
      </div>
    </footer>
  );
}
