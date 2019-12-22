import React from 'react';
import { withRouter } from "react-router-dom";
import '../../styles/styles.css'

const WorkCard = ({ name, position, from, to, logo }) => {
  
  return (
    <div className='bg-white-10 mw5 dib br3 pa1 ma2 grow bw2 shadow-5' card={name} onClick={event => window.location.href = `${name}/${position}`}>
      <div>
        <h2>{name}</h2>
        <h3>{position}</h3>
        <h4>{from} - {to}</h4>
      </div>
    </div>
  );
}

export default withRouter(WorkCard);