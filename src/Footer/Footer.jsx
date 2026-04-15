import React, { useContext } from 'react';
import './Footer.scss';
import { LanguageContext } from '../Common/LanguageContext';
import translations from '../Common/translations';

// Render Footer component
export default function Footer() {
  const { isEs } = useContext(LanguageContext);

  const tr = isEs ? translations.es : translations.en;

  return (
    <footer>
      <div className="footer-content">
        <div className="footer-row">
          <span className="footer-title">{tr.footerTitle}</span>
          <span className="footer-sep" aria-hidden="true">|</span>
          <span className="footer-desc">{tr.footerDesc}</span>
          <span className="footer-sep" aria-hidden="true">|</span>
          <span className="footer-dev">
            © {new Date().getFullYear()}. {tr.developedBy}
            <a target="_blank" href="https://github.com/adrianahdez">Adriana Hernández Regueiro.</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
