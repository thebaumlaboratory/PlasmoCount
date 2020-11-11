import React, { useState } from "react";
import { Slider } from "react-semantic-ui-range";
import Plot from "react-plotly.js";

const ImageBar = (x, ind) => {
  const images = ind.map((i, key) => {
    return <img key={key} className="ui image" src={x[i]} />;
  });
  return (
    <div className="ui center aligned grid">
      <div className="ui mini images">{images}</div>
    </div>
  );
};

const LifeStageHist = ({ x, binSize, onClick }) => {
  return (
    <div>
      <Plot
        data={[
          {
            type: "histogram",
            x: x,
            xbins: {
              end: 4,
              size: binSize,
              start: 0.5,
            },
            marker: {
              color: "#B03060",
            },
          },
        ]}
        layout={{
          title: "Life stage distribution",
          autosize: true,
          width: 520,
          height: 400,
          margin: {
            l: 30,
            t: 40,
            b: 30,
            r: 30,
          },
        }}
        config={{ responsive: true }}
        onClick={onClick}
      />
    </div>
  );
};

const LifeStageChart = ({ data, images }) => {
  const [activePoints, changeActivePoints] = useState(null);
  const [binSize, changeBinSize] = useState(0.25);
  const settings = {
    min: 0,
    max: 1,
    step: 0.01,
    onChange: (value) => {
      changeBinSize(value);
      changeActivePoints(null);
    },
  };
  const handleClick = (data) => {
    changeActivePoints(data.points[0].pointNumbers);
  };
  return (
    <div>
      <LifeStageHist x={data} onClick={handleClick} binSize={binSize} />
      <div className="ui basic segment">
        Bin size: {binSize}
        <Slider value={binSize} color="red" settings={settings} />
      </div>
      <div className="ui basic segment">
        {activePoints &&
          activePoints.length > 0 &&
          ImageBar(images, activePoints)}
      </div>
      <br />
    </div>
  );
};

export default LifeStageChart;
