import React from 'react';
import { Popup } from 'react-leaflet'

/**
 * It shows when user clicks on a marker.
 */
export default function CustomPopup() {

  return (
    <div className="popup-container">
      <Popup>
        A pretty CSS3 popup. <br /> Easily customizable.
      </Popup>
    </div>
  )
}