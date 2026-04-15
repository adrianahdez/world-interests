import React, { useContext, useRef, useEffect } from 'react';
import './Footer.scss';
import { LanguageContext } from '../Common/LanguageContext';
import translations from '../Common/translations';

// Render Footer component
export default function Footer() {
  const { isEs } = useContext(LanguageContext);
  const tr = isEs ? translations.es : translations.en;
  const footerRef = useRef(null);

  // Keep --footer-height in sync with the footer's actual rendered height.
  // ResizeObserver fires whenever the footer grows or shrinks (e.g. text wrapping
  // at different viewport widths), so the map always fills exactly the remaining space.
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const height = Math.round(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height);
        document.documentElement.style.setProperty('--footer-height', `${height}px`);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={footerRef}>
      <div className="footer-content">
        <div className="footer-row">
          <span className="footer-title">{tr.footerTitle}</span>
          <span className="footer-sep" aria-hidden="true">|</span>
          <span className="footer-desc">{tr.footerDesc}</span>
          <span className="footer-sep" aria-hidden="true">|</span>
          <span className="footer-dev">
            © {new Date().getFullYear()}. {tr.developedBy}
            <a target="_blank" rel="noopener noreferrer" href="https://github.com/adrianahdez">Adriana Hernández Regueiro.</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
