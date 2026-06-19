import React, { useState, useId } from 'react';
import PropTypes from 'prop-types';
import './InfoTooltip.scss';

export default function InfoTooltip({ text, children }) {
  const tooltipId = useId();
  const [visible, setVisible] = useState(false);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  return (
    <span
      className="info-tooltip__anchor"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      tabIndex={0}
      aria-describedby={tooltipId}
    >
      {children}
      {visible && (
        <span id={tooltipId} role="tooltip" className="info-tooltip__bubble">
          {text}
        </span>
      )}
    </span>
  );
}

InfoTooltip.propTypes = {
  text: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
