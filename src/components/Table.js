import React, { useState } from "react";
import { CSVLink } from "react-csv";

const Table = ({ dataLabels, rowData, onClick, csvData }) => {
  const [activeRowIndex, setActiveRow] = useState(null);
  const handleClick = (i) => {
    setActiveRow(i);
    if (onClick) {
      onClick(i);
    }
  };
  const handleExport = () => {
    const exportData = rowData.map(({ plot, ...attrs }) => attrs);
    return exportData;
  };

  const fillRow = (row) => {
    const cells = Object.keys(dataLabels).map((label, labelIndex) => {
      return (
        <td key={labelIndex} data-label={label}>
          {row[label]}
        </td>
      );
    });
    return cells;
  };

  const Header = Object.keys(dataLabels).map((label) => {
    return <th key={label}>{dataLabels[label]}</th>;
  });

  const Body = rowData.map((row, rowIndex) => {
    return (
      <tr
        key={rowIndex}
        className={rowIndex === activeRowIndex ? "active" : ""}
        onClick={() => handleClick(rowIndex)}
      >
        {fillRow(row)}
      </tr>
    );
  });

  const Footer = (
    <tfoot className="full-width">
      <tr>
        <th colSpan={`${Object.keys(dataLabels).length}`}>
          <CSVLink
            className="ui small primary right floated button"
            data={handleExport()}
            filename={"export.csv"}
          >
            Export
          </CSVLink>
        </th>
      </tr>
    </tfoot>
  );

  return (
    <table className="ui selectable celled table">
      <thead>
        <tr>{Header}</tr>
      </thead>
      <tbody>{Body}</tbody>
      {Footer}
    </table>
  );
};

export default Table;
