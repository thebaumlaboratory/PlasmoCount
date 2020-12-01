import React from "react";

const TableRowCard = ({ jobId, data }) => {
  const endPoint = jobId === "example" ? "api/example" : `api/uploads/${jobId}`;
  return (
    <div className="ui fluid card">
      <div className="image">
        <img alt={data.name} src={`${endPoint}/${data.plot}`} />
      </div>
    </div>
  );
};

export default TableRowCard;
