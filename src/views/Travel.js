import React, { Component } from 'react';
import { Route, BrowserRouter } from 'react-router-dom';
import CountryList from '../components/lists/travel/CountryList';
import CountrySearchBox from '../components/searchBox/CountrySearchBox';
import Scroll from '../components/Scroll';
import ErrorBoundry from '../components/ErrorBoundry';
import { countries } from '../data/countries';
import '../styles/styles.css';
import 'tachyons';

export default class Travel extends Component {
  state = {
  }

  constructor() {
    super()
    this.state = {
      countries: [],
      searchfield: ''
    }
  }

  componentDidMount() {
    this.setState({ countries: countries })
  }

  onSearchChange = (event) => {
    this.setState({ searchfield: event.target.value })
  }

  render() {
    const { countries, searchfield } = this.state;
    const filteredCountries = countries.filter(country => {
      return country.name.toLowerCase().includes(searchfield.toLowerCase());
    })
    return (
      <div>
        <div className='tc'>
          <BrowserRouter>
            <h1 className='f1' id='pageHeader'>Travel Album</h1>
            <div className='pa2' id='searchBox'>
              <CountrySearchBox searchChange={this.onSearchChange} />
            </div>
            <Scroll>
              <ErrorBoundry>
                <CountryList countries={filteredCountries} />
              </ErrorBoundry>
            </Scroll>
          </BrowserRouter>
        </div>
      </div>
    )
  }
}