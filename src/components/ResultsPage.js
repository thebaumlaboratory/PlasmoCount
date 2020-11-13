import React, { useState, useEffect } from "react";
import Table from "./Table";
import ResultsContent from "./ResultsContent";
import Summary from "./Summary";
import { CSVLink } from "react-csv";
import TablePagination from "./TablePagination";

const ResultsPage = ({ dataLabels, values, summary }) => {
  const mobileDim = 768; // based on Semantic UI
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const [isDesktop, setDesktop] = useState(window.innerWidth > mobileDim);

  const maxRows = isDesktop ? 5 : 1;
  const rowData = values.slice(
    maxRows * (activePage - 1),
    maxRows * activePage
  );
  const activeImage = values[maxRows * (activePage - 1) + activeRowIndex];
  console.log(activePage);
  console.log(activeRowIndex);
  console.log(maxRows * (activePage - 1) + activeRowIndex);
  // resizing
  const updateMedia = () => {
    setDesktop(window.innerWidth > mobileDim);
  };

  useEffect(() => {
    window.addEventListener("resize", updateMedia);
    setActiveRowIndex(null);
    setActivePage(1);
    return () => window.removeEventListener("resize", updateMedia);
  }, []);

  // export
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

  const handleExport = () => {
    const exportData = values.slice();
    exportData.unshift(summary);
    return exportData;
  };

  // active row and pagination
  const handleClick = (i) => {
    setActiveRowIndex(i);
  };

  const handlePageChange = (e, { activePage }) => {
    activeRowIndex && setActiveRowIndex(0);
    setActivePage(activePage);
  };

  return (
    <div className="ui stackable two column grid">
      <div className="column">
        <CSVLink
          filename={"malaria_detection.csv"}
          data={handleExport()}
          headers={exportHeaders}
          className="ui fluid segment primary button"
        >
          Export
        </CSVLink>
        <Summary summary={summary} />
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
        {activeRowIndex != null && <ResultsContent data={activeImage} />}
      </div>
    </div>
  );
};

export default ResultsPage;
