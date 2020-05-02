import React, { Component } from 'react';
import '../styles/styles.css';
import 'tachyons';

export default class Home extends Component {
  state = {
  }

  render() {
    return (
      <div>
        <div data-test='content' className='tc'>
          <h1 data-test='page-header' className='f1'>Home</h1>
        </div>
      </div>
    )
  }
}