import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Home from '../views/Home';
import Work from '../views/Work';
import Travel from '../views/Travel';
import Footer from '../components/Footer';

import Austria from '../views/travel/country/Austria';
import Vienna from '../views/travel/country/austria/Vienna';
import Brazil from '../views/travel/country/Brazil';
import Pantanal from '../views/travel/country/brazil/Pantanal';
import Canada from '../views/travel/country/Canada';
import Banff from '../views/travel/country/canada/banff';
import Bowen from '../views/travel/country/canada/bowen';
import Drumheller from '../views/travel/country/canada/drumheller';
import Duffey from '../views/travel/country/canada/duffey';
import Icefields from '../views/travel/country/canada/icefields';
import Jasper from '../views/travel/country/canada/jasper';
import Joffre from '../views/travel/country/canada/joffre';
import Louise from '../views/travel/country/canada/louise';
import Moraine from '../views/travel/country/canada/moraine';
import Ottawa from '../views/travel/country/canada/ottawa';
import Squamish from '../views/travel/country/canada/squamish';
import Yellowhead from '../views/travel/country/canada/yellowhead';
import Info from '../views/Info';
import '../styles/styles.css';

class App extends Component {
  render() {
    return (
      <div className='tc'>
        <BrowserRouter>
          <Navbar />
          <div>
            <Route exact path='/' render={() => (<Home />)} />
            <Route exact path='/work' render={() => (<Work />)} />
            <Route exact path='/travel' render={() => (<Travel />)} />
            <Route exact path='/info' render={() => (<Info />)} />
          </div>
          <Route exact path='/travel/austria' render={() => (<Austria />)} />
          <Route exact path='/travel/austria/vienna' render={() => (<Vienna />)} />
          <Route exact path='/travel/brazil' render={() => (<Brazil />)} />
          <Route exact path='/travel/brazil/pantanal' render={() => (<Pantanal />)} />
          <Route exact path='/travel/canada' render={() => (<Canada />)} />
          <Route exact path='/travel/canada/banff' render={() => (<Banff />)} />
          <Route exact path='/travel/canada/bowen' render={() => (<Bowen />)} />
          <Route exact path='/travel/canada/drumheller' render={() => (<Drumheller />)} />
          <Route exact path='/travel/canada/duffey' render={() => (<Duffey />)} />
          <Route exact path='/travel/canada/icefields' render={() => (<Icefields />)} />
          <Route exact path='/travel/canada/jasper' render={() => (<Jasper />)} />
          <Route exact path='/travel/canada/joffre' render={() => (<Joffre />)} />
          <Route exact path='/travel/canada/louise' render={() => (<Louise />)} />
          <Route exact path='/travel/canada/moraine' render={() => (<Moraine />)} />
          <Route exact path='/travel/canada/ottawa' render={() => (<Ottawa />)} />
          <Route exact path='/travel/canada/squamish' render={() => (<Squamish />)} />
          <Route exact path='/travel/canada/yellowhead' render={() => (<Yellowhead />)} />
        </BrowserRouter>
        <div>
          <Footer />
        </div>
      </div>
    )
  }
}

export default App;