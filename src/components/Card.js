import React from 'react';

const Card = ({ name, flag }) => {
  return (
    <div className='bg-white-10 mw5 dib br3 pa1 ma2 grow bw2 shadow-5'>
      <img alt={name} src={require(`../images/flags/${flag}.png`)} />
      <div>
        <h2>{name}</h2>
      </div>
    </div>
  );
}

export default Card;