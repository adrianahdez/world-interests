import React, { useEffect, useRef, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import './CountryPanel.scss';
import { CountryPanelContext } from '../Common/CountryPanelContext';
import { LanguageContext } from '../Common/LanguageContext';
import translations from '../Common/translations';
import { useCountryHistory } from '../hooks/useCountryHistory';

// Returns a human-readable relative time string from an ISO date string.
// Falls back to null if the date is missing or unparseable.
function relativeTime(isoDate, tr) {
  if (!isoDate) return null;
  const then = new Date(isoDate);
  if (isNaN(then.getTime())) return null;
  const diffDays = Math.floor((Date.now() - then.getTime()) / 86400000);
  if (diffDays < 1)  return tr.today;
  if (diffDays === 1) return tr.yesterday;
  if (diffDays < 7)  return diffDays + ' ' + tr.daysAgo;
  const weeks = Math.floor(diffDays / 7);
  if (weeks < 5)     return weeks + ' ' + tr.weeksAgo;
  return Math.floor(diffDays / 30) + ' ' + tr.monthsAgo;
}

// Render CountryPanel component
export default function CountryPanel({ category, categoryName }) {
  const { isCountryPanelOpen, selectedCountry, closeCountryPanel, countryChannels } = useContext(CountryPanelContext);
  const { isEs } = useContext(LanguageContext);
  const dialogRef = useRef(null);
  const tr = isEs ? translations.es : translations.en;

  const alpha2 = selectedCountry?.alpha2 ?? null;
  const countryName = selectedCountry?.countryName || alpha2 || '';
  const flag = selectedCountry?.flag || '';

  const [retryTrigger, setRetryTrigger] = useState(0);
  const handleRetry = useCallback(() => setRetryTrigger(n => n + 1), []);

  const { data, isLoading, isEmpty, error } = useCountryHistory(alpha2, category, countryChannels, retryTrigger);

  // Open / close the native <dialog> element, matching the InfoSidebar animation pattern.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isCountryPanelOpen) {
      dialog.classList.remove('country-panel--closing');
      dialog.show();
    } else if (dialog.open) {
      dialog.classList.add('country-panel--closing');
      const onAnimationEnd = () => {
        dialog.classList.remove('country-panel--closing');
        dialog.close();
      };
      dialog.addEventListener('animationend', onAnimationEnd, { once: true });
      return () => dialog.removeEventListener('animationend', onAnimationEnd);
    }
  }, [isCountryPanelOpen]);

  // Close on Escape key.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCountryPanelOpen) closeCountryPanel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCountryPanelOpen, closeCountryPanel]);

  // Reset retryTrigger whenever the country or category changes so stale retry state
  // does not carry over to the next country/category combination.
  useEffect(() => { setRetryTrigger(0); }, [alpha2, category]);

  const daysLabel = data
    ? `${tr.basedOnData} ${data.days} ${data.days === 1 ? tr.day : tr.days}`
    : null;

  const lastUpdatedLabel = data?.latest_capture_at
    ? `${tr.lastUpdated} ${relativeTime(data.latest_capture_at, tr)}`
    : null;

  const showPartialNotice = data && data.channels.length < countryChannels;

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="country-panel__state" role="status" aria-live="polite">
          <div className="country-panel__spinner" aria-label={tr.countryPanelLoading} />
          <p>{tr.countryPanelLoading}</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="country-panel__state country-panel__state--error">
          <p>{tr.countryPanelError}</p>
          <button type="button" className="country-panel__retry-btn" onClick={handleRetry}>
            {tr.countryPanelRetry}
          </button>
        </div>
      );
    }
    if (isEmpty) {
      return (
        <div className="country-panel__state">
          <p>{tr.countryPanelComingSoon}</p>
        </div>
      );
    }
    if (!data) return null;

    return (
      <>
        {showPartialNotice && (
          <p className="country-panel__partial-notice">
            {tr.showingOf} {data.channels.length} {tr.ofRequested} {countryChannels} {tr.requestedChannels}
          </p>
        )}
        <ul className="country-panel__channel-list">
          {data.channels.map((ch, i) => (
            <ChannelCard key={ch.youtube_id} channel={ch} rank={i + 1} tr={tr} />
          ))}
        </ul>
      </>
    );
  };

  return (
    <dialog ref={dialogRef} className="country-panel" aria-label={tr.countryPanelAriaLabel}>
      <div className="country-panel__inner">
        {/* ── Fixed header ─────────────────────────────────────────────────── */}
        <div className="country-panel__header">
          <div className="country-panel__header-row">
            <div className="country-panel__title">
              {flag && <span className="country-panel__flag">{flag}</span>}
              <h2 className="country-panel__country-name">{countryName}</h2>
            </div>
            <div className="close-icon">
              <button type="button" className="toggle-btn" onClick={closeCountryPanel} aria-label="Close">
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
          <div className="country-panel__meta">
            {categoryName && (
              <span className="country-panel__meta-item">{tr.countryPanelCategory} <strong>{categoryName}</strong></span>
            )}
            {daysLabel && (
              <span className="country-panel__meta-item">{daysLabel}</span>
            )}
            {lastUpdatedLabel && (
              <span className="country-panel__meta-item">{lastUpdatedLabel}</span>
            )}
          </div>
        </div>

        {/* ── Scrollable body ───────────────────────────────────────────────── */}
        <div className="country-panel__body">
          {renderBody()}
        </div>
      </div>
    </dialog>
  );
}

// ── Channel card ──────────────────────────────────────────────────────────────

function ChannelCard({ channel, rank, tr }) {
  const thumbnailUrl = `https://img.youtube.com/vi/${channel.peak_video.youtube_id}/mqdefault.jpg`;

  return (
    <li className="channel-card">
      <div className="channel-card__rank">#{rank}</div>
      <div className="channel-card__content">

        {/* Channel identity */}
        <div className="channel-card__channel">
          {channel.image_url && (
            <img
              className="channel-card__avatar"
              src={channel.image_url}
              alt={channel.title}
              loading="lazy"
            />
          )}
          <div className="channel-card__channel-info">
            <a
              className="channel-card__channel-name"
              href={`https://youtube.com/channel/${channel.youtube_id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {channel.title}
            </a>
            <span className="channel-card__appearances">
              {channel.appearances} {tr.seenTimes}
            </span>
          </div>
        </div>

        {/* Peak video */}
        <div className="channel-card__video">
          <p className="channel-card__video-label">{tr.peakVideo}</p>
          <a
            href={`https://www.youtube.com/watch?v=${channel.peak_video.youtube_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="channel-card__thumbnail-link"
          >
            <img
              className="channel-card__thumbnail"
              src={thumbnailUrl}
              alt={channel.peak_video.title}
              loading="lazy"
            />
          </a>
          <a
            href={`https://www.youtube.com/watch?v=${channel.peak_video.youtube_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="channel-card__video-title"
          >
            {channel.peak_video.title}
          </a>
          <div className="channel-card__stats">
            <span>👁 {Number(channel.peak_video.view_count).toLocaleString()}</span>
            <span>👍 {Number(channel.peak_video.like_count).toLocaleString()}</span>
            <span>💬 {Number(channel.peak_video.comment_count).toLocaleString()}</span>
          </div>
        </div>

      </div>
    </li>
  );
}

CountryPanel.propTypes = {
  category: PropTypes.string.isRequired,
  categoryName: PropTypes.string,
};

ChannelCard.propTypes = {
  channel: PropTypes.object.isRequired,
  rank: PropTypes.number.isRequired,
  tr: PropTypes.object.isRequired,
};
