import React, { useState } from "react";
import Form from "./components/Form/Form";
import Menu from "./components/Menu";
import About from "./components/About";
import Results from "./components/Results/Results";
import axios from "axios";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";

const App = () => {
  const [activeJob, setActiveJob] = useState(null);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState({});
  const [files, setFiles] = useState(null);

  const [Loading, setLoading] = useState(false);
  const [fromForm,setFromForm] = useState(false);
  const [hideForm,setFormHidden] = useState(false);

  const [error,setError] = useState(false);
  const onFormSubmit = (formData) => {
    
    console.log("onformsubmit")
    if (formData) {
      console.log("got formdata")
      
      setLoading(true)
      axios.post("/api/new_model",formData ,{
        headers: {
            "Content-type": "multipart/form-data",
        },                    
    }).then((response) => {
      setError(false)
      setLoading(false)
      console.log(response)
     
      setSummary(response.data.data.summary);
      setResults(response.data.data.results);
    });
      
    }
  };


  return (
    <Router>
      {activeJob && <Redirect to={`/${activeJob}`} />}
      <div className="ui container">
        <Menu />
        <h1 className="ui center aligned header">PlasmoCount</h1>
        {error && (<div style={{backgroundColor:"#FFB6C1",borderRadius:"5px",padding:"15px 10px 15px 50px"}}>Error</div>)}
        <div className="ui hidden divider"></div>
        <Route
          path={["/", "/:id"]}
          exact
          render={(props) => <Form {...props} onSubmit={onFormSubmit} files={files} setFiles={setFiles} setActive={setActiveJob} setFromForm={setFromForm} hideForm={hideForm} setFormHidden={setFormHidden}/>}
        />
        <Route path="/pages/about" exact component={About} />
        <div className="ui hidden divider"></div>
        {!error && <Route path="/:id" exact render={(props) => <Results {...props} setError={setError} results={results} summary={summary} Loading={Loading} fromForm={fromForm} files={files} setResults={setResults} setSummary={setSummary} setLoading={setLoading} setFormHidden={setFormHidden}/>} />}
      
        </div>
    </Router>
  );
};

export default App;
