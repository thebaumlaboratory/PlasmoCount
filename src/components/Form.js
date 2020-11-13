import "./Form.css";
import React, { useState } from "react";

const Form = (props) => {
  const [files, setFiles] = useState(null);
  const [isOpen, makeOpen] = useState(true);
  const active = isOpen ? "active" : "";

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (!files) {
      return;
    }
    let formData = new FormData();
    for (const file in files) {
      formData.append(file, files[file]);
    }
    makeOpen(false);
    props.onSubmit(formData);
  };

  const onLoadExample = () => {
    makeOpen(false);
    props.loadExample();
  };

  return (
    <div className="ui styled fluid accordion">
      <div className={`${active} title`}>
        <span style={{ lineHeight: "28px" }}>
          <i onClick={() => makeOpen(!isOpen)} className="dropdown icon"></i>
          Upload
        </span>
        <button
          onClick={() => onLoadExample()}
          className="ui mini right floated basic button"
        >
          Load example
        </button>
      </div>
      <div className={`${active} content`}>
        <form onSubmit={onFormSubmit} className="ui form">
          <div className="field">
            <label>Email address</label>
            <input
              type="text"
              name="email-address"
              placeholder="Email address"
            />
          </div>
          <div className="field">
            <label>Malaria Species</label>
            <select className="ui fluid dropdown">
              <option value="falciparum">Plasmodium falciparum</option>
            </select>
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
            <label>Metadata (optional)</label>
            <input type="file" />
            <div className="description">.csv, .xls(x) accepted</div>
          </div>
          <div className="field">
            <div className="ui checkbox">
              <input type="checkbox" />
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
