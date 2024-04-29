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
  const [errorMessage,setErrorMessage] = useState(null)

  const onFormSubmit = (formData) => {
    
    
    if (formData) {
      
      setErrorMessage(null)
      setLoading(true)
      axios.post("/api/model",formData ,{
        headers: {
            "Content-type": "multipart/form-data",
        },                    
    }).then((response) => {
      
      setLoading(false)
      console.log(response)
      console.log(response.data.data.summary)
      setSummary(response.data.data.summary);
      setResults(response.data.data.results);
    }).catch((err) =>{
      console.log(err.response.data)
      setErrorMessage(err.response.data)
    
    })
      
    }
  };


  return (
    <Router>
      {activeJob && <Redirect to={`/${activeJob}`} />}
      <div className="ui container">
        <Menu />
        <h1 className="ui center aligned header">PlasmoCount</h1>
    
        <div className="ui hidden divider"></div>
        <Route
          path={["/", "/:id"]}
          exact
          render={(props) => <Form {...props} onSubmit={onFormSubmit} files={files} setFiles={setFiles} setActive={setActiveJob} setFromForm={setFromForm} hideForm={hideForm} setFormHidden={setFormHidden} errorMessage={errorMessage}/>}
        />
        <Route path="/pages/about" exact component={About} />
        <div className="ui hidden divider"></div>
        <Route path="/:id" exact render={(props) => <Results {...props} results={results} summary={summary} Loading={Loading} fromForm={fromForm} files={files} setResults={setResults} setSummary={setSummary} setLoading={setLoading} setFormHidden={setFormHidden} errorMessage={errorMessage}/>} />
      
        </div>
    </Router>
  );
};

export default App;
