import React, { useState } from 'react';
import Map from '../Map/Map';
import Categories from '../Categories/Categories';
import Footer from '../Footer/Footer';
import Menu from '../Menu/Menu';
import InfoSidebar from '../InfoSidebar/InfoSidebar';

// Render App.
export default function App() {
  // Set the category by default (e.g: music) which the map will show when it loads before the user selects any category.
  const [category, setCategory] = useState('music');
  // Category dialog first state. Set to true to show the dialog when the app loads or false to hide it.
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  const [mapPoint, setMapPoint] = useState(null);
  // InfoSidebar dialog state.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleDialog = () => {
    setIsDialogOpen(!isDialogOpen);
  };

  const toggleSidebar = (open = true) => {
    setIsSidebarOpen(open);
  }

  return (
    <div className='app-container'>
      <Menu isDialogOpen={isDialogOpen} toggleDialog={toggleDialog} />
      <Categories
        category={category}
        setCategory={setCategory}
        isDialogOpen={isDialogOpen}
        toggleDialog={toggleDialog}
      />
      <InfoSidebar
        mapPoint={mapPoint}
        setMapPoint={setMapPoint}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <Map category={category} toggleSidebar={toggleSidebar} mapPoint={mapPoint} setMapPoint={setMapPoint} />
      <Footer />
    </div>
  );
}