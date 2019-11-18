import React, { Component } from 'react';
import CardList from '../components/CardList';
import SearchBox from '../components/Searchbox';
import Scroll from '../components/Scroll';
import ErrorBoundry from '../components/ErrorBoundry';
import { countries } from '../countries';
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
        <div id='tc'>
        <h1 className='f1'>Travel Album</h1>
        <SearchBox searchChange={this.onSearchChange} />
        <Scroll>
          <ErrorBoundry>
            <CardList countries={filteredCountries} />
          </ErrorBoundry>
        </Scroll>
        </div>
      </div>
    )
  }
}