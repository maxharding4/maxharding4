import React, { Component } from 'react';
import Scroll from '../components/Scroll';
import ErrorBoundry from '../components/ErrorBoundry';
import WorkList from '../components/lists/WorkList';
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
    const { employment, searchfield } = this.state;
    const filteredEmployment = employment.filter(employment => {
      return employment.name.toLowerCase().includes(searchfield.toLowerCase());
    })
    return (
      <div>
        <div className='tc'>
          <h1 className='f1'>Work</h1>
          <Scroll>
            <ErrorBoundry>
              <WorkList employment={filteredEmployment} />
            </ErrorBoundry>
          </Scroll>
        </div>
      </div>
    )
  }
}