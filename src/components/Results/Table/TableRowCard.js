import React from "react";

const TableRowCard = ({ jobId, data }) => {
  const endPoint =
    jobId === "example"
      ? "api/example"
      : `https://storage.googleapis.com/plasmocount-bucket/${jobId}`;
  // for production: https://storage.googleapis.com/plasmocount-bucket/${jobId}
  return (
    <div className="ui fluid card">
      <div className="image">
        <img alt={data.name} src={`${endPoint}/${data.id}/result.png`} />
      </div>
    </div>
  );
};

export default TableRowCard;