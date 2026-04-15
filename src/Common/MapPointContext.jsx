import { createContext } from 'react';

/**
 * Provides the currently selected map point (country pin data) and its setter.
 * State is owned by App.jsx — this context avoids threading mapPoint/setMapPoint
 * as props through Map → CustomMarker → InfoSidebar.
 *
 * Consumers: CustomMarker, InfoSidebar, Map (for sidebar restore).
 * Provider: App.jsx via <MapPointContext.Provider value={{ mapPoint, setMapPoint }}>.
 */
export const MapPointContext = createContext(null);
