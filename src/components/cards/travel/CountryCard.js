import React from 'react';
import { withRouter } from "react-router-dom";

const Card = ({ name, flag }) => {

  return (
    <div className='bg-white-10 mw5 dib br3 pa1 ma2 grow bw2 shadow-5' data-test='country-card' country-card={flag} onClick={event => window.location.href = `/travel/${flag}`}>
      <img alt={`flag--${flag}`} src={require(`../../../images/flags/${flag}.png`)} />
      <div data-test='card-title'>
        <h2>{name}</h2>
      </div>
    </div>
  );
}

export default withRouter(Card);