import React from "react";
import LifeStageChart from "./LifeStageChart";
import PieChart from "./PieChart";

const Summary = ({ summary }) => {
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
            ["#808080", "#B03060"],
            ["#f77189", "#50b131", "#3ba3ec", "#ffd92f"],
          ]}
          title="Parasitaemia"
        />
      </div>
      <div className="ui fluid segment">
        <LifeStageChart
          data={summary.asex_total}
          images={summary.asex_images}
        />
      </div>
    </div>
  );
};

export default Summary;
