function getColor(d) {
  return d > 1000 ? '#1d1a16' :
    d > 500 ? '#292622' :
      d > 200 ? '#24221e' :
        d > 100 ? '#191611' :
          d > 50 ? '#1d1718' :
            d > 20 ? '#22241e' :
              d > 10 ? '#191715' :
                '#161519';
}

export function setConfig({ properties }) {
  return {
    weight: 1.3,
    color: 'var(--country-delimiter-color)',
    opacity: 1,
    fillColor: 'var(--country-fill-color)',
    // fillColor: getColor(properties.density),
    fillOpacity: 1,
    dashArray: '3',
  };
};

//Here we get access to the layer that was hovered through e.target
// export function highlightFeature(e) {
//   var layer = e.target;

//   layer.setStyle({
//       weight: 5,
//       color: '#666',
//       dashArray: '',
//       fillOpacity: 0.7
//   });

//   layer.bringToFront();
// }

// function resetHighlight(e) {
//   geojson.resetStyle(e.target);
// }