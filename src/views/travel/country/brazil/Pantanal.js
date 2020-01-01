import React, { Component } from 'react';
import PictureList from '../../../../components/lists/travel/PictureList';
import Scroll from '../../../../components/Scroll';
import ErrorBoundry from '../../../../components/ErrorBoundry';
import { photos } from '../../../../data/brazil/pantanal';

import '../../../../styles/styles.css';
import 'tachyons';

export default class Pantanal extends Component {
  state = {
  }

  constructor() {
    super()
    this.state = {
      photos: [],
      searchfield: ''
    }
  }

  componentDidMount() {
    this.setState({ photos: photos })
  }

  onSearchChange = (event) => {
    this.setState({ searchfield: event.target.value })
  }

  render() {
    const { photos, searchfield } = this.state;
    const filteredPhotos = photos.filter(photo => {
      return photo.name.toLowerCase().includes(searchfield.toLowerCase());
    })
    return (
      <div>
        <div className='tc'>
          <h1 className='f1' id='pageHeader'>Pantanal, Brazil</h1>
          <Scroll>
            <ErrorBoundry>
              <PictureList photos={filteredPhotos}/>
            </ErrorBoundry>
          </Scroll>
        </div>
      </div>
    )
  }
}