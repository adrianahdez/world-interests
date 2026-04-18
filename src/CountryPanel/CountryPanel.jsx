import React, { useEffect, useRef, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import './CountryPanel.scss';
import { CountryPanelContext } from '../Common/CountryPanelContext';
import { LanguageContext } from '../Common/LanguageContext';
import translations from '../Common/translations';
import { useCountryHistory } from '../hooks/useCountryHistory';
import { IconEye, IconThumbUp, IconComment } from '../Common/Icons';
import AppearancesTooltip from './AppearancesTooltip';

// Returns a JSX "Last updated …" label with the time portion in bold.
// Uses separate lastUpdatedRecent / lastUpdatedAgo keys so Spanish avoids
// the grammatically wrong "Actualizado hace hoy" construction.
function buildLastUpdatedLabel(isoDate, tr) {
  if (!isoDate) return null;
  const then = new Date(isoDate);
  if (isNaN(then.getTime())) return null;
  const diffDays = Math.floor((Date.now() - then.getTime()) / 86400000);
  if (diffDays < 1)  return <>{tr.lastUpdatedRecent} <strong>{tr.today}</strong></>;
  if (diffDays === 1) return <>{tr.lastUpdatedRecent} <strong>{tr.yesterday}</strong></>;
  if (diffDays < 7)  return <>{tr.lastUpdatedAgo} <strong>{diffDays} {tr.daysAgo}</strong></>;
  const weeks = Math.floor(diffDays / 7);
  if (weeks < 5)     return <>{tr.lastUpdatedAgo} <strong>{weeks} {tr.weeksAgo}</strong></>;
  return <>{tr.lastUpdatedAgo} <strong>{Math.floor(diffDays / 30)} {tr.monthsAgo}</strong></>;
}

// Render CountryPanel component
export default function CountryPanel({ category, categoryName }) {
  const { isCountryPanelOpen, selectedCountry, closeCountryPanel, countryChannels } = useContext(CountryPanelContext);
  const { isEs } = useContext(LanguageContext);
  const dialogRef = useRef(null);
  const tr = isEs ? translations.es : translations.en;

  const alpha2 = selectedCountry?.alpha2 ?? null;
  const flag = selectedCountry?.flag || '';

  const [retryTrigger, setRetryTrigger] = useState(0);
  const handleRetry = useCallback(() => setRetryTrigger(n => n + 1), []);

  const { data, isLoading, isEmpty, error } = useCountryHistory(alpha2, category, countryChannels, retryTrigger);

  // Prefer the localized name from the API; fall back to the GeoJSON name (English) while loading
  // or when the history endpoint returns country_name_es: null for a region YouTube has no ES for.
  const localizedApiName = isEs
    ? (data?.country_name_es || data?.country_name_en)
    : data?.country_name_en;
  const countryName = localizedApiName || selectedCountry?.countryName || alpha2 || '';

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

  // "Based on data from X day(s) ago" / "Basado en datos de hace X días" — number bolded.
  // tr.ago is "ago" in EN and "" in ES (ES bakes "hace" into basedOnData instead).
  const daysLabel = data
    ? <>{tr.basedOnData} <strong>{data.days} {data.days === 1 ? tr.day : tr.days}</strong>{tr.ago ? <> {tr.ago}</> : null}</>
    : null;

  // "Last updated today / X days ago / …" — time portion bolded.
  const lastUpdatedLabel = buildLastUpdatedLabel(data?.latest_capture_at ?? null, tr);

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
        {/* Always show channel count so the user knows how many results loaded */}
        <p className="country-panel__channel-count">
          {tr.showingOf} {data.channels.length} {tr.ofUpTo} {countryChannels} {tr.channels} {tr.basedOnSettings}
        </p>
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
            <h2 className="country-panel__country-name">
              {tr.countryPanelTitlePrefix} {flag} {countryName}
            </h2>
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
  const appearances = channel.appearances;
  const appearanceDates = channel.appearance_dates ?? [];

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
              referrerPolicy="no-referrer"
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
            <AppearancesTooltip dates={appearanceDates}>
              <span className="channel-card__appearances">
                {tr.channelLabel} {appearances}{' '}
                {appearances === 1 ? tr.channelDayAs : tr.channelDaysAs} #{rank}{' '}
                {tr.inDataHistory}
              </span>
            </AppearancesTooltip>
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
            <span><IconEye className="channel-card__stat-icon" /> {Number(channel.peak_video.view_count).toLocaleString()}</span>
            <span><IconThumbUp className="channel-card__stat-icon" /> {Number(channel.peak_video.like_count).toLocaleString()}</span>
            <span><IconComment className="channel-card__stat-icon" /> {Number(channel.peak_video.comment_count).toLocaleString()}</span>
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
