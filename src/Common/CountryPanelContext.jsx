import { createContext } from 'react';

/**
 * Provides country panel open state and the selected country.
 * State is owned by App.jsx — this context avoids threading props through
 * Map → Countries and down to CountryPanel.
 *
 * - isCountryPanelOpen / openCountryPanel / closeCountryPanel: panel visibility.
 * - selectedCountry: { alpha2, countryName, flag } for the country currently shown.
 *
 * openCountryPanel also handles mutual exclusion with InfoSidebar: it closes the
 * channel-pin sidebar without clearing selectedAlpha2 so the polygon highlight
 * does not flash off during the transition.
 *
 * Consumers: Countries (to open), CountryPanel (to read + close).
 * Provider: App.jsx via <CountryPanelContext.Provider value={...}>.
 */
export const CountryPanelContext = createContext(null);
