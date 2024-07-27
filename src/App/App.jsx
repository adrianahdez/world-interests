import React, { useState } from 'react';
import Map from '../Map/Map';
import Categories from '../Categories/Categories';
import Footer from '../Footer/Footer';
import Menu from '../Menu/Menu';

// Render App.
export default function App() {
  // Set the category by default (e.g: music) which the map will show when it loads before the user selects any category.
  const [category, setCategory] = useState('music');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleDialog = () => {
    setIsDialogOpen(!isDialogOpen);
  };

  return (
    <div className='app-container'>
      <Menu toggleDialog={toggleDialog} />
      <Categories
        category={category}
        setCategory={setCategory}
        isDialogOpen={isDialogOpen}
        toggleDialog={toggleDialog}
      />
      <Map category={category} />
      <Footer />
    </div>
  );
}