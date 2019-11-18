import React from 'react';
import '../styles/styles.css';

const SearchBox = ({ searchfield, searchChange }) => {
  return (
      <input
        className='pa2 ba b--white-70 bg-transparent'
        type='search'
        placeholder='search by country'
        onChange={searchChange}
      />
  );
}

export default SearchBox;