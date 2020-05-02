import React from 'react';

const PictureCard = ({ id, country, location, name }) => {
  return (
    <div className='bg-white-10 mw7 dib br3 pa1 ma2 bw2 shadow-5 v-mid' data-test='picture-card' picture-card={location}>
      <img alt={(`${location}-${id}`)} src={require(`../../../images/${country}/${location}/${location}-${id}.jpg`)} />
      <div data-test='picture-card--txt'>
        <h2>#{id} - {name}</h2>
      </div>
    </div>

  );
}

export default PictureCard;