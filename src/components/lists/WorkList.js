import React from 'react';
import WorkCard from '../cards/WorkCard';

const WorkList = ({ employment }) => {
  return (
    <div>
      {
        employment.map((user, i) => {
          return (
            <WorkCard
              key={i}
              id={employment[i].id}
              name={employment[i].name}
              logo={employment[i].logo}
              position={employment[i].position}
              from={employment[i].from}
              to={employment[i].to} />
          );
        })
      }
    </div>
  );
}

export default WorkList;