import React from "react";

const Table = ({ dataLabels, rowData, onClick, activeRowIndex }) => {
  const fillRow = (row) => {
    const cells = Object.keys(dataLabels).map((label, labelIndex) => {
      return (
        <td key={labelIndex} data-label={label}>
          {String(row[label]).replaceAll("_", " ")}
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
        onClick={() => onClick(rowIndex)}
      >
        {fillRow(row)}
      </tr>
    );
  });

  return (
    <table className="ui selectable celled table">
      <thead>
        <tr>{Header}</tr>
      </thead>
      <tbody>{Body}</tbody>
    </table>
  );
};

export default Table;
