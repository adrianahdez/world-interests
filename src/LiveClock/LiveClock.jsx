import React, { useContext, useMemo } from 'react';
import './LiveClock.scss';
import { LanguageContext } from '../Common/LanguageContext';
import translations from '../Common/translations';
import useNow from '../hooks/useNow';

// Fixed, horizontally-centered label at the top of the viewport showing the
// current local date and time (to the second), updating live. Its purpose is to
// make it obvious the app shows continuously updated, real-time information.
// Reuses the existing .map-overlay-label styling so it matches the bottom labels.
export default function LiveClock() {
  const { isEs } = useContext(LanguageContext);
  const tr = isEs ? translations.es : translations.en;
  const now = useNow();

  const locale = isEs ? 'es-ES' : 'en-US';
  // Formatters cached per locale — Intl.DateTimeFormat construction is expensive.
  // timeZoneName: 'short' appends an unambiguous tz label (e.g. "GMT+2").
  const dateFmt = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), [locale]);
  const timeFmt = useMemo(() => new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }), [locale]);
  const dateStr = dateFmt.format(now);
  const timeStr = timeFmt.format(now);

  return (
    <div
      className="map-overlay-label live-clock"
      role="status"
      aria-live="off"
      aria-label={tr.liveClockAriaLabel}
    >
      {/* Pulsing dot reinforces that the data is live, not a static snapshot. */}
      <span className="live-clock__dot" aria-hidden="true" />
      <span className="live-clock__date">{dateStr}</span>
      <span className="live-clock__sep" aria-hidden="true">·</span>
      <span className="live-clock__time">{timeStr}</span>
    </div>
  );
}
