import React from 'react';
import { Tooltip } from 'react-leaflet'
import './CustomTooltip.css';

/**
 * It shows when user clicks on a marker.
 */
export default function CustomTooltip() {

  return (
    <div className="tooltip-container">
      <Tooltip>Tooltip for CircleMarker</Tooltip>
    </div>
  )
}