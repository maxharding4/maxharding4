import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className='pa3'>
      <Link to="/">
        <button>home</button>
      </Link>
      <Link to="/travel">
        <button>travel</button>
      </Link>
      <Link to="/info">
        <button>info</button>
      </Link>
    </div>
  );
};

export default Navbar;