import React, { useState, useEffect } from "react";
import ResultsContent from "./ResultsContent";


import axios from "axios";
import ProgressBar from "./ProgressBar";

const Results = (props) => {
  const jobId = props.match.params.id;
  const [cloudImage, setCloudImage] = useState(false)
  useEffect(()=>{
    props.setFormHidden(true)
    
    if(!props.fromForm){
      props.setRequestState("before_first_results")
      console.log("hi")
      //this means that the client has not submitted the form so their data is most likely stored
      axios.get("/api/get_stored_data",{
        params: {
          "ID": jobId
        }
      }).then((res)=> {
        
        props.setResults(res.data.results)
        props.setSummary(res.data.summary)
        setCloudImage(true)
        props.setRequestState('completed')
       
        
      }).catch(err => {
        console.log(err)
        props.setRequestState('before_request')
      })

    }
},[props.fromForm])
  
      return (
        <div>
          <ProgressBar active={props.fromForm} requestState={props.requestState} jobId={jobId} errorMessage={props.errorMessage}  />
          <ResultsContent jobId={jobId} values={props.results} files={props.files} summary={props.summary} cloudImage={cloudImage} requestState={props.requestState} setResults= {props.setResults} setSummary={props.setSummary}/>
        </div>
      )

 
};

export default Results;