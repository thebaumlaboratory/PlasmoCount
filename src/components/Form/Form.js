import "./Form.css";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageHeader, Message } from 'semantic-ui-react'

import { v4 as uuidv4 } from "uuid";

const Form = (props) => {
  const [emailAddress, setEmailAddress] = useState("");
  const [hasGams, setGams] = useState(false);
  const [dataContrib, setDataContrib] = useState(true);
  
  const active = !props.hideForm ? "active" : "";
  
  const populateForm = async (e, jobId) => {
    e.preventDefault();
    if (!props.files) {
      return;
    }
    
    // Google cloud only allows a maximum of 32MB upload so we will do it in batches 
    // The size threshold is slightly lower for leniency
    
    let image_index = 0;
    const batch_size = 5;
    let forms = []
    while(image_index < props.files.length){

      let formData = new FormData();
      
      
      
      let batch_index = 0;
      let size_threshold = 30 * 1024 * 1024;
      console.log(props.files[image_index])
      while(image_index < props.files.length && batch_index < batch_size && size_threshold - props.files[image_index].size > 0) {
          
          size_threshold -= props.files[image_index].size;
          formData.append(String(image_index),props.files[image_index],props.files[image_index].name);
          batch_index += 1;
          image_index += 1;
      }

      if(image_index >= props.files.length){
        const timestamp = Date.now();
        const date = new Date(timestamp);
        formData.append("last-request",true);
        formData.append("email-address", emailAddress);
        formData.append("data-contrib", dataContrib);
        formData.append("date", date.toISOString());
      }else {
        formData.append("last-request",false);
      }

      formData.append("num-files", props.files.length);
      formData.append("id", jobId);
      formData.append("has-gams", hasGams);
      forms.push(formData)
    }  
   
    return forms;
  };

  const onFormSubmit = async (e) => {
    if (!props.files) {
      return;
    }
    props.setFromForm(true)
    const jobId = uuidv4();
    props.setActive(jobId);
    populateForm(e, jobId).then(formData => props.onSubmit(formData));
  };

  return (
    <div className="ui styled fluid accordion">
      <div className={`${active} title`}>
        <span style={{ lineHeight: "28px" }}>
          <i onClick={() => props.setFormHidden(!props.hideForm)} className="dropdown icon"></i>
          Upload
        </span>
        <Link
          to="/example"
          onClick={() => props.setFormHidden(true)}
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
              onChange={(e) => props.setFiles(e.target.files)}
              multiple
            />
            <div className="description">.jpg or .png recommended, .tiff causes delays</div>
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
      {props.errorMessage && <Message negative>
    <MessageHeader><i class="exclamation triangle icon"></i> Error</MessageHeader>
    {props.errorMessage}
  </Message>}
    </div>
  );
};

export default Form;
