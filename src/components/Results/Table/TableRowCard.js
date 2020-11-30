import React from "react";

const TableRowCard = ({ data }) => {
  return (
    <div className="ui fluid card">
      <div className="image">
        <img alt={`Malaria detection of ${data.name}`} src={data.plot} />
      </div>
    </div>
  );
};

export default TableRowCard;
