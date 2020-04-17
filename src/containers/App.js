import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Home from '../views/Home';
import Work from '../views/Work';
import Travel from '../views/Travel';
import Footer from '../components/Footer';

import { Austria, Vienna } from '../views/travel/country/austria';
import { Brazil, Iguazu, Pantanal, Rio } from '../views/travel/country/brazil';
import { Canada, Banff, Bowen, Drumheller, Duffey, Icefields, Jasper, Joffre, Louise, Moraine, Ottawa, Squamish, Yellowhead } from '../views/travel/country/canada/';
import { Cuba, Havana, Veradero } from '../views/travel/country/cuba/';
import { England, Buxton, Ilkley, Lympne, Margate, York } from '../views/travel/country/england/';
import { Estonia, Tallinn } from '../views/travel/country/estonia/';
import { Finland, Helsinki } from '../views/travel/country/finland/';
import { France, Bethune, Dijon, Marseille } from '../views/travel/country/france/';
import { Ireland, Dublin, Galway } from '../views/travel/country/ireland/';
import { Italy, LakeComo, Florence, Monza, Pisa, Rome, Trieste, Turin } from '../views/travel/country/italy/';
import { Lithuania, Vilnius } from '../views/travel/country/lithuania/';
import { Maldives, Helengeli } from '../views/travel/country/maldives/';
import { Montenegro, Budva } from '../views/travel/country/montenegro/';
import { Scotland, Edinburgh } from '../views/travel/country/scotland';
import { Slovenia, Ljubljana } from '../views/travel/country/slovenia';
import { Spain, Alicante, Javea } from '../views/travel/country/spain';
import { Switzerland, Basel } from '../views/travel/country/switzerland';
import { Usa, Cape, Dc, Miami, Ny, Providence } from '../views/travel/country/usa';
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
          <Route exact path='/travel/brazil/iguazu-falls' render={() => (<Iguazu />)} />
          <Route exact path='/travel/brazil/rio-de-janeiro' render={() => (<Rio />)} />
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
          <Route exact path='/travel/england/buxton' render={() => (<Buxton />)} />
          <Route exact path='/travel/england/ilkley' render={() => (<Ilkley />)} />
          <Route exact path='/travel/england/lympne' render={() => (<Lympne />)} />
          <Route exact path='/travel/england/margate' render={() => (<Margate />)} />
          <Route exact path='/travel/england/york' render={() => (<York />)} />
          <Route exact path='/travel/estonia' render={() => (<Estonia />)} />
          <Route exact path='/travel/estonia/tallinn' render={() => (<Tallinn />)} />
          <Route exact path='/travel/finland' render={() => (<Finland />)} />
          <Route exact path='/travel/finland/helsinki' render={() => (<Helsinki />)} />
          <Route exact path='/travel/france' render={() => (<France />)} />
          <Route exact path='/travel/france/bethune' render={() => (<Bethune />)} />
          <Route exact path='/travel/france/dijon' render={() => (<Dijon />)} />
          <Route exact path='/travel/france/marseille' render={() => (<Marseille />)} />
          <Route exact path='/travel/ireland' render={() => (<Ireland />)} />
          <Route exact path='/travel/ireland/dublin' render={() => (<Dublin />)} />
          <Route exact path='/travel/ireland/galway' render={() => (<Galway />)} />
          <Route exact path='/travel/italy' render={() => (<Italy />)} />
          <Route exact path='/travel/italy/como' render={() => (<LakeComo />)} />
          <Route exact path='/travel/italy/florence' render={() => (<Florence />)} />
          <Route exact path='/travel/italy/monza' render={() => (<Monza />)} />
          <Route exact path='/travel/italy/pisa' render={() => (<Pisa />)} />
          <Route exact path='/travel/italy/rome' render={() => (<Rome />)} />
          <Route exact path='/travel/italy/trieste' render={() => (<Trieste />)} />
          <Route exact path='/travel/italy/turin' render={() => (<Turin />)} />
          <Route exact path='/travel/lithuania' render={() => (<Lithuania />)} />
          <Route exact path='/travel/lithuania/vilnius' render={() => (<Vilnius />)} />
          <Route exact path='/travel/maldives' render={() => (<Maldives />)} />
          <Route exact path='/travel/maldives/helengeli' render={() => (<Helengeli />)} />
          <Route exact path='/travel/montenegro' render={() => (<Montenegro />)} />
          <Route exact path='/travel/montenegro/budva' render={() => (<Budva />)} />
          <Route exact path='/travel/scotland' render={() => (<Scotland />)} />
          <Route exact path='/travel/scotland/edinburgh' render={() => (<Edinburgh />)} />
          <Route exact path='/travel/slovenia' render={() => (<Slovenia />)} />
          <Route exact path='/travel/slovenia/ljubljana' render={() => (<Ljubljana />)} />
          <Route exact path='/travel/spain' render={() => (<Spain />)} />
          <Route exact path='/travel/spain/alicante' render={() => (<Alicante />)} />
          <Route exact path='/travel/spain/javea' render={() => (<Javea />)} />
          <Route exact path='/travel/switzerland' render={() => (<Switzerland />)} />
          <Route exact path='/travel/switzerland/basel' render={() => (<Basel />)} />
          <Route exact path='/travel/usa' render={() => (<Usa />)} />
          <Route exact path='/travel/usa/cape-cod' render={() => (<Cape />)} />
          <Route exact path='/travel/usa/washington-dc' render={() => (<Dc />)} />
          <Route exact path='/travel/usa/miami' render={() => (<Miami />)} />
          <Route exact path='/travel/usa/new-york' render={() => (<Ny />)} />
          <Route exact path='/travel/usa/providence' render={() => (<Providence />)} />
        </BrowserRouter>
        <div>
          <Footer />
        </div>
      </div>
    )
  }
}

export default App;