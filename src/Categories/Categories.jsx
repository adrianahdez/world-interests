import React, { useEffect, useRef, useState, useContext } from 'react';
import './Categories.scss';
import { LanguageContext } from '../Common/LanguageContext';
import translations from '../Common/translations';

// Render Categories component
export default function Categories({ category, setCategory, isDialogOpen, toggleDialog, toggleSidebar }) {
  const { isEs } = useContext(LanguageContext);
  const dialogRef = useRef(null);
  const [categoryNames, setCategoryNames] = useState([]);

  useEffect(() => {
    fetchCategories()
      .then((result) => {
        // If isEs is true, select the language 'es' from result, otherwise select the 'en' language.
        const categoriesOfCurrentLanguage = result.find(({ language }) => language === (isEs ? 'es' : 'en'));
        setCategoryNames(categoriesOfCurrentLanguage['categories']);
      })
      .catch((error) => {
        setCategoryNames([]);
        console.error('Error getting categories:', error);
      });
  }, [isDialogOpen, isEs]);

  useEffect(() => {
    if (isDialogOpen) {
      dialogRef.current.show();
    } else {
      dialogRef.current.close();
    }
  }, [isDialogOpen]);

  // Handle Escape key to close the dialog
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isDialogOpen) {
        toggleDialog();
      }
    };
    // Add event listener for keydown
    window.addEventListener('keydown', handleKeyDown);
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDialogOpen, toggleDialog]);

  /**
   * Fetch categories from the backend API.
   * @returns {Promise<Array>} An array of objects with the category slug and name.
   * @throws {Error} If the network response is not ok or there is no data.
   * @throws {Error} If there is an error fetching the categories.
   * The returned array is like this:[
   * { language: 'en', categories: [{ slug: 'music', name: 'Music' }, { slug: 'gaming', name: 'Gaming' }, ...] },
   * { language: 'es', categories: [{ slug: 'music', name: 'Música' }, { slug: 'gaming', name: 'Juegos' }, ...] }
   * ];
   */
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

      const dataArray = Object.entries(data).map(([lang, categories]) => {
        return {
          language: lang,
          categories: Object.entries(categories).map(([slug, name]) => ({ slug, name }))
        };
      });

      return dataArray;

    } catch (e) {
      console.error('Error fetching categories:', e);
      return [];
    }
  }

  const tr = isEs ? translations.es : translations.en;
  // Detect if the device is mobile
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  return (
    <dialog ref={dialogRef} className='sidebar sidebar--categories'>
      <span className='sidebar__bg'></span>
      <div className="sidebar__content">
        <menu>
          <div className='close-icon'>
            <button type="reset" className='toggle-btn' onClick={toggleDialog}>
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </menu>
        <h2 className="sidebar__title">{tr.youtubeCategories}</h2>
        <ul className="sidebar__list">
          {categoryNames.map(({ slug, name }, index) => (
            <li key={index} className={`sidebar__item${category === slug ? ' active' : ''}`}>
              <a href="#" className="sidebar__link" data-category={slug} onClick={e => {
                e.preventDefault();
                setCategory(slug);
                toggleSidebar(false);
                // Close the dialog only if on a mobile device
                if (isMobile) {
                  toggleDialog();
                }
              }}>{name}</a>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}