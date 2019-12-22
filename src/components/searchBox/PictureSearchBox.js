import React from 'react';
import '../../styles/styles.css';

const PictureSearchBox = ({ searchfield, searchChange }) => {
  return (
      <input
        className='pa2 ba b--white-70 bg-transparent'
        type='search'
        placeholder='search by picture'
        onChange={searchChange}
      />
  );
}

export default PictureSearchBox;