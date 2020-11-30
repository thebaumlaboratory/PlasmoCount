import React, { useState } from "react";
import Form from "./components/Form/Form";
import Menu from "./components/Menu";
import Results from "./components/Results/Results";
import emailjs from "emailjs-com";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const App = () => {
  const [activeJob, setActiveJob] = useState(null);

  const onFormSubmit = (formData) => {
    if (formData) {
      const jobId = uuidv4();
      formData.append("id", jobId);
      setActiveJob(jobId);

      const email = formData.get("email-address");
      if (email) {
        sendEmail({
          link: `localhost:3000/api/${jobId}`,
          to_email: email,
        });
      }

      fetch("/api/model", {
        method: "POST",
        body: formData,
      });
    }
  };

  const sendEmail = ({ link, to_email }) => {
    emailjs.send(
      "service_izg1wij",
      "template_0v18rqj",
      { link, to_email },
      "user_h9QYUT944PSMCm6whGO0Z"
    );
  };

  return (
    <Router>
      {activeJob && <Redirect to={`/${activeJob}`} />}
      <div className="ui container">
        <Menu />
        <h1 className="ui center aligned header">PlasmoCount</h1>
        <div className="ui hidden divider"></div>
        <Form onSubmit={onFormSubmit} />
        <div className="ui hidden divider"></div>
        <Route path="/:id" exact component={Results} />
      </div>
    </Router>
  );
};

export default App;
