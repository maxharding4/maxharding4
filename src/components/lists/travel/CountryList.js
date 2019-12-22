import React from 'react';
import Card from '../../cards/travel/CountryCard';

const CountryList = ({ countries }) => {
  return (
    <div>
      {
        countries.map((user, i) => {
          return (
            <Card
              key={i}
              id={countries[i].id}
              name={countries[i].name}
              flag={countries[i].flag} />
          );
        })
      }
    </div>
  );
}

export default CountryList;