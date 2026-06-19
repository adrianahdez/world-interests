import React, { useEffect, useRef, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import './CountryPanel.scss';
import { CountryPanelContext } from '../Common/CountryPanelContext';
import { LanguageContext } from '../Common/LanguageContext';
import translations from '../Common/translations';
import { useCountryHistory } from '../hooks/useCountryHistory';
import { useCountryToday } from '../hooks/useCountryToday';
import { IconEye, IconThumbUp, IconComment, IconInfo } from '../Common/Icons';
import AppearancesTooltip from './AppearancesTooltip';
import LiveTimestamp from '../LiveTimestamp/LiveTimestamp';
import InfoTooltip from '../InfoTooltip/InfoTooltip';

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

// "<n> day(s) at #1" — the bolded appearance count shown on historical cards.
function daysAtNumberOne(appearances, tr) {
  return `${appearances} ${appearances === 1 ? tr.dayAtNumberOne : tr.daysAtNumberOne}`;
}

// Localized country name from an API payload (today or history), or null.
function localizedName(data, isEs) {
  if (!data) return null;
  return isEs ? (data.country_name_es || data.country_name_en) : data.country_name_en;
}

// Render CountryPanel component
export default function CountryPanel({ category, categoryName }) {
  const { isCountryPanelOpen, selectedCountry, closeCountryPanel, countryChannels, realtimeChannels } = useContext(CountryPanelContext);
  const { isEs } = useContext(LanguageContext);
  const dialogRef = useRef(null);
  const tr = isEs ? translations.es : translations.en;

  const alpha2 = selectedCountry?.alpha2 ?? null;
  const flag = selectedCountry?.flag || '';

  // Active tab: 'today' (real-time, default) or 'historical'. Real-time is the
  // primary view since the app is about live data; historical is secondary.
  const [activeTab, setActiveTab] = useState('today');

  // Localized country name reported by whichever tab's data loads (today/history
  // both return country_name_*). Falls back to the GeoJSON name while loading.
  const [apiName, setApiName] = useState(null);
  const handleName = useCallback((name) => { if (name) setApiName(name); }, []);
  const countryName = apiName || selectedCountry?.countryName || alpha2 || '';

  // Open / close the native <dialog> element, matching the ChannelPanel animation pattern.
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

  // On a new country: reset to the real-time tab and clear the resolved name.
  useEffect(() => { setActiveTab('today'); setApiName(null); }, [alpha2]);

  return (
    <dialog ref={dialogRef} className="country-panel" aria-label={tr.countryPanelAriaLabel}>
      <div className="country-panel__inner">
        {/* ── Fixed header: country name + tabs ─────────────────────────────── */}
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
          <div className="country-panel__tabs" role="tablist" aria-label={tr.countryPanelTabsAriaLabel}>
            <button
              type="button"
              role="tab"
              id="country-panel-tab-today"
              aria-selected={activeTab === 'today'}
              aria-controls="country-panel-panel-body"
              className={`country-panel__tab${activeTab === 'today' ? ' country-panel__tab--active' : ''}`}
              onClick={() => setActiveTab('today')}
            >
              {tr.countryPanelTabRealtime}
            </button>
            <button
              type="button"
              role="tab"
              id="country-panel-tab-historical"
              aria-selected={activeTab === 'historical'}
              aria-controls="country-panel-panel-body"
              className={`country-panel__tab${activeTab === 'historical' ? ' country-panel__tab--active' : ''}`}
              onClick={() => setActiveTab('historical')}
            >
              {tr.countryPanelTabHistorical}
            </button>
          </div>
        </div>

        {/* ── Scrollable body (active tab) ──────────────────────────────────── */}
        <div
          className="country-panel__body"
          id="country-panel-panel-body"
          role="tabpanel"
          aria-labelledby={activeTab === 'today' ? 'country-panel-tab-today' : 'country-panel-tab-historical'}
        >
          {activeTab === 'today' ? (
            <RealtimeTab
              alpha2={alpha2}
              category={category}
              categoryName={categoryName}
              realtimeChannels={realtimeChannels}
              isEs={isEs}
              tr={tr}
              onName={handleName}
            />
          ) : (
            <HistoricalTab
              alpha2={alpha2}
              category={category}
              categoryName={categoryName}
              countryChannels={countryChannels}
              isEs={isEs}
              tr={tr}
              onName={handleName}
            />
          )}
        </div>
      </div>
    </dialog>
  );
}

CountryPanel.propTypes = {
  category: PropTypes.string.isRequired,
  categoryName: PropTypes.string,
};


// ── Pestaña en vivo ─────────────────────────────────────────────────────────────
// Muestra el ranking del día (#1..#N) para el país, obtenido una vez al abrir.
// El timestamp "Actualizado:" es un reloj de pared en vivo — indicador de
// presencia, no de actualización del dato en el backend.

function RealtimeTab({ alpha2, category, categoryName, realtimeChannels, isEs, tr, onName }) {
  const [retryTrigger, setRetryTrigger] = useState(0);
  const handleRetry = useCallback(() => setRetryTrigger(n => n + 1), []);

  const { data, isLoading, isEmpty, error } = useCountryToday(alpha2, category, realtimeChannels, retryTrigger);

  // Report the localized country name up to the panel header when data lands.
  useEffect(() => { onName(localizedName(data, isEs)); }, [data, isEs, onName]);

  return (
    <>
      <div className="country-panel__meta">
        {categoryName && (
          <span className="country-panel__meta-item">{tr.countryPanelCategory} <strong>{categoryName}</strong></span>
        )}
        {/* No "Based on data…" label here — it does not apply to real-time data. */}
        <LiveTimestamp label={tr.countryPanelUpdated} />
      </div>

      {isLoading && (
        <div className="country-panel__state" role="status" aria-live="polite">
          <div className="country-panel__spinner" aria-label={tr.realtimeLoading} />
          <p>{tr.realtimeLoading}</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="country-panel__state country-panel__state--error">
          <p>{tr.realtimeError}</p>
          <button type="button" className="country-panel__retry-btn" onClick={handleRetry}>
            {tr.countryPanelRetry}
          </button>
        </div>
      )}

      {!isLoading && !error && isEmpty && (
        <div className="country-panel__state">
          <p>{tr.realtimeComingSoon}</p>
        </div>
      )}

      {!isLoading && !error && !isEmpty && data && (
        <>
          <p className="country-panel__channel-count">
            {tr.showingOf} {data.channels.length} {tr.ofUpTo} {realtimeChannels} {tr.channels} {tr.basedOnSettings}
          </p>
          <ul className="country-panel__channel-list">
            {data.channels.map((ch, i) => (
              <VideoCard key={`${ch.youtube_id}-${ch.video.youtube_id}`} channel={ch} video={ch.video} rank={i + 1} tr={tr} />
            ))}
          </ul>
        </>
      )}
    </>
  );
}

RealtimeTab.propTypes = {
  alpha2: PropTypes.string,
  category: PropTypes.string.isRequired,
  categoryName: PropTypes.string,
  realtimeChannels: PropTypes.number.isRequired,
  isEs: PropTypes.bool.isRequired,
  tr: PropTypes.object.isRequired,
  onName: PropTypes.func.isRequired,
};

// ── Historical tab ──────────────────────────────────────────────────────────────
// Two sub-views via a segmented toggle: Videos (default — each #1 video over time)
// and Channels (each channel that held #1, compact, no video). Both ordered by the
// number of distinct days at #1.

function HistoricalTab({ alpha2, category, categoryName, countryChannels, isEs, tr, onName }) {
  const [mode, setMode] = useState('videos'); // 'videos' | 'channels'
  const [retryTrigger, setRetryTrigger] = useState(0);
  const handleRetry = useCallback(() => setRetryTrigger(n => n + 1), []);

  const { data, isLoading, isEmpty, error } = useCountryHistory(alpha2, category, countryChannels, mode, retryTrigger);

  useEffect(() => { onName(localizedName(data, isEs)); }, [data, isEs, onName]);

  const daysLabel = data
    ? <>{tr.basedOnData} <strong>{data.days} {data.days === 1 ? tr.day : tr.days}</strong>{tr.ago ? <> {tr.ago}</> : null}</>
    : null;
  const lastUpdatedLabel = buildLastUpdatedLabel(data?.latest_capture_at ?? null, tr);

  const items = (mode === 'videos' ? data?.videos : data?.channels) ?? [];
  const noun = mode === 'videos' ? tr.videosNoun : tr.channels;

  return (
    <>
      <div className="country-panel__meta">
        {categoryName && (
          <span className="country-panel__meta-item">{tr.countryPanelCategory} <strong>{categoryName}</strong></span>
        )}
        {daysLabel && <span className="country-panel__meta-item">{daysLabel}</span>}
        {lastUpdatedLabel && <span className="country-panel__meta-item">{lastUpdatedLabel}</span>}
      </div>

      {/* Sub-toggle: Videos (default) | Channels, with info icon */}
      <div className="country-panel__subtabs-row">
        <div className="country-panel__subtabs" role="tablist" aria-label={tr.historicalViewAriaLabel}>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'videos'}
            className={`country-panel__subtab${mode === 'videos' ? ' country-panel__subtab--active' : ''}`}
            onClick={() => setMode('videos')}
          >
            {tr.historicalVideos}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'channels'}
            className={`country-panel__subtab${mode === 'channels' ? ' country-panel__subtab--active' : ''}`}
            onClick={() => setMode('channels')}
          >
            {tr.historicalChannels}
          </button>
        </div>
        <InfoTooltip text={mode === 'videos' ? tr.historicalInfoVideos : tr.historicalInfoChannels}>
          <IconInfo className="country-panel__info-icon" />
        </InfoTooltip>
      </div>

      {isLoading && (
        <div className="country-panel__state" role="status" aria-live="polite">
          <div className="country-panel__spinner" aria-label={tr.countryPanelLoading} />
          <p>{tr.countryPanelLoading}</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="country-panel__state country-panel__state--error">
          <p>{tr.countryPanelError}</p>
          <button type="button" className="country-panel__retry-btn" onClick={handleRetry}>
            {tr.countryPanelRetry}
          </button>
        </div>
      )}

      {!isLoading && !error && isEmpty && (
        <div className="country-panel__state">
          <p>{tr.countryPanelComingSoon}</p>
        </div>
      )}

      {!isLoading && !error && !isEmpty && data && (
        <>
          <p className="country-panel__channel-count">
            {tr.showingOf} {items.length} {tr.ofUpTo} {countryChannels} {noun} {tr.basedOnSettings}
          </p>
          <ul className="country-panel__channel-list">
            {mode === 'videos'
              ? items.map((v, i) => (
                  <VideoCard
                    key={`${v.channel.youtube_id}-${v.youtube_id}`}
                    channel={v.channel}
                    video={v}
                    rank={i + 1}
                    appearances={v.appearances}
                    appearanceDates={v.appearance_dates}
                    tr={tr}
                  />
                ))
              : items.map((ch, i) => (
                  <ChannelCard key={ch.youtube_id} channel={ch} rank={i + 1} tr={tr} />
                ))}
          </ul>
        </>
      )}
    </>
  );
}

HistoricalTab.propTypes = {
  alpha2: PropTypes.string,
  category: PropTypes.string.isRequired,
  categoryName: PropTypes.string,
  countryChannels: PropTypes.number.isRequired,
  isEs: PropTypes.bool.isRequired,
  tr: PropTypes.object.isRequired,
  onName: PropTypes.func.isRequired,
};

// ── Cards ───────────────────────────────────────────────────────────────────────

// Channel avatar + name link, with an optional "<n> days at #1" line (tooltip of
// the dates). Shared by VideoCard and ChannelCard.
function ChannelIdentity({ channel, appearances, appearanceDates, tr }) {
  return (
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
        {appearances != null && (
          <AppearancesTooltip dates={appearanceDates ?? []}>
            <span className="channel-card__appearances">{daysAtNumberOne(appearances, tr)}</span>
          </AppearancesTooltip>
        )}
      </div>
    </div>
  );
}

ChannelIdentity.propTypes = {
  channel: PropTypes.object.isRequired,
  appearances: PropTypes.number,
  appearanceDates: PropTypes.arrayOf(PropTypes.string),
  tr: PropTypes.object.isRequired,
};

// A ranked video card: channel identity + the video (thumbnail, title, stats).
// Used by both the real-time tab and the historical Videos sub-view. When
// `appearances` is given (historical), shows a "<n> days at #1" line with a tooltip.
function VideoCard({ channel, video, rank, appearances, appearanceDates, tr }) {
  const watchUrl = `https://www.youtube.com/watch?v=${video.youtube_id}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`;

  return (
    <li className="channel-card">
      <div className="channel-card__rank">#{rank}</div>
      <div className="channel-card__content">

        <ChannelIdentity channel={channel} appearances={appearances} appearanceDates={appearanceDates} tr={tr} />

        {/* Video */}
        <div className="channel-card__video">
          <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="channel-card__thumbnail-link">
            <img className="channel-card__thumbnail" src={thumbnailUrl} alt={video.title} loading="lazy" />
          </a>
          <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="channel-card__video-title">
            {video.title}
          </a>
          <div className="channel-card__stats">
            <span><IconEye className="channel-card__stat-icon" /> {Number(video.view_count).toLocaleString()}</span>
            <span><IconThumbUp className="channel-card__stat-icon" /> {Number(video.like_count).toLocaleString()}</span>
            <span><IconComment className="channel-card__stat-icon" /> {Number(video.comment_count).toLocaleString()}</span>
          </div>
        </div>

      </div>
    </li>
  );
}

VideoCard.propTypes = {
  channel: PropTypes.object.isRequired,
  video: PropTypes.object.isRequired,
  rank: PropTypes.number.isRequired,
  appearances: PropTypes.number,
  appearanceDates: PropTypes.arrayOf(PropTypes.string),
  tr: PropTypes.object.isRequired,
};

// A compact channel row for the historical Channels sub-view: avatar + name +
// "<n> days at #1". No video, no stats.
function ChannelCard({ channel, rank, tr }) {
  return (
    <li className="channel-card channel-card--compact">
      <div className="channel-card__rank">#{rank}</div>
      <div className="channel-card__content">
        <ChannelIdentity
          channel={channel}
          appearances={channel.appearances}
          appearanceDates={channel.appearance_dates}
          tr={tr}
        />
      </div>
    </li>
  );
}

ChannelCard.propTypes = {
  channel: PropTypes.object.isRequired,
  rank: PropTypes.number.isRequired,
  tr: PropTypes.object.isRequired,
};
