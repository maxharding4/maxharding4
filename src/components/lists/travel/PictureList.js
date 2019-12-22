import React from 'react';
import PictureCard from '../../cards/travel/PictureCard';

const PictureList = ({ photos }) => {

  return (
    <div>
      {
        photos.map((user, i) => {
          return (
            <PictureCard
              key={i}
              id={photos[i].id}
              country={photos[i].country}
              name={photos[i].name}
              location={photos[i].location}/>
          );
        })
      }
    </div>
  );
}

export default PictureList;