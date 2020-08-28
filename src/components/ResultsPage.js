import React, { useState } from "react";
import Table from "./Table";
import ResultsContent from "./ResultsContent";

const ResultsPage = ({ dataLabels, values, csvExport }) => {
  const [activeFile, changeActiveFile] = useState(null);
  const onTableClick = (index) => {
    changeActiveFile(index);
  };

  return (
    <div>
      <Table dataLabels={dataLabels} rowData={values} onClick={onTableClick} />
      {activeFile != null && <ResultsContent data={values[activeFile]} />}
      <br />
    </div>
  );
};

export default ResultsPage;
