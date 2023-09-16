import React, { useEffect, useState, useRef } from "react";
const ImageBar = ({files,summary_boxes,file_boxes, ind,jobId,cloudImageNum}) => {
    const canvasRef = useRef(null)
    const results_per_row = 8
    useEffect(()=> {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        canvas.width = Math.min(ind.length * 45,results_per_row*45);
        canvas.height = 80 + Math.floor(ind.length/results_per_row) * 80;
        
        const images = ind.map((i,index) => {
  
            let active_image = summary_boxes[i].image
            let bounding_box = file_boxes[summary_boxes[i].image][summary_boxes[i].box_index].b
            console.log(bounding_box)
            
            const img = new Image()
            img.onload = function() {
                context.drawImage(this,bounding_box[0],bounding_box[1],bounding_box[2]-bounding_box[0],bounding_box[3]-bounding_box[1],45*(index % results_per_row),80*Math.floor(index/results_per_row),40,40*(bounding_box[3]-bounding_box[1])/(bounding_box[2]-bounding_box[0]))
            }
            if(cloudImageNum == 0)  {
              img.src = URL.createObjectURL(files[active_image])
            }else{
              img.src = 'https://storage.googleapis.com/plasmocount-bucket/' + String(jobId) + "/" + String(active_image)
            }
          });
    },[ind])
    
  
  
    return (
      <div className="ui center aligned grid">
        <canvas ref={canvasRef} ></canvas>
      </div>
    );
  };
  export default ImageBar;