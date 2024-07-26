import React from 'react';
import './Footer.css';

// Render Footer component
export default function Footer() {
  return (
    <footer>
      <div className="footer-content">
        <div className="what-is-this">
          <span className="i1">Which Youtube channels are most popular now (realtime)</span>
          <span className="i2">Data obtained from the YouTube API - You are viewing the #1 trending music video channel from each country.</span>
        </div>
        <span className="developer">
          © Developed by <a target="_blank" href="https://github.com/adrianahdez">Adriana Hernández</a>
        </span>
      </div>
    </footer>
  );
}