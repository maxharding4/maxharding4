import React from 'react';
import { withRouter } from "react-router-dom";

const CityCard = ({ name, thumb, country }) => {
  return (
    <div className='bg-white-10 mw5 dib br3 pa1 ma2 grow bw2 shadow-5' card={name} onClick={event => window.location.href = `${country}/${thumb}`}>
      <img alt={name} src={require(`../../../images/${country}/thumbs/${thumb}.jpg`)} />
      <div>
        <h2>{name}</h2>
      </div>
    </div>
  );
}

export default withRouter(CityCard);