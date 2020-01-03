import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Home from '../views/Home';
import Work from '../views/Work';
import Travel from '../views/Travel';
import Footer from '../components/Footer';

import Austria from '../views/travel/country/Austria';
import Vienna from '../views/travel/country/austria/vienna';
import Brazil from '../views/travel/country/Brazil';
import Iguazu from '../views/travel/country/brazil/iguazu';
import Pantanal from '../views/travel/country/brazil/pantanal';
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
import Cuba from '../views/travel/country/Cuba';
import Havana from '../views/travel/country/cuba/havana';
import Veradero from '../views/travel/country/cuba/veradero';
import England from '../views/travel/country/England';
import Lympne from '../views/travel/country/england/lympne';
import Margate from '../views/travel/country/england/margate';
import York from '../views/travel/country/england/york';
import Lithuania from '../views/travel/country/Lithuania';
import Vilnius from '../views/travel/country/lithuania/vilnius';
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
          <Route exact path='/travel/brazil/iguazu' render={() => (<Iguazu />)} />
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
          <Route exact path='/travel/cuba' render={() => (<Cuba />)} />
          <Route exact path='/travel/cuba/havana' render={() => (<Havana />)} />
          <Route exact path='/travel/cuba/veradero' render={() => (<Veradero />)} />
          <Route exact path='/travel/england' render={() => (<England />)} />
          <Route exact path='/travel/england/lympne' render={() => (<Lympne />)} />
          <Route exact path='/travel/england/margate' render={() => (<Margate />)} />
          <Route exact path='/travel/england/york' render={() => (<York />)} />
          <Route exact path='/travel/lithuania' render={() => (<Lithuania />)} />
          <Route exact path='/travel/lithuania/vilnius' render={() => (<Vilnius />)} />
        </BrowserRouter>
        <div>
          <Footer />
        </div>
      </div>
    )
  }
}

export default App;