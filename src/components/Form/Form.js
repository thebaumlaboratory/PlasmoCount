import "./Form.css";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Form = (props) => {
  const [emailAddress, setEmailAddress] = useState("");
  const [hasGams, setGams] = useState(false);
  const [dataContrib, setDataContrib] = useState(true);
  const [files, setFiles] = useState(null);
  const [isOpen, makeOpen] = useState(true);
  const active = isOpen ? "active" : "";

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (!files) {
      return;
    }
    let formData = new FormData();
    const timestamp = Date.now();
    const date = new Date(timestamp);
    for (const file in files) {
      formData.append(file, files[file]);
    }
    formData.append("email-address", emailAddress);
    formData.append("has-gams", hasGams);
    formData.append("data-contrib", dataContrib);
    formData.append("date", date.toISOString());
    makeOpen(false);
    props.onSubmit(formData);
  };

  return (
    <div className="ui styled fluid accordion">
      <div className={`${active} title`}>
        <span style={{ lineHeight: "28px" }}>
          <i onClick={() => makeOpen(!isOpen)} className="dropdown icon"></i>
          Upload
        </span>
        <Link
          to="/example"
          onClick={() => makeOpen(false)}
          className="ui mini right floated basic button"
        >
          Load example
        </Link>
      </div>
      <div className={`${active} content`}>
        <form onSubmit={onFormSubmit} className="ui form">
          <div className="field">
            <label>
              Email address&nbsp;
              <span
                data-tooltip="We will send you an email once your results are ready."
                data-variation="mini"
              >
                <i className="info circle icon"></i>
              </span>
            </label>
            <input
              type="text"
              name="email-address"
              placeholder="Email address"
              onChange={(e) => setEmailAddress(e.target.value)}
              value={emailAddress}
            />
          </div>
          <div className="field">
            <label>Malaria Species</label>
            <select className="ui fluid disabled dropdown">
              <option value="falciparum" placeholder="Plasmodium falciparum">
                Plasmodium falciparum
              </option>
            </select>
          </div>
          <div className="field">
            <div className="ui checkbox">
              <input
                type="checkbox"
                checked={hasGams}
                onChange={() => setGams(!hasGams)}
              />
              <label>Contains gametocytes (beta)</label>
            </div>
          </div>
          <div className="field">
            <label>Giemsa stain images</label>
            <input
              type="file"
              onChange={(e) => setFiles(e.target.files)}
              multiple
            />
            <div className="description">.tiff, .jpg, .png accepted</div>
          </div>
          <div className="field">
            <div className="ui checkbox">
              <input
                type="checkbox"
                checked={dataContrib}
                onChange={() => setDataContrib(!dataContrib)}
              />
              <label>
                I'd like to contribute my data to improve this website.
              </label>
            </div>
          </div>
          <button className="ui button" type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Form;
