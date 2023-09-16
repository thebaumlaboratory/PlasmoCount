import React, { useState, useEffect } from "react";
import ResultsContent from "./ResultsContent";
import Loader from "./Loader";

import axios from "axios";
import ProgressBar from "./ProgressBar";

const Results = (props) => {
  const jobId = props.match.params.id;
  const [cloudImageNum, setCloudImageNum] = useState(0)
  useEffect(()=>{
    props.setFormHidden(true)
    setCloudImageNum(0)
    if(!props.fromForm){
      props.setLoading(true)
      console.log("hi")
      //this means that the client has not submitted the form so there data is most likely stored
      axios.get("/api/get_stored_data",{
        params: {
          "ID": jobId
        }
      }).then((res)=> {
        props.setResults(res.data.results)
        props.setSummary(res.data.summary)
        setCloudImageNum(res.data.image_num)
        props.setLoading(false)
       
        
      }).catch(err => {
        console.log(err)
        props.setLoading(false)
        props.setError(true)
      })

    }
},[props.fromForm])

 

  return (
    <div>
      {props.Loading ? (
        <div>
        <ProgressBar active={props.fromForm} jobId={jobId} />
        <Loader text="Fetching results..." />
        
        </div>
      ) : (
        <ResultsContent jobId={jobId} values={props.results} files={props.files} summary={props.summary} cloudImageNum={cloudImageNum} />
      )}
    </div>
  );
};

export default Results;