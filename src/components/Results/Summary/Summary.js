import React, { useEffect } from "react";
import LifeStageChart from "./LifeStageChart";
import PieChart from "./PieChart";

const Summary = ({ jobId, summary,setSummary,files, file_boxes,cloudImage }) => {

  return (
    <div>
      <div className="ui fluid segment">
        <PieChart
          values={[
            [summary.n_uninfected, summary.n_infected],
            [
              summary.n_ring,
              summary.n_troph,
              summary.n_schizont,
              summary.n_gam,
            ],
          ]}
          labels={[
            ["uninfected", "infected"],
            ["ring", "trophozoite", "schizont", "gametocyte"],
          ]}
          colors={[
            ["#999999", "#B03060"],
            ["#f77189", "#50b131", "#3ba3ec", "#ffd92f"],
          ]}
          title="Parasitaemia"
        />
      </div>
      <div className="ui fluid segment">
        <LifeStageChart
          jobId={jobId}
          set_data={setSummary}
          data = {summary}
          files={files}
          file_boxes={file_boxes}
          cloudImage={cloudImage}
        />
      </div>
    </div>
  );
};

export default Summary;
