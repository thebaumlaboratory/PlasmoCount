import React, { useState } from "react";
import Form from "./components/Form/Form";
import Menu from "./components/Menu";
import About from "./components/About";
import Results from "./components/Results/Results";
import emailjs from "emailjs-com";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";

const App = () => {
  const [activeJob, setActiveJob] = useState(null);

  const onFormSubmit = (formData) => {
    if (formData) {

      const email = formData.get("email-address");
      if (email) {
        sendEmail({
          job_id: formData.get("id"),
          to_email: email,
        });
      }

      fetch("/api/model", {
        method: "POST",
        body: formData,
      });
    }
  };

  const sendEmail = ({ job_id, to_email }) => {
    emailjs.send(
      "service_8awvv37",
      "template_edgh30p",
      { job_id, to_email },
      "user_mjOKCHzMBUxkMpFkz7s9F"
    );
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
          render={(props) => <Form {...props} onSubmit={onFormSubmit} setActive={setActiveJob}/>}
        />
        <Route path="/pages/about" exact component={About} />
        <div className="ui hidden divider"></div>
        <Route path="/:id" exact component={Results} />
      </div>
    </Router>
  );
};

export default App;
