import React from "react";
import { Bar } from "react-chartjs-2";

const Chart = (data) => {
  console.log(data);
  let labels = [];
  let values = [];
  for (var d in data.data) {
    values.push(parseFloat(d));
    labels.push(data.data[d][0]);
  }
  const barData = {
    labels: labels,
    datasets: [
      {
        label: "Life stage",
        data: values,
        backgroundColor: "rgba(14,110,184,0.2)",
        borderColor: "rgba(14,110,184,1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(14,110,184,0.4)",
        hoverBorderColor: "rgba(14,110,184,1)",
      },
    ],
  };
  return (
    <div>
      <Bar
        data={barData}
        width={100}
        height={50}
        options={{
          maintainAspectRatio: true,
        }}
      />
    </div>
  );
};

export default Chart;
