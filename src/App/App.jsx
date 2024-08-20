import React, { useState, useCallback } from 'react';
import Map from '../Map/Map';
import Categories from '../Categories/Categories';
import Footer from '../Footer/Footer';
import Header from '../Header/Header';
import InfoSidebar from '../InfoSidebar/InfoSidebar';
import Head from '../Head/Head';

// Render App.
export default function App() {
  // Set the category by default (e.g: music) which the map will show when it loads before the user selects any category.
  const [category, setCategory] = useState('music');
  // Category dialog first state. Set to true to show the dialog when the app loads or false to hide it.
  const [isDialogOpen, setIsDialogOpen] = useState(() => setDefault());

  const [mapPoint, setMapPoint] = useState(null);
  // InfoSidebar dialog state.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleDialog = useCallback(() => {
    setIsDialogOpen((prev) => !prev);
    // Save the state in the local storage to remember the user's choice.
    localStorage.setItem('isDialogOpen', !isDialogOpen);
  }, [isDialogOpen]);

  const toggleSidebar =  useCallback((open = true) => {
    setIsSidebarOpen(open);
  }, []);

  // If the state is not set, return true to show the dialog by default. If the state is set, return the state.
  function setDefault() {
    const defaultState = localStorage.getItem('isDialogOpen');
    return defaultState === null ? true : defaultState === 'true';
  }

  return (
    <div className='app-container'>
      <Head />
      <Header isDialogOpen={isDialogOpen} toggleDialog={toggleDialog} />
      <Categories
        category={category}
        setCategory={setCategory}
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