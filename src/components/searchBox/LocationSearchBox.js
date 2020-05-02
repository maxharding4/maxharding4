import React from 'react';
import '../../styles/styles.css';

const LocationSearchBox = ({ searchfield, searchChange }) => {
  return (
      <input
        className='pa2 ba b--white-70 bg-transparent'
        type='search'
        placeholder='filter by location'
        onChange={searchChange}
        data-test='search-box--input'
      />
  );
}

export default LocationSearchBox;