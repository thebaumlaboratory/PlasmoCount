import React, { useState } from "react";
import Form from "./components/Form/Form";
import Menu from "./components/Menu";
import About from "./components/About";
import Results from "./components/Results/Results";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const App = () => {
  const [activeJob, setActiveJob] = useState(null);

  const onFormSubmit = (formData) => {
    if (formData) {
      const jobId = uuidv4();
      formData.append("id", jobId);
      setActiveJob(jobId);
      fetch("/api/model", {
        method: "POST",
        body: formData,
      });
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
          render={(props) => <Form {...props} onSubmit={onFormSubmit} />}
        />
        <Route path="/pages/about" exact component={About} />
        <div className="ui hidden divider"></div>
        <Route path="/:id" exact component={Results} />
      </div>
    </Router>
  );
};

export default App;
