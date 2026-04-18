import { createContext } from 'react';

/**
 * Provides sidebar open state and toggle function.
 * State is owned by App.jsx — this context avoids threading isSidebarOpen/toggleSidebar
 * as props through Map → CustomMarker and down to ChannelPanel and Categories.
 *
 * Consumers: CustomMarker, ChannelPanel, Categories.
 * Provider: App.jsx via <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>.
 */
export const SidebarContext = createContext(null);
