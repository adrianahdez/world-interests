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
        <div className="what-is-this">
          <h1 className="i1">{tr.footerTitle}</h1>
          <span className="i2">{tr.footerDesc}</span>
        </div>
        <span className="developer">
          © {new Date().getFullYear()}. {tr.developedBy} <a target="_blank" href="https://github.com/adrianahdez">Adriana Hernández Regueiro.</a>
        </span>
      </div>
    </footer>
  );
}