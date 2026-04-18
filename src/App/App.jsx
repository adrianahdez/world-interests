import React, { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEY_CATEGORY_DIALOG, STORAGE_KEY_SELECTED_CATEGORY, STORAGE_KEY_SIDEBAR, STORAGE_KEY_COUNTRY_CHANNELS, COUNTRY_CHANNELS_DEFAULT, COUNTRY_CHANNELS_MAX } from '../config';
import Map from '../Map/Map';
import Categories from '../Categories/Categories';
import Footer from '../Footer/Footer';
import ChannelPanel from '../ChannelPanel/ChannelPanel';
import Head from '../Head/Head';
// Header must be loaded after all components to load the theme rules at last and override others.
import Header from '../Header/Header';
import { MapPointContext } from '../Common/MapPointContext';
import { SidebarContext } from '../Common/SidebarContext';
import { CountryPanelContext } from '../Common/CountryPanelContext';
import { getCountryLatLon } from '../Map/Points/Data';
import CountryPanel from '../CountryPanel/CountryPanel';

// Returns the initial category using this priority: URL param > localStorage > 'music'.
const getInitialCategory = () => {
  const urlCategory = new URLSearchParams(window.location.search).get('category');
  if (urlCategory) return urlCategory;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SELECTED_CATEGORY);
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
  // Tracks which country polygon is highlighted. Kept separate from mapPoint so
  // a polygon click can highlight without opening the sidebar (pin clicks sync both).
  const [selectedAlpha2, setSelectedAlpha2] = useState(null);
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
  // ChannelPanel dialog state.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Number of top channels to display in the country history panel (1–COUNTRY_CHANNELS_MAX).
  // Persisted in localStorage so the preference survives page reload.
  const [countryChannels, setCountryChannels] = useState(() => {
    try {
      const stored = parseInt(localStorage.getItem(STORAGE_KEY_COUNTRY_CHANNELS), 10);
      if (!isNaN(stored) && stored >= 1 && stored <= COUNTRY_CHANNELS_MAX) return stored;
    } catch (_) {}
    return COUNTRY_CHANNELS_DEFAULT;
  });

  const handleCountryChannelsChange = useCallback((n) => {
    const clamped = Math.max(1, Math.min(COUNTRY_CHANNELS_MAX, Number(n)));
    setCountryChannels(clamped);
    try { localStorage.setItem(STORAGE_KEY_COUNTRY_CHANNELS, String(clamped)); }
    catch (e) { console.warn('[WorldInterests] Could not save country channels setting:', e.message); }
  }, []);

  // Country panel state. selectedCountry holds { alpha2, countryName, flag }.
  const [isCountryPanelOpen, setIsCountryPanelOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  // Region name of the last open sidebar country, read on mount to restore it after reload.
  // Exposed as state so the country-panel restore can clear it (prevents both panels opening).
  const [restoreRegion, setRestoreRegion] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY_SIDEBAR) || null; } catch (_) { return null; }
  });
  // Alpha2 code from a ?channel= URL param — Map.jsx opens the sidebar once map data loads.
  const [pendingChannelAlpha2, setPendingChannelAlpha2] = useState(null);

  const toggleDialog = useCallback(() => {
    setIsDialogOpen((prev) => !prev);
    // Save the state in the local storage to remember the user's choice.
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORY_DIALOG, !isDialogOpen);
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

  // On mobile (≤768px): close the category dialog and persist its closed state so it
  // doesn't flash open when the user reloads with a panel already open.
  const closeDialogIfMobile = useCallback(() => {
    if (window.matchMedia('(max-width: 768px)').matches) {
      setIsDialogOpen(false);
      try { localStorage.setItem(STORAGE_KEY_CATEGORY_DIALOG, 'false'); } catch (_) {}
    }
  }, []);

  // keepHighlight: pass true when closing the sidebar as part of opening the country panel,
  // so the polygon highlight does not flash off during the panel transition.
  const toggleSidebar = useCallback((open = true, { keepHighlight = false } = {}) => {
    setIsSidebarOpen(open);
    // On mobile, close the category dialog whenever a panel opens.
    if (open) closeDialogIfMobile();
    // Clear the stored region and polygon highlight when the sidebar is explicitly closed,
    // unless the caller is immediately handing off to the country panel.
    if (!open && !keepHighlight) {
      setSelectedAlpha2(null);
      setPendingChannelAlpha2(null);
      removeChannelParam();
      try { localStorage.removeItem(STORAGE_KEY_SIDEBAR); }
      catch (e) { console.warn('[WorldInterests] Could not clear sidebar state:', e.message); }
    }
  }, [closeDialogIfMobile, removeChannelParam]);

  // Remove the ?country= param from the URL without adding a history entry.
  const removeCountryParam = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete('country');
    const search = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (search ? '?' + search : ''));
  }, []);

  // Remove the ?channel= param from the URL without adding a history entry.
  const removeChannelParam = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete('channel');
    const search = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (search ? '?' + search : ''));
  }, []);

  // Wraps setMapPoint to also persist the open country to localStorage and sync
  // the polygon highlight (selectedAlpha2) so pin clicks highlight the country too.
  // Also closes the country panel (if open) when a channel pin is clicked, and adds
  // a ?channel=<alpha2> history entry so the Back button closes the panel.
  const handleSetMapPoint = useCallback((point) => {
    setIsCountryPanelOpen(false);
    setSelectedCountry(null);
    setPendingChannelAlpha2(null); // clear any pending URL restore
    setMapPoint(point);
    setSelectedAlpha2(point?.alpha2 ?? null);
    try {
      const regionKey = typeof point?.regionName === 'object' ? point.regionName?.en : point?.regionName;
      if (regionKey) localStorage.setItem(STORAGE_KEY_SIDEBAR, regionKey);
    } catch (e) {
      console.warn('[WorldInterests] Could not save sidebar country:', e.message);
    }
    // Push a history entry so the Back button can close the channel panel.
    // Use the YouTube channel ID so the link identifies the specific channel,
    // not just "whichever channel is #1 in country X right now".
    // Skip the push when the URL already points to this channel — happens when
    // handleSetMapPoint is called from the URL restore path (popstate or deep link),
    // where a push would duplicate the entry and break chained Back navigation.
    const channelId = point?.channel?.channelId;
    if (channelId) {
      const currentChannel = new URLSearchParams(window.location.search).get('channel');
      if (currentChannel !== channelId) {
        const params = new URLSearchParams(window.location.search);
        params.set('channel', channelId);
        params.delete('country');
        window.history.pushState({ channel: channelId }, '', `${window.location.pathname}?${params.toString()}`);
      }
    }
  }, []);

  const closeCountryPanel = useCallback(() => {
    setIsCountryPanelOpen(false);
    setSelectedCountry(null);
    setSelectedAlpha2(null);
    removeCountryParam();
  }, [removeCountryParam]);

  // Opens the country panel for the given country, closing the channel-pin sidebar first.
  // keepHighlight=true prevents the polygon selection from flashing off during the handoff.
  const openCountryPanel = useCallback((alpha2, countryName, flag) => {
    toggleSidebar(false, { keepHighlight: true });
    // Clear sidebar restore state so both panels don't open simultaneously on reload.
    setRestoreRegion(null);
    try { localStorage.removeItem(STORAGE_KEY_SIDEBAR); } catch (_) {}
    closeDialogIfMobile();
    setSelectedCountry({ alpha2, countryName, flag });
    setSelectedAlpha2(alpha2);
    setIsCountryPanelOpen(true);
    // Add a history entry so the browser Back button can close the panel.
    // Skip if the URL already points to this country — avoids duplicate entries
    // when the same polygon is clicked twice.
    const currentCountry = new URLSearchParams(window.location.search).get('country');
    if (currentCountry !== alpha2) {
      const params = new URLSearchParams(window.location.search);
      params.delete('channel');
      params.set('country', alpha2);
      window.history.pushState({ country: alpha2 }, '', window.location.pathname + '?' + params.toString());
    }
  }, [toggleSidebar, closeDialogIfMobile, setRestoreRegion]);

  // Handle the browser Back/Forward buttons. Category changes, country panel opens, and
  // channel pin opens all use pushState, so popstate syncs all URL-driven state.
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const country = params.get('country');
      const channel = params.get('channel');
      const urlCategory = params.get('category');

      // Sync category from the URL entry we navigated to.
      if (urlCategory) {
        setCategory(urlCategory);
        try { localStorage.setItem(STORAGE_KEY_SELECTED_CATEGORY, urlCategory); } catch (_) {}
      }

      if (country && getCountryLatLon(country)) {
        // Country panel — reset name/flag so Countries.jsx can re-populate from GeoJSON.
        setIsCountryPanelOpen(true);
        setSelectedAlpha2(country);
        setSelectedCountry(prev =>
          prev?.alpha2 === country ? prev : { alpha2: country, countryName: '', flag: '' }
        );
        // Close channel panel
        setIsSidebarOpen(false);
        setPendingChannelAlpha2(null);
      } else if (channel) {
        // Channel panel — Map.jsx opens the panel once data is (re-)available.
        setIsCountryPanelOpen(false);
        setSelectedCountry(null);
        setPendingChannelAlpha2(channel);
      } else {
        // No panel in URL — close both panels.
        setIsCountryPanelOpen(false);
        setSelectedCountry(null);
        setSelectedAlpha2(null);
        setIsSidebarOpen(false);
        setPendingChannelAlpha2(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On mount: restore panels from URL params (?country= or ?channel=).
  // Only one panel can be active; country takes precedence if both are somehow present.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const country = params.get('country');
    const channel = params.get('channel');

    if (country) {
      if (!getCountryLatLon(country)) {
        removeCountryParam();
      } else {
        // Countries.jsx effect fills in name/flag once GeoJSON processes.
        setRestoreRegion(null);
        try { localStorage.removeItem(STORAGE_KEY_SIDEBAR); } catch (_) {}
        setSelectedCountry({ alpha2: country, countryName: '', flag: '' });
        setSelectedAlpha2(country);
        setIsCountryPanelOpen(true);
      }
    } else if (channel) {
      // Defer to Map.jsx to open the channel panel once map data loads.
      setRestoreRegion(null);
      try { localStorage.removeItem(STORAGE_KEY_SIDEBAR); } catch (_) {}
      setPendingChannelAlpha2(channel);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once on mount only

  // Handle updating the category — persist to localStorage and sync the URL.
  const handleUpdateCategory = (newCategory) => {
    setCategory(newCategory);
    updateUrlWithCategory(newCategory);
    try {
      localStorage.setItem(STORAGE_KEY_SELECTED_CATEGORY, newCategory);
    } catch (e) {
      console.warn('[WorldInterests] Could not save category:', e.message);
    }
  };

  // Update the URL with the selected category — pushState so the Back button navigates
  // through category selections (consistent with the country panel pushState).
  const updateUrlWithCategory = (category) => {
    const params = new URLSearchParams(window.location.search);
    params.set('category', category);
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  // If the state is not set, return true to show the dialog by default. If the state is set, return the state.
  function setDefaultIsDialogOpen() {
    const defaultState = localStorage.getItem(STORAGE_KEY_CATEGORY_DIALOG);
    return defaultState === null ? true : defaultState === 'true';
  }

  return (
    <MapPointContext.Provider value={{ mapPoint, setMapPoint: handleSetMapPoint, selectedAlpha2, setSelectedAlpha2 }}>
      <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
        <CountryPanelContext.Provider value={{ isCountryPanelOpen, selectedCountry, setSelectedCountry, openCountryPanel, closeCountryPanel, countryChannels }}>
          <div className='app-container'>
            <Head category={category} categoryName={categoryName} />
            <Header isDialogOpen={isDialogOpen} toggleDialog={toggleDialog} />
            <Categories
              category={category}
              setCategory={handleUpdateCategory}
              isDialogOpen={isDialogOpen}
              toggleDialog={toggleDialog}
              onCategoryNameChange={setCategoryName}
            />
            <ChannelPanel categoryName={categoryName} />
            <CountryPanel category={category} categoryName={categoryName} />
            <main className="app-main">
              <h1 className="sr-only">World Interests — Trending YouTube Channels by Country</h1>
              <Map
                category={category}
                categoryName={categoryName}
                restoreRegion={restoreRegion}
                restoreChannelAlpha2={pendingChannelAlpha2}
                onChannelRestored={() => setPendingChannelAlpha2(null)}
                footerVisible={footerVisible}
                onFooterToggle={handleFooterToggle}
                countryChannels={countryChannels}
                onCountryChannelsChange={handleCountryChannelsChange}
              />
            </main>
            {footerVisible && <Footer />}
          </div>
        </CountryPanelContext.Provider>
      </SidebarContext.Provider>
    </MapPointContext.Provider>
  );
}
