import React from 'react';
import './Footer.css';

// Render Footer component
export default function Footer() {
  return (
    <footer>
      <div className="footer-content">
        <div className="what-is-this">
          <h1 className="i1">Which Youtube channels are most popular now (realtime)</h1>
          <span className="i2">Data obtained from the YouTube API - You are viewing the #1 trending video channel from each country.</span>
        </div>
        <span className="developer">
          © Developed by <a target="_blank" href="https://github.com/adrianahdez">Adriana Hernández Regueiro.</a>
        </span>
      </div>
      {/* <!-- Cloudflare Web Analytics --> */}
      <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "126a755056a14b3bbc11a5f0ad03edd6"}'></script>
      {/* <!-- End Cloudflare Web Analytics --> */}
    </footer>
  );
}