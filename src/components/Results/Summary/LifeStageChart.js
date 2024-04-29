import React, { useEffect, useState } from "react";
import { Slider } from "react-semantic-ui-range";
import Plot from "react-plotly.js";
import ImageBar from "./ImageBar"


const LifeStageHist = ({ x, binSize, onClick, onDoubleClick, job }) => {

  return (
    <div>
      <Plot
        data={[
          {
            type: "histogram",
            x: x.asex_stages,
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
        useResizeHandler={true}
        style={{ width: "100%", height: "100%" }}
        layout={{
          title: "Life stage distribution",
          autosize: true,
          margin: {
            l: 40,
            t: 40,
            b: 40,
            r: 40,
          },
        }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      />
    </div>
  );
};

const LifeStageChart = ({ files,data,set_data,file_boxes, jobId, cloudImage}) => {
  useEffect(()=> {
    if(data.boxes != undefined)  {
      let summary_stages = data.boxes.map(cell => cell.life)
      let new_data = data
      new_data.asex_stages = summary_stages
      set_data(new_data)
    }
  },[data])
  
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
  const handleDoubleClick = (data) => {
    changeActivePoints(null);
  };
  return (
    <div>
      <LifeStageHist
        x={data}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        binSize={binSize}
      />
      <div className="ui basic segment">
        Bin size: {binSize}
        <Slider value={binSize} color="red" settings={settings} />
      </div>
      <div className="ui basic segment">
        {activePoints &&
          activePoints.length > 0 &&
          <ImageBar files={files} cloudImage={cloudImage} jobId={jobId} summary_boxes={data.boxes} file_boxes={file_boxes} ind={activePoints}></ImageBar>
          }
      </div>
      <br />
    </div>
  );
};

export default LifeStageChart;