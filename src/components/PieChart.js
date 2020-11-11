import React from "react";
import Plot from "react-plotly.js";

const PieChart = ({ values, labels, colors, title }) => {
  const data = values.map((i, key) => {
    return {
      type: "pie",
      values: i,
      labels: labels[key],
      domain: { column: key },
      textinfo: "label+percent",
      marker: {
        colors: colors[key],
      },
    };
  });
  console.log(data);
  return (
    <Plot
      useResizeHandler
      data={data}
      layout={{
        showlegend: false,
        grid: { rows: 1, columns: values.length },
        title: title,
        autosize: true,
        width: 520,
        height: 400,
      }}
    />
  );
};

export default PieChart;
