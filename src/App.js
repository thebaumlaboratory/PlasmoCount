import React, { useState } from "react";
import Form from "./components/Form";
import ResultsPage from "./components/ResultsPage";
import Loader from "./components/Loader";
import Menu from "./components/Menu";

const App = () => {
  const [Results, setResults] = useState([]);
  const [Loading, setLoading] = useState(false);

  const onFormSubmit = (formData) => {
    if (formData) {
      // TODO: this is currently not working
      setLoading(true);
      fetch("/model", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          setLoading(false);
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
      });
  };

  const dataLabels = {
    id: "ID",
    name: "Name",
    n_cells: "Number of cells",
    parasitemia: "Parasitemia",
  };

  return (
    <div className="ui main text container">
      <Menu />
      <h1 className="ui center aligned header">Malaria detection</h1>
      <br />
      <Form onSubmit={onFormSubmit} loadExample={loadExample} />
      <br />
      {Loading && <Loader text="Fetching results..." />}
      {Results.length > 0 && !Loading && (
        <ResultsPage dataLabels={dataLabels} values={Results} />
      )}
    </div>
  );
};

export default App;
