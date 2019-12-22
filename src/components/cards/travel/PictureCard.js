import React from 'react';

const PictureCard = ({ id, country, location, name }) => {
  return (
    <div className='bg-white-10 mw7 dib br3 pa1 ma2 bw2 shadow-5' card={name}>
      <img alt={(`${location}-${id}`)} src={require(`../../../images/${country}/${location}/${location}-${id}.jpg`)} />
      <div>
        <h2>#{id} - {name}</h2>
      </div>
    </div>

  );
}

export default PictureCard;