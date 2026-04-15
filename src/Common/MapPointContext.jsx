import { createContext } from 'react';

/**
 * Provides the currently selected map point (country pin data) and its setter,
 * plus the selected country alpha-2 code for polygon highlighting.
 *
 * - mapPoint / setMapPoint: full pin data for the open sidebar entry. Set via
 *   handleSetMapPoint in App.jsx which also persists to localStorage.
 * - selectedAlpha2 / setSelectedAlpha2: alpha-2 code of the highlighted country
 *   polygon. Kept separate from mapPoint so a polygon click can highlight without
 *   opening the sidebar (pin clicks sync both via handleSetMapPoint).
 *
 * State is owned by App.jsx — this context avoids threading props through
 * Map → CustomMarker / Countries → InfoSidebar.
 *
 * Consumers: CustomMarker, InfoSidebar, Map (sidebar restore), Countries.
 * Provider: App.jsx via <MapPointContext.Provider value={...}>.
 */
export const MapPointContext = createContext(null);
