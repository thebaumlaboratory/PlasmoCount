import React, { useState, useEffect } from "react";
import ResultsContent from "./ResultsContent";
import Loader from "./Loader";

const Results = (props) => {
  const timer = 5000;
  const [Results, setResults] = useState([]);
  const [Summary, setSummary] = useState({});
  const [Loading, setLoading] = useState(true);

  const jobId = props.match.params.id;

  useEffect(() => {
    const loadResults = () => {
      fetch("/result", {
        method: "POST",
        body: JSON.stringify({ id: jobId }),
        headers: new Headers({
          "content-type": "application/json",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.statusOK) {
            return;
          }
          setSummary(data.results.summary);
          setResults(data.results.results);
          setLoading(false);
        });
    };

    if (Loading) {
      loadResults();
      const interval = setInterval(() => {
        loadResults();
      }, timer);
      return () => clearInterval(interval);
    }
  }, [Loading, jobId]);

  useEffect(() => {
    setLoading(true);
  }, [jobId]);

  return (
    <div>
      {Loading ? (
        <Loader text="Fetching results..." />
      ) : (
        <ResultsContent values={Results} summary={Summary} />
      )}
    </div>
  );
};

export default Results;
