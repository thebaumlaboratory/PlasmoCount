import React, { useState } from "react";
import Form from "./components/Form";
import ResultsPage from "./components/ResultsPage";
import Loader from "./components/Loader";
import Menu from "./components/Menu";

const App = () => {
  const [Results, setResults] = useState([]);
  const [Summary, setSummary] = useState({});
  const [Loading, setLoading] = useState(false);

  const onFormSubmit = (formData) => {
    if (formData) {
      setLoading(true);
      fetch("/model", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          setLoading(false);
          setSummary(data.summary);
          setResults(data.results);
        });
    }
  };

  const loadExample = () => {
    setLoading(true);
    fetch("/example", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setResults(data.results);
        setSummary(data.summary);
      });
  };

  const dataLabels = {
    name: "Name",
    n_cells: "# cells",
    parasitemia: "Parasitaemia",
    n_ring: "#R",
    n_troph: "#T",
    n_schizont: "#S",
    n_gam: "#G",
  };

  return (
    <div className="ui container">
      <Menu />
      <h1 className="ui center aligned header">Malaria detection</h1>
      <div className="ui hidden divider"></div>
      <Form onSubmit={onFormSubmit} loadExample={loadExample} />
      <div className="ui hidden divider"></div>
      {Loading && <Loader text="Fetching results..." />}
      {Results.length > 0 && Object.keys(Summary).length > 0 && !Loading && (
        <ResultsPage
          dataLabels={dataLabels}
          values={Results}
          summary={Summary}
        />
      )}
    </div>
  );
};

export default App;
