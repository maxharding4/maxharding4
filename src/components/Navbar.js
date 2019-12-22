import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className='pa2 ba' id='navbar'>
      <Link to="/">
        <button className='ba f6 f5-l link bg-animate white-80 hover-bg-gray dib pa3 ph4-l'>home</button>
      </Link>
      <Link to="/work">
        <button className='ba f6 f5-l link bg-animate white-80 hover-bg-gray dib pa3 ph4-l'>work</button>
      </Link>
      <Link to="/travel">
        <button className='ba f6 f5-l link bg-animate white-80 hover-bg-gray dib pa3 ph4-l'>travel</button>
      </Link>
      <Link to="/info">
        <button className='ba f6 f5-l link bg-animate white-80 hover-bg-gray dib pa3 ph4-l'>info</button>
      </Link>
    </div>
  );
};

export default Navbar;