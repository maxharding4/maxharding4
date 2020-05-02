import React, { Component } from 'react';
import LocationList from '../../../../components/lists/travel/LocationList';
import LocationSearchBox from '../../../../components/searchBox/LocationSearchBox';
import Scroll from '../../../../components/Scroll';
import ErrorBoundry from '../../../../components/ErrorBoundry';
import { locations } from '../../../../data/spain/spain';
import '../../../../styles/styles.css';
import 'tachyons';

export default class Spain extends Component {
  state = {
  }

  constructor() {
    super()
    this.state = {
      locations: [],
      searchfield: ''
    }
  }

  componentDidMount() {
    this.setState({ locations: locations })
  }

  onSearchChange = (event) => {
    this.setState({ searchfield: event.target.value })
  }

  render() {
    const { locations, searchfield } = this.state;
    const filteredLocations = locations.filter(location => {
      return location.name.toLowerCase().includes(searchfield.toLowerCase());
    })
    return (
      <div>
        <div className='tc'>
          <h1 className='f1' data-test='page-header'>Spain</h1>
          <div className='pa2' id='searchBox'>
            <LocationSearchBox searchChange={this.onSearchChange} />
          </div>
          <Scroll>
            <ErrorBoundry>
              <LocationList locations={filteredLocations} />
            </ErrorBoundry>
          </Scroll>
        </div>
      </div>
    )
  }
}