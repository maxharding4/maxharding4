import React, { Component } from 'react';
import PictureList from '../../../../components/lists/travel/PictureList';
import PictureSearchBox from '../../../../components/searchBox/PictureSearchBox';
import Scroll from '../../../../components/Scroll';
import ErrorBoundry from '../../../../components/ErrorBoundry';
import { photos } from '../../../../data/italy/rome';

import '../../../../styles/styles.css';
import 'tachyons';

export default class Rome extends Component {
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
          <h1 className='f1' data-test='page-header'>Rome, Italy</h1>
          <div className='pa2' id='searchBox'>
            <PictureSearchBox searchChange={this.onSearchChange} />
          </div>
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