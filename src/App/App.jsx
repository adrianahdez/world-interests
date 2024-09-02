import React, { useState, useCallback, useEffect } from 'react';
import Map from '../Map/Map';
import Categories from '../Categories/Categories';
import Footer from '../Footer/Footer';
import Header from '../Header/Header';
import InfoSidebar from '../InfoSidebar/InfoSidebar';
import Head from '../Head/Head';

// Helper function to get the category from the URL
const getCategoryFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('category') || 'music'; // Default to 'music' if not present
};

// Render App.
export default function App() {
  // Set the initial category based on the URL or default to 'music' for the map to show when the app loads.
  const [category, setCategory] = useState(getCategoryFromUrl());
  // Category dialog first state. Set to true to show the dialog when the app loads or false to hide it.
  const [isDialogOpen, setIsDialogOpen] = useState(() => setDefaultIsDialogOpen());

  const [mapPoint, setMapPoint] = useState(null);
  // InfoSidebar dialog state.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleDialog = useCallback(() => {
    setIsDialogOpen((prev) => !prev);
    // Save the state in the local storage to remember the user's choice.
    localStorage.setItem('isDialogOpen', !isDialogOpen);
  }, [isDialogOpen]);

  const toggleSidebar = useCallback((open = true) => {
    setIsSidebarOpen(open);
  }, []);

  // Handle updating the category
  const handleUpdateCategory = (newCategory) => {
    setCategory(newCategory);
    updateUrlWithCategory(newCategory);
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
    const defaultState = localStorage.getItem('isDialogOpen');
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
      />
      <InfoSidebar
        mapPoint={mapPoint}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <Map
        category={category}
        toggleSidebar={toggleSidebar}
        setMapPoint={setMapPoint}
      />
      <Footer />
    </div>
  );
}