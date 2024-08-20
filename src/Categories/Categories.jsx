import React, { useEffect, useRef, useState } from 'react';
import './Categories.scss';

// Render Categories component
export default function Categories({ category, setCategory, isDialogOpen, toggleDialog, toggleSidebar }) {
  const dialogRef = useRef(null);
  const [categoryNames, setCategoryNames] = useState([]);

  useEffect(() => {
    fetchCategories()
      .then((result) => {
        setCategoryNames(result);
      })
      .catch((error) => {
        setCategoryNames([]);
        console.error('Error getting categories:', error);
      });
  }, [isDialogOpen]);

  useEffect(() => {
    if (isDialogOpen) {
      dialogRef.current.show();
    } else {
      dialogRef.current.close();
    }
  }, [isDialogOpen]);

  const fetchCategories = async () => {
    const apiUrl = process.env.REACT_APP_BACKEND_API_URL + 'get-category-list.php';

    try {
      const response = await fetch(apiUrl,
        { headers: { 'Content-type': 'application/json' } }
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (!data || data.error) {
        throw new Error('No data');
      }
      const categoriesArray = Object.entries(data).map(([slug, name]) => ({ slug, name }));
      return categoriesArray;

    } catch (e) {
      console.error('Error fetching categories:', e);
      return [];
    }
  }

  return (
    <dialog ref={dialogRef} className='sidebar sidebar--categories'>
      <span className='sidebar__bg'></span>
      <div className="sidebar__content">
        <menu>
          <div className='menu-toggle close-icon'>
            <button type="reset" className='toggle-btn' onClick={toggleDialog}>
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </menu>
        <h2 className="sidebar__title">YouTube Categories</h2>
        <ul className="sidebar__list">
          {categoryNames.map(({ slug, name }, index) => (
            <li key={index} className={`sidebar__item${category === slug ? ' active' : ''}`}>
              <a href="#" className="sidebar__link" data-category={slug} onClick={e => {
                e.preventDefault();
                setCategory(slug);
                toggleSidebar(false);
              }}>{name}</a>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}