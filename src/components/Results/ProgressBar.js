import axios from "axios";
import React, { useEffect, useState } from "react";
import { Progress } from "semantic-ui-react";
const ProgressBar = ({ active,jobId }) => {
    const [current,setCurrent] = useState(0);
    const [total,setTotal] = useState(0);
    const [labelText,setLabelText] = useState("Uploading Files")
    useEffect(() => {
        if(active == true)  {
            const interval = setInterval(() => {
                axios.get("/api/get_request_progress",{
                    params: {
                      "ID": jobId
                    }
                  }).then((res) => {
                    if(res.data != "0") {
                        setCurrent( parseInt(res.data.current))
                        setTotal(parseInt(res.data.total))
                        
                        if(res.data.current == res.data.total)  {
                            setLabelText("Finishing up!")
                            clearInterval(interval);
                        }else{
                            setLabelText("Processing "+res.data.current+" out of "+res.data.total+" images")
                        }
                    }
                  })
            }, 5000);
        }
    },[active])
    if(active)  {
        return <Progress percent={current/total*100}>{labelText}</Progress>;
    }else{
        return null
    }
};

export default ProgressBar;

