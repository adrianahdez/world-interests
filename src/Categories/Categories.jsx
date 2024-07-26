import React, { useEffect } from 'react';
import './Categories.css';

// Render Footer component
export default function Categories({ category, setCategory }) {
  // TODO: make a fetch to get categories from category-list.php and have it hardcoded in only one place.
  const categoryNames = [
    {
      slug: 'music',
      name: 'Music'
    },
    {
      slug: 'gaming',
      name: 'Gaming'
    },
    {
      slug: 'film-animation',
      name: 'Film & Animation'
    },
    {
      slug: 'autos-vehicles',
      name: 'Autos & Vehicles'
    },
    {
      slug: 'pets-animals',
      name: 'Pets & Animals'
    },
    {
      slug: 'sports',
      name: 'Sports'
    },
    {
      slug: 'short-movies',
      name: 'Short Movies'
    },
    {
      slug: 'travel-events',
      name: 'Travel & Events'
    },
    {
      slug: 'videoblogging',
      name: 'Videoblogging'
    },
    {
      slug: 'people-blogs',
      name: 'People & Blogs'
    },
    {
      slug: 'comedy',
      name: 'Comedy'
    },
    {
      slug: 'entertainment',
      name: 'Entertainment'
    },
    {
      slug: 'news-politics',
      name: 'News & Politics'
    },
    {
      slug: 'howto-style',
      name: 'Howto & Style'
    },
    {
      slug: 'education',
      name: 'Education'
    },
    {
      slug: 'science-technology',
      name: 'Science & Technology'
    },
    {
      slug: 'movies',
      name: 'Movies'
    },
    {
      slug: 'anime-animation',
      name: 'Anime & Animation'
    },
    {
      slug: 'action-adventure',
      name: 'Action & Adventure'
    },
    {
      slug: 'classics',
      name: 'Classics'
    },
    {
      slug: 'documentary',
      name: 'Documentary'
    },
    {
      slug: 'drama',
      name: 'Drama'
    },
    {
      slug: 'family',
      name: 'Family'
    },
    {
      slug: 'foreign',
      name: 'Foreign'
    },
    {
      slug: 'horror',
      name: 'Horror'
    },
    {
      slug: 'sci-fi-fantasy',
      name: 'Sci-Fi & Fantasy'
    },
    {
      slug: 'thriller',
      name: 'Thriller'
    },
    {
      slug: 'shorts',
      name: 'Shorts'
    },
    {
      slug: 'shows',
      name: 'Shows'
    },
    {
      slug: 'trailers',
      name: 'Trailers'
    }
  ];

  return (
    <nav className='categories'>
      <span className='categories__bg'></span>
      <div className="categories__content">
        <h2 className="categories__title">Categories</h2>
        <ul className="categories__list">
          {categoryNames.map(({ slug, name }, index) => (
            <li key={index} className={`categories__item${category === slug ? ' active' : ''}`}>
              <a href="#" className="categories__link" data-category={slug} onClick={e => {
                e.preventDefault();
                setCategory(slug);
              }}>{name}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}