import React, { useEffect, useRef, useState, useContext, useCallback } from 'react';
import './Categories.scss';
import { LanguageContext } from '../Common/LanguageContext';
import { SidebarContext } from '../Common/SidebarContext';
import translations from '../Common/translations';
import { getData } from '../Map/Points/Data';

// Fixed delays between category fetch retries: 2s, 4s, 8s (max 3 retries).
const CATEGORY_RETRY_DELAYS = [2000, 4000, 8000];

// Render Categories component
export default function Categories({ category, setCategory, isDialogOpen, toggleDialog, onCategoryNameChange }) {
  const { isEs } = useContext(LanguageContext);
  const { toggleSidebar } = useContext(SidebarContext);
  const dialogRef = useRef(null);
  // The result categoryNames is an array of objects with the category slug and name like this: [{slug: 'music', name: 'Music'}, {slug: 'gaming', name: 'Gaming'}].
  const [categoryNames, setCategoryNames] = useState([]);
  const [categoriesError, setCategoriesError] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  // Incrementing this counter triggers a manual retry from the error state.
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let retryTimer = null;

    setIsLoadingCategories(true);
    setCategoriesError(false);

    const attempt = (attemptIndex) => {
      const apiUrl = process.env.REACT_APP_BACKEND_API_URL + 'get-category-list.php';
      getData(apiUrl)
        .then((result) => {
          if (cancelled) return;

          const currLang = isEs ? 'es' : 'en';
          // Parse the result if it is a string
          const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
          // Ensure the parsed result is an object and not null
          if (typeof parsedResult !== 'object' || parsedResult === null) {
            throw new Error('Invalid data format');
          }
          const categoriesOfCurrentLanguage = parsedResult[currLang];
          if (!categoriesOfCurrentLanguage || Object.keys(categoriesOfCurrentLanguage).length === 0) {
            console.warn('[WorldInterests] Categories list is empty: the backend returned no categories for language "' + currLang + '".');
            setCategoriesError(true);
            setCategoryNames([]);
            setIsLoadingCategories(false);
            return;
          }

          // Transform the object into an array of categories, applying frontend translations
          // because the backend currently returns English names for all languages.
          const transformedCategories = Object.entries(categoriesOfCurrentLanguage).map(([slug, name]) => ({
            slug,
            name: translations[currLang]?.categoryNames?.[slug] || name,
          }));

          setCategoryNames(transformedCategories);
          setCategoriesError(false);
          setIsLoadingCategories(false);

          // Resolve and emit the display name for the currently active category.
          const active = transformedCategories.find(c => c.slug === category);
          if (active) onCategoryNameChange?.(active.name);
        })
        .catch((error) => {
          if (cancelled) return;
          if (attemptIndex < CATEGORY_RETRY_DELAYS.length) {
            // Auto-retry with backoff before surfacing the error.
            retryTimer = setTimeout(() => attempt(attemptIndex + 1), CATEGORY_RETRY_DELAYS[attemptIndex]);
          } else {
            console.warn('[WorldInterests] Could not load categories after', CATEGORY_RETRY_DELAYS.length + 1, 'attempts:', error.message);
            setCategoriesError(true);
            setCategoryNames([]);
            setIsLoadingCategories(false);
          }
        });
    };

    attempt(0);

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [isDialogOpen, isEs, retryTrigger]);

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

  const handleRetry = useCallback(() => {
    setRetryTrigger(n => n + 1);
  }, []);

  const tr = isEs ? translations.es : translations.en;
  // Detect if the device is mobile
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  const renderList = () => {
    if (isLoadingCategories) {
      return (
        <div className="sidebar__loading" aria-live="polite">
          <div className="sidebar__spinner" />
          <p>{tr.categoriesLoading}</p>
        </div>
      );
    }
    if (categoriesError) {
      return (
        <div className="sidebar__error-state">
          <p className="sidebar__error">{tr.categoriesUnavailable}</p>
          <button type="button" className="sidebar__retry-btn" onClick={handleRetry}>
            {tr.categoriesRetry}
          </button>
        </div>
      );
    }
    return (
      <ul className="sidebar__list">
        {categoryNames.map(({ slug, name }, index) => (
          <li key={index} className={`sidebar__item${category === slug ? ' active' : ''}`}>
            <a href="#" className="sidebar__link" data-category={slug} onClick={e => {
              e.preventDefault();
              setCategory(slug);
              onCategoryNameChange?.(name);
              toggleSidebar(false);
              // Close the dialog only if on a mobile device
              if (isMobile) {
                toggleDialog();
              }
            }}>{name}</a>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <dialog ref={dialogRef} className='sidebar sidebar--categories'>
      <span className='sidebar__bg'></span>
      <div className="sidebar__content">
        <menu>
          <div className='close-icon'>
            <button type="button" className='toggle-btn' onClick={toggleDialog}>
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </menu>
        <h2 className="sidebar__title">{tr.youtubeCategories}</h2>
        {renderList()}
      </div>
    </dialog>
  );
}
