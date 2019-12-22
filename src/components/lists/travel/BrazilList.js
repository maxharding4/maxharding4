import React from 'react';
import CityCard from '../../cards/travel/CityCard';

const BrazilList = ({ locations }) => {
  return (
    <div>
      {
        locations.map((user, i) => {
          return (
            <CityCard
              key={i}
              id={locations[i].id}
              country={locations[i].country}
              name={locations[i].name}
              thumb={locations[i].thumb} />
          );
        })
      }
    </div>
  );
}

export default BrazilList;