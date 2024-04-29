import axios from "axios";
import React, { useEffect, useState } from "react";
import { Progress } from "semantic-ui-react";
import Loader from "./Loader";
const ProgressBar = ({ active,jobId, errorMessage}) => {
    const [current,setCurrent] = useState(0);
    const [total,setTotal] = useState(2);
    const [labelText,setLabelText] = useState("Uploading Files")
    let interval = null
    useEffect(() => {
    
        if(errorMessage) {
            
            if(interval != null)    {
                
                clearInterval(interval);
            }
        }
    },[errorMessage])
    useEffect(() => {
        if(active == true && interval == null)  {
            interval = setInterval(() => {
                axios.get("/api/get_request_progress",{
                    params: {
                      "ID": jobId
                    }
                  }).then((res) => {
                    if(res.data != "0") {
                        let current_and_total = res.data.split(',')
                        setCurrent( parseInt(current_and_total[0]))
                        setTotal(parseInt(current_and_total[1]))
                       
                        if(parseInt(current_and_total[0]) +1 >= parseInt(current_and_total[1]))  {
                            setLabelText("Finishing up!")
                            clearInterval(interval);
                            interval = null
                        }else{
                            setLabelText("Processing "+current_and_total[0]+" out of "+current_and_total[1]+" images")
                        }
                    }else{
                        
                    }
                  }).catch((err) => {
                    clearInterval(interval);
                    interval = null
                  })
            }, 2000);
        }else{
            if(interval != null)    {
                clearInterval(interval);
                interval = null
            }
        }
    },[active])
    if(active && errorMessage == null)  {
        return <div><Progress percent={current/total*100}>{labelText}</Progress><Loader text="Fetching results..." /></div>;
    }else{
        return null
    }
};

export default ProgressBar;

