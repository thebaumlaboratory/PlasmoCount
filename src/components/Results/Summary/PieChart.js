import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

const PieChart = ({ values, labels, colors, title }) => {
  const [revision, setRevision] = useState(0);
  const [data,setData] = useState(values.map((i, key) => {
    
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
  }))
  useEffect(() => {
    
    setData(values.map((i, key) => {
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
    }))
    setRevision(prevRevision => prevRevision+1)
    
  },[values])
  return (
    <Plot
      
      className="ui container"
      data={data}
      useResizeHandler={true}
      style={{ width: "100%", height: "100%" }}
      layout={{
        datarevision: revision,
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
