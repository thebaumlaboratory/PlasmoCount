import axios from "axios";
import React, { useEffect, useState } from "react";
import { Progress } from "semantic-ui-react";
import Loader from "./Loader";
const ProgressBar = ({ active,requestState,jobId, errorMessage}) => {
    const [current,setCurrent] = useState(0);
    const [total,setTotal] = useState(2);
    const [labelText,setLabelText] = useState("Uploading images (please do not refresh)")
    const [progInterval,setProgInterval] = useState(null)

    

    const reset_progress = (progressInterval) => {
        clearInterval(progressInterval);
        setCurrent(0);
        setTotal(2);
        setLabelText("Uploading images (please do not refresh)");
        progressInterval= null
    }
    useEffect(()=> {
        console.log('1')
        if(errorMessage != null)    {
            clearInterval(progInterval);
        }
    },[errorMessage])

    useEffect(() => {
        if(requestState == "before_first_results")  {
            let progressInterval = setInterval(() => {
                axios.get("/api/get_request_progress",{
                    params: {
                      "ID": jobId
                    }
                  }).then((res) => {
                    if(res.data == 'finish')    {
                        reset_progress(progressInterval)
                        return
                    }
                    if(res.data != "0") {
                        let current_and_total = res.data.split(',')
                        setCurrent( parseInt(current_and_total[0]))
                        setTotal(parseInt(current_and_total[1]))
                       
                        if(parseInt(current_and_total[0]) +1 >= parseInt(current_and_total[1]))  {
                            setLabelText("Finishing up!")
                        }else{
                            setLabelText("Processing "+current_and_total[0]+" out of "+current_and_total[1]+" images (please do not refresh)")
                        }
                    }
                  }).catch((err) => {
                    reset_progress(progressInterval)
                  })
            }, 2000);
            setProgInterval(progressInterval)
        }
    },[requestState])
    if(active && errorMessage == null && (requestState != 'completed' && requestState != 'before_request'))  {
        return <div><Progress percent={current/total*100}>{labelText}</Progress><Loader text="Fetching results..." /></div>;
    }else{
        return null
    }
};

export default ProgressBar;

