import React, { useState, useCallback } from 'react';
import { STORAGE_KEY_DIALOG, STORAGE_KEY_CATEGORY, STORAGE_KEY_SIDEBAR } from '../config';
import Map from '../Map/Map';
import Categories from '../Categories/Categories';
import Footer from '../Footer/Footer';
import InfoSidebar from '../InfoSidebar/InfoSidebar';
import Head from '../Head/Head';
// Header must be loaded after all components to load the theme rules at last and override others.
import Header from '../Header/Header';
import { MapPointContext } from '../Common/MapPointContext';
import { SidebarContext } from '../Common/SidebarContext';

// Returns the initial category using this priority: URL param > localStorage > 'music'.
const getInitialCategory = () => {
  const urlCategory = new URLSearchParams(window.location.search).get('category');
  if (urlCategory) return urlCategory;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CATEGORY);
    if (stored) return stored;
  } catch (_) {}
  return 'music';
};

// Render App.
export default function App() {
  // Set the initial category based on the URL or default to 'music' for the map to show when the app loads.
  const [category, setCategory] = useState(getInitialCategory);
  // Display name for the active category — resolved by Categories once its list loads.
  const [categoryName, setCategoryName] = useState('');
  // Category dialog first state. Set to true to show the dialog when the app loads or false to hide it.
  const [isDialogOpen, setIsDialogOpen] = useState(() => setDefaultIsDialogOpen());

  const [mapPoint, setMapPoint] = useState(null);
  // Footer visibility — persisted in localStorage. When hidden, --footer-height is set to 0px
  // synchronously to avoid a layout flash. When visible, the ResizeObserver in Footer.jsx owns
  // the value so it stays accurate as the footer grows/shrinks at different viewport widths.
  const [footerVisible, setFooterVisible] = useState(() => {
    try {
      const stored = localStorage.getItem('footerVisible');
      const visible = stored !== null ? stored === 'true' : true;
      if (!visible) document.documentElement.style.setProperty('--footer-height', '0px');
      return visible;
    } catch (_) {
      return true;
    }
  });
  // InfoSidebar dialog state.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Region name of the last open sidebar country, read on mount to restore it after reload.
  const [restoreRegion] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY_SIDEBAR) || null; } catch (_) { return null; }
  });

  const toggleDialog = useCallback(() => {
    setIsDialogOpen((prev) => !prev);
    // Save the state in the local storage to remember the user's choice.
    try {
      localStorage.setItem(STORAGE_KEY_DIALOG, !isDialogOpen);
    } catch (e) {
      console.warn('[WorldInterests] Could not save dialog state:', e.message);
    }
  }, [isDialogOpen]);

  const handleFooterToggle = useCallback(() => {
    setFooterVisible(prev => {
      const next = !prev;
      try { localStorage.setItem('footerVisible', next); } catch (_) {}
      // When hiding: lock to 0px immediately. When showing: remove the inline style so the
      // CSS default kicks in for one frame, then ResizeObserver in Footer.jsx corrects it.
      if (!next) {
        document.documentElement.style.setProperty('--footer-height', '0px');
      } else {
        document.documentElement.style.removeProperty('--footer-height');
      }
      return next;
    });
  }, []);

  const toggleSidebar = useCallback((open = true) => {
    setIsSidebarOpen(open);
    // Clear the stored region when the sidebar is explicitly closed.
    if (!open) {
      try { localStorage.removeItem(STORAGE_KEY_SIDEBAR); }
      catch (e) { console.warn('[WorldInterests] Could not clear sidebar state:', e.message); }
    }
  }, []);

  // Wraps setMapPoint to also persist the open country to localStorage.
  const handleSetMapPoint = useCallback((point) => {
    setMapPoint(point);
    try {
      if (point?.regionName) localStorage.setItem(STORAGE_KEY_SIDEBAR, point.regionName);
    } catch (e) {
      console.warn('[WorldInterests] Could not save sidebar country:', e.message);
    }
  }, []);

  // Handle updating the category — persist to localStorage and sync the URL.
  const handleUpdateCategory = (newCategory) => {
    setCategory(newCategory);
    updateUrlWithCategory(newCategory);
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORY, newCategory);
    } catch (e) {
      console.warn('[WorldInterests] Could not save category:', e.message);
    }
  };

  // Update the URL with the selected category
  const updateUrlWithCategory = (category) => {
    const params = new URLSearchParams(window.location.search);
    params.set('category', category);
    // Update the URL without reloading the page
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  // If the state is not set, return true to show the dialog by default. If the state is set, return the state.
  function setDefaultIsDialogOpen() {
    const defaultState = localStorage.getItem(STORAGE_KEY_DIALOG);
    return defaultState === null ? true : defaultState === 'true';
  }

  return (
    <MapPointContext.Provider value={{ mapPoint, setMapPoint: handleSetMapPoint }}>
      <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
        <div className='app-container'>
          <Head />
          <Header isDialogOpen={isDialogOpen} toggleDialog={toggleDialog} />
          <Categories
            category={category}
            setCategory={handleUpdateCategory}
            isDialogOpen={isDialogOpen}
            toggleDialog={toggleDialog}
            onCategoryNameChange={setCategoryName}
          />
          <InfoSidebar categoryName={categoryName} />
          <Map
            category={category}
            restoreRegion={restoreRegion}
            footerVisible={footerVisible}
            onFooterToggle={handleFooterToggle}
          />
          {footerVisible && <Footer />}
        </div>
      </SidebarContext.Provider>
    </MapPointContext.Provider>
  );
}
