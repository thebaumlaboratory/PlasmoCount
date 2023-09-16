import React, { useEffect,useRef } from "react";

const TableRowCard = ({ jobId, values,files,activeIndex,cloudImageNum }) => {
  const endPoint =
    jobId === "example"
      ? "api/example"
      : `https://storage.googleapis.com/plasmocount-bucket/${jobId}`;
  // for production: https://storage.googleapis.com/plasmocount-bucket/${jobId}
  const canvasRef = useRef(null)
  const divRef = useRef(null)
  useEffect(() => {
    
    const img = new Image()
    img.onload = function() {
    
      const width = divRef.current.offsetWidth
      const scale_factor = width/this.width
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      canvas.width = width;
      canvas.height = this.height * scale_factor;
      console.log(values[activeIndex].boxes)
     

      context.drawImage(this, 0,0,context.canvas.width, context.canvas.height)

      context.strokeStyle = 'green'
      values[activeIndex].boxes.forEach(element => {
        if(element.l<1.5) {
          context.strokeStyle = '#f77189'
        }else if(element.l<2.5){
          context.strokeStyle = '#50b131'
        }else{
          context.strokeStyle = '#3ba3ec'
        }
        context.strokeRect(element.b[0] * scale_factor,element.b[1] * scale_factor,(element.b[2]-element.b[0]) * scale_factor,(element.b[3]-element.b[1]) * scale_factor)
      });
    }
    console.log(activeIndex)
    if(cloudImageNum == 0)  {
      img.src = URL.createObjectURL(files[activeIndex]);
    }else{
      img.src = 'https://storage.googleapis.com/plasmocount-bucket/' + String(jobId) + "/" + String(activeIndex)
    }
  }, [activeIndex])
  return (
    <div ref={divRef} style={{width:"100%"}}>
    <canvas ref={canvasRef} />
    </div>
 );
};

export default TableRowCard;