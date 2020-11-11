import React from "react";

const ResultsContent = ({ data }) => {
  return (
    <div className="ui fluid card">
      <div className="image">
        <img alt={`Malaria detection of ${data.name}`} src={data.plot} />
      </div>
      <div className="content">
        <h1 className="header">{data.name}</h1>
        <div className="meta">
          <p></p>
        </div>
      </div>
    </div>
  );
};

export default ResultsContent;
