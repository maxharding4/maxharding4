import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className='pa2 ba' id='navbar'>
      <Link to="/">
        <a className='ba f6 f5-l link bg-animate white-80 hover-bg-gray dib pa3 ph4-l'>home</a>
      </Link>
      <Link to="/work">
        <a className='ba f6 f5-l link bg-animate white-80 hover-bg-gray dib pa3 ph4-l'>work</a>
      </Link>
      <Link to="/travel">
        <a className='ba f6 f5-l link bg-animate white-80 hover-bg-gray dib pa3 ph4-l'>travel</a>
      </Link>
      <Link to="/info">
        <a className='ba f6 f5-l link bg-animate white-80 hover-bg-gray dib pa3 ph4-l'>info</a>
      </Link>
    </div>
  );
};

export default Navbar;