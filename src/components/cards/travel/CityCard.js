import React from 'react';
import { withRouter } from "react-router-dom";

const CityCard = ({ name, thumb, country }) => {
  return (
    <div className='bg-white-10 mw5 dib br3 pa1 ma2 grow bw2 shadow-5' data-test='city-card' city-card={thumb} onClick={event => window.location.href = `${country}/${thumb}`}>
      <img alt={`city-${thumb}`} src={require(`../../../images/${country}/thumbs/${thumb}.jpg`)} />
      <div data-test='card-title'>
        <h2>{name}</h2>
      </div>
    </div>
  );
}

export default withRouter(CityCard);