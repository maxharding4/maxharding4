import React from 'react';
import CityCard from '../../cards/travel/CityCard';

const LocationList = ({ locations }) => {
  return (
    <div data-test='city-list'>
      {
        locations.map((user, i) => {
          return (
            <CityCard
              key={i}
              id={locations[i].id}
              country={locations[i].country}
              location={locations[i].location}
              name={locations[i].name}
              thumb={locations[i].thumb} />
          );
        })
      }
    </div>
  );
}

export default LocationList;