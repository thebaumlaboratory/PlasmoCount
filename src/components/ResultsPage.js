import React, { useState } from "react";
import Table from "./Table";
import ResultsContent from "./ResultsContent";
import Summary from "./Summary";

const ResultsPage = ({ dataLabels, values, summary }) => {
  const [activeFile, changeActiveFile] = useState(null);
  const onTableClick = (index) => {
    changeActiveFile(index);
  };

  return (
    <div className="ui stackable two column grid">
      <div className="column">
        <Summary summary={summary} />
      </div>
      <div className="column">
        <Table
          dataLabels={dataLabels}
          rowData={values}
          onClick={onTableClick}
        />
        {activeFile != null && <ResultsContent data={values[activeFile]} />}
      </div>
    </div>
  );
};

export default ResultsPage;
