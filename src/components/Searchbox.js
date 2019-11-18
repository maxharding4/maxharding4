import React from 'react';
import '../styles/styles.css';

const SearchBox = ({ searchfield, searchChange }) => {
  return (
    <div className='pa2'>
      <input
        className='pa2 ba b--white-70 bg-transparent'
        type='search'
        placeholder='search by country'
        onChange={searchChange}
      />
    </div>
  );
}

export default SearchBox;