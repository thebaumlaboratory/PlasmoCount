import React, { useState, useEffect } from "react";
import Table from "./Table/Table";
import TableRowCard from "./Table/TableRowCard";
import Summary from "./Summary/Summary";
import { CSVLink } from "react-csv";
import TablePagination from "./Table/TablePagination";

const ResultsContent = ({ jobId, values,files, summary, cloudImageNum }) => {
  const mobileDim = 768; // based on Semantic UI
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const [isDesktop, setDesktop] = useState(window.innerWidth > mobileDim);
  const maxRows = isDesktop ? 5 : 1;
  const activeIndex = maxRows * (activePage - 1) + activeRowIndex
  const rowData = values.slice(
    maxRows * (activePage - 1),
    maxRows * activePage
  );
  const activeImage = values[activeIndex];

  const dataLabels = {
    name: "Name",
    n_cells: "# cells",
    parasitemia: "Parasitaemia",
    n_ring: "#R",
    n_troph: "#T",
    n_schizont: "#S",
    n_gam: "#G",
  };

  const exportHeaders = [
    { label: "Filename", key: "name" },
    { label: "# cells", key: "n_cells" },
    { label: "# uninfected cells", key: "n_uninfected" },
    { label: "# infected cells", key: "n_infected" },
    { label: "Parasitaemia", key: "parasitemia" },
    { label: "# ring", key: "n_ring" },
    { label: "# trophozoite", key: "n_troph" },
    { label: "# schizont", key: "n_schizont" },
    { label: "# gametocyte", key: "n_gam" },
    { label: "Asexual stages", key: "asex_stages" },
  ];

  // resizing
  const updateMedia = () => {
    setActiveRowIndex(null);
    setActivePage(1);
    setDesktop(window.innerWidth > mobileDim);
  };

  useEffect(() => {
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, [isDesktop]);

  // active row and pagination
  const handleClick = (i) => {
    setActiveRowIndex(i);
  };

  const handlePageChange = (e, { activePage }) => {
    activeRowIndex && setActiveRowIndex(0);
    setActivePage(activePage);
  };

  const handleExport = () => {
    const exportData = values.slice();
    exportData.unshift(summary);
    return exportData;
  };
  
  return (
    <div className="ui stackable two column grid">
      <div className="column">
        <CSVLink
          filename={"PlasmoCount.csv"}
          data={handleExport()}
          headers={exportHeaders}
          className="ui fluid segment primary button"
        >
          Export
        </CSVLink>
        <Summary jobId={jobId} files={files} summary={summary} cloudImageNum={cloudImageNum} file_boxes={values.map((elem) => elem.boxes)} />
      </div>
      <div className="column">
        <Table
          rowData={rowData}
          dataLabels={isDesktop ? dataLabels : { name: "Name" }}
          onClick={handleClick}
          activeRowIndex={activeRowIndex}
        />
        <div className="ui container center aligned">
          <TablePagination
            activePage={activePage}
            handlePageChange={handlePageChange}
            totalPages={Math.ceil(values.length / maxRows)}
          />
        </div>
        {activeRowIndex != null && (
          <TableRowCard jobId={jobId} files={files} values={values} activeIndex={activeRowIndex} cloudImageNum={cloudImageNum}/>
        )}
      </div>
    </div>
  );
};

export default ResultsContent;
