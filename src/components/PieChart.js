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
  return (
    <Plot
      className="ui container"
      data={data}
      useResizeHandler={true}
      style={{ width: "100%", height: "100%" }}
      layout={{
        autosize: true,
        showlegend: false,
        grid: { rows: 1, columns: values.length },
        title: title,
        margin: {
          l: 40,
          t: 40,
          b: 40,
          r: 40,
        },
      }}
    />
  );
};

export default PieChart;
