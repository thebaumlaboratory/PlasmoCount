import React from "react";
import Chart from "./LifeStageChart";

const ResultsContent = ({ data }) => {
  const imgPath = `${window.location.protocol}//${window.location.hostname}:5000/${data.plot}`;
  return (
    <div className="ui fluid card">
      <div className="image">
        <img alt={`Malaria detection of ${data.name}`} src={imgPath} />
      </div>
      <div className="content">
        <a className="header">{data.name}</a>
        <div className="meta">
          <p></p>
        </div>
        <div className="description">
          <p># cells: {data.n_cells}</p>
          <p># infected cells: {data.n_infected} </p>
          <p># uninfected cells: {data.n_uninfected}</p>
          <p>Parasitemia: {data.parasitemia}</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsContent;
