import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';
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
        <div data-test='content' className='tc'>
          <BrowserRouter>
            <h1 data-test='page-header' className='f1'>Travel Album</h1>
            <div data-test='search-box' className='pa2' >
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