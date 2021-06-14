import React from "react";

const TableRowCard = ({ jobId, data }) => {
  const endPoint = jobId === "example" ? "api/example" : `api/uploads/${jobId}`;
  // for production: https://storage.googleapis.com/plasmocount-bucket/${jobId}
  return (
    <div className="ui fluid card">
      <div className="image">
        <img alt={data.name} src={`${endPoint}/${data.plot}?time=${Date.now()}`} />
      </div>
    </div>
  );
};

export default TableRowCard;
