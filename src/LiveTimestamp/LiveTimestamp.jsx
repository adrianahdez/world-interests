import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { LanguageContext } from '../Common/LanguageContext';
import useNow from '../hooks/useNow';

// Isolated leaf so only the timestamp span re-renders on each 1-second tick,
// not the surrounding component (which may map over a long list).
export default function LiveTimestamp({ label }) {
  const { isEs } = useContext(LanguageContext);
  const now = useNow();
  const locale = isEs ? 'es-ES' : 'en-US';
  const fmt = useMemo(() => new Intl.DateTimeFormat(locale, {
    hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short',
  }), [locale]);
  return <span className="country-panel__meta-item">{label} <strong>{fmt.format(now)}</strong></span>;
}

LiveTimestamp.propTypes = {
  label: PropTypes.string.isRequired,
};
