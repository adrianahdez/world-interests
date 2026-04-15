import React, { useContext, useState, useEffect } from 'react';
import './Footer.scss';
import { LanguageContext } from '../Common/LanguageContext';
import translations from '../Common/translations';

// Height values kept in sync with --footer-height in _theme.scss
const FOOTER_HEIGHT_OPEN      = '36px';
const FOOTER_HEIGHT_COLLAPSED = '28px';

// Render Footer component
export default function Footer() {
  const { isEs } = useContext(LanguageContext);

  const tr = isEs ? translations.es : translations.en;

  // Restore collapse state from localStorage (default: open)
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const stored = localStorage.getItem('footerOpen');
      return stored !== null ? stored === 'true' : true;
    } catch (_) {
      return true;
    }
  });

  // Persist state and keep --footer-height in sync with the current state.
  // Runs on mount too, so a stored collapsed state is applied before first paint.
  useEffect(() => {
    try { localStorage.setItem('footerOpen', isOpen); } catch (_) {}
    document.documentElement.style.setProperty(
      '--footer-height',
      isOpen ? FOOTER_HEIGHT_OPEN : FOOTER_HEIGHT_COLLAPSED
    );
  }, [isOpen]);

  return (
    <footer className={isOpen ? '' : 'footer--collapsed'}>
      <div className="footer-content">
        <div className="footer-row">
          <span className="footer-title">{tr.footerTitle}</span>
          <span className="footer-sep" aria-hidden="true">·</span>
          <span className="footer-desc">{tr.footerDesc}</span>
          <span className="footer-sep" aria-hidden="true">·</span>
          <span className="footer-dev">
            © {new Date().getFullYear()}. {tr.developedBy}
            <a target="_blank" href="https://github.com/adrianahdez">Adriana Hernández Regueiro.</a>
          </span>
        </div>
        <button
          className="footer-toggle"
          onClick={() => setIsOpen(prev => !prev)}
          aria-label={isOpen ? tr.footerCollapse : tr.footerExpand}
          aria-expanded={isOpen}
        >
          {isOpen ? '▾' : '▴'}
        </button>
      </div>
    </footer>
  );
}
