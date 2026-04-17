import React, { useState, useContext, useId } from 'react';
import PropTypes from 'prop-types';
import { LanguageContext } from '../Common/LanguageContext';
import translations from '../Common/translations';
import { groupAppearanceDates } from './groupAppearanceDates';

export default function AppearancesTooltip({ dates, children }) {
  const { isEs } = useContext(LanguageContext);
  const tr = isEs ? translations.es : translations.en;
  const tooltipId = useId();
  const [visible, setVisible] = useState(false);

  const { entries, overflow } = groupAppearanceDates(dates, isEs);

  if (entries.length === 0) {
    return <span>{children}</span>;
  }

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  return (
    <span
      className="channel-card__appearances-anchor"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      tabIndex={0}
      aria-describedby={tooltipId}
    >
      {children}
      {visible && (
        <span
          id={tooltipId}
          role="tooltip"
          className="channel-card__appearances-tooltip"
        >
          {entries.map((entry, i) => (
            <span key={i} className="channel-card__appearances-tooltip-entry">{entry}</span>
          ))}
          {overflow > 0 && (
            <span className="channel-card__appearances-tooltip-overflow">
              {tr.andMore.replace('{n}', overflow)}
            </span>
          )}
        </span>
      )}
    </span>
  );
}

AppearancesTooltip.propTypes = {
  dates: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node.isRequired,
};
