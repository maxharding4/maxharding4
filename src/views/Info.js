import React, { Component } from 'react';
import Scroll from '../components/Scroll';
import ErrorBoundry from '../components/ErrorBoundry';
import '../styles/styles.css';
import 'tachyons';

export default class Info extends Component {
  state = {
  }

  render() {
    return (
      <div>
        <div className='tc'>
          <h1 className='f1'>Info</h1>
        </div>
      </div>
    )
  }
}