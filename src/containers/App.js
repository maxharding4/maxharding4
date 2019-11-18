import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Home from '../views/Home';
import Work from '../views/Work';
import Travel from '../views/Travel';
import Footer from '../components/Footer';
import '../styles/styles.css';

class App extends Component {
  render() {
    return (
      <div className='tc'>
        <BrowserRouter>
          <Navbar />
          <div>
            <Route exact path='/' render={() => (
              <div>
                <Home />
              </div>
            )} />
            <Route exact path='/work' render={() => (
              <div>
                <Work />
              </div>
            )} />
            <Route exact path='/travel' render={() => (
              <div>
                <Travel />
              </div>
            )} />
          </div>
        </BrowserRouter>
        <div id='footer'>
          <Footer />
        </div>
      </div>
    )
  }
}

export default App;