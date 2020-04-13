import React, { Component } from 'react';
import { employment } from '../data/work';
import '../styles/styles.css';
import 'tachyons';

export default class Work extends Component {
  state = {
  }

  constructor() {
    super()
    this.state = {
      employment: [],
      searchfield: ''
    }
  }

  componentDidMount() {
    this.setState({ employment: employment })
  }

  render() {
    return (
      <div>
        <div className='tc'>
          <h1 className='f1'>Work</h1>
        </div>
      </div>
    )
  }
}