import React, { useEffect, useState } from "react";
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
  // 4 states "before_request" - "before_first_results" - "after_first_results" - "completed"
  const [requestState, setRequestState] = useState('before_request');
  const [fromForm,setFromForm] = useState(false);
  const [hideForm,setFormHidden] = useState(false);
  const [errorMessage,setErrorMessage] = useState(null);
  
  //recursive function to send all of the images in batches
  const sendForm = (forms,return_data) => {
    
    if(forms.length == 0) {
      setRequestState('completed')
      return
    }
    let formData = forms.shift();
    formData.append('previous-results', JSON.stringify(return_data))
    
    axios.post("/api/model",formData ,{
      headers: {
          "Content-type": "multipart/form-data",
      },                    
  }).then((response) => {
    if(requestState != "after_first_results")  {
      setRequestState("after_first_results")
    }
    setSummary(response.data.data.summary);
    setResults(response.data.data.results);
    console.log(response.data.data.results)
    sendForm(forms,response.data.data.results)
  }).catch((err) =>{
    setRequestState("before_request")
    console.log(err.response.data)
    setErrorMessage("Error: " + err.response.data)
    
  })
  }

  const onFormSubmit = (formData) => {
    
    
    if (formData) {
      
      setErrorMessage(null)
      setRequestState("before_first_results")
      sendForm(formData,null,0)
      
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
        <Route path="/:id" exact render={(props) => <Results {...props} results={results} summary={summary} requestState={requestState} fromForm={fromForm} files={files} setResults={setResults} setSummary={setSummary} setRequestState={setRequestState} setFormHidden={setFormHidden} errorMessage={errorMessage} />} />
      
        </div>
    </Router>
  );
};

export default App;
