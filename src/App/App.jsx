import React, { useState } from 'react';
import Map from '../Map/Map';
import Categories from '../Categories/Categories';
import Footer from '../Footer/Footer';

// Render App. For now we have the Map and Footer components.
export default function App() {
  const [category, setCategory] = useState('music');

  return (
    <div className='app-container'>
      <Categories category={category} setCategory={setCategory} />
      <Map category={category} />
      <Footer />
    </div>
  );
}