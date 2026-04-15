import React, { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEY_DIALOG, STORAGE_KEY_CATEGORY, STORAGE_KEY_SIDEBAR } from '../config';
import Map from '../Map/Map';
import Categories from '../Categories/Categories';
import Footer from '../Footer/Footer';
import InfoSidebar from '../InfoSidebar/InfoSidebar';
import Head from '../Head/Head';
// Header must be loaded after all components to load the theme rules at last and override others.
import Header from '../Header/Header';

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
  // Footer visibility — persisted in localStorage; CSS variable updated synchronously on init
  // to avoid a layout flash on load when the user previously hid the footer.
  const [footerVisible, setFooterVisible] = useState(() => {
    try {
      const stored = localStorage.getItem('footerVisible');
      const visible = stored !== null ? stored === 'true' : true;
      document.documentElement.style.setProperty('--footer-height', visible ? '36px' : '0px');
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
    localStorage.setItem(STORAGE_KEY_DIALOG, !isDialogOpen);
  }, [isDialogOpen]);

  const handleFooterToggle = useCallback(() => {
    setFooterVisible(prev => {
      const next = !prev;
      try { localStorage.setItem('footerVisible', next); } catch (_) {}
      document.documentElement.style.setProperty('--footer-height', next ? '36px' : '0px');
      return next;
    });
  }, []);

  const toggleSidebar = useCallback((open = true) => {
    setIsSidebarOpen(open);
    // Clear the stored region when the sidebar is explicitly closed.
    if (!open) {
      try { localStorage.removeItem(STORAGE_KEY_SIDEBAR); } catch (_) {}
    }
  }, []);

  // Wraps setMapPoint to also persist the open country to localStorage.
  const handleSetMapPoint = useCallback((point) => {
    setMapPoint(point);
    try {
      if (point?.regionName) localStorage.setItem(STORAGE_KEY_SIDEBAR, point.regionName);
    } catch (_) {}
  }, []);

  // Handle updating the category — persist to localStorage and sync the URL.
  const handleUpdateCategory = (newCategory) => {
    setCategory(newCategory);
    updateUrlWithCategory(newCategory);
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORY, newCategory);
    } catch (_) {}
  };

  // Update the URL with the selected category
  const updateUrlWithCategory = (category) => {
    const params = new URLSearchParams(window.location.search);
    params.set('category', category);
    // Update the URL without reloading the page
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  // Update the category from the URL if it changes. I think this is not necessary.
  // useEffect(() => {
  //   const urlCategory = getCategoryFromUrl();
  //   if (urlCategory !== category) {
  //     setCategory(urlCategory);
  //   }
  // }, [category]);

  // If the state is not set, return true to show the dialog by default. If the state is set, return the state.
  function setDefaultIsDialogOpen() {
    const defaultState = localStorage.getItem(STORAGE_KEY_DIALOG);
    return defaultState === null ? true : defaultState === 'true';
  }

  return (
    <div className='app-container'>
      <Head />
      <Header isDialogOpen={isDialogOpen} toggleDialog={toggleDialog} />
      <Categories
        category={category}
        setCategory={handleUpdateCategory}
        isDialogOpen={isDialogOpen}
        toggleDialog={toggleDialog}
        toggleSidebar={toggleSidebar}
        onCategoryNameChange={setCategoryName}
      />
      <InfoSidebar
        mapPoint={mapPoint}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        categoryName={categoryName}
      />
      <Map
        category={category}
        toggleSidebar={toggleSidebar}
        setMapPoint={handleSetMapPoint}
        restoreRegion={restoreRegion}
        footerVisible={footerVisible}
        onFooterToggle={handleFooterToggle}
      />
      {footerVisible && <Footer />}
    </div>
  );
}