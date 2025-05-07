import React, { useEffect,useRef, useState } from "react";
import styles from "../../../css/style.module.css"
import axios from "axios";
import { ListGroup } from "react-bootstrap";
import { act } from "react-dom/test-utils";
const TableRowCard = ({ jobId, values,files,summary,activeIndex,cloudImage,setResults,setSummary}) => {
  const [scaleFactor,setScaleFactor] = useState(0);
  const [contextMenu,setContextMenu] = useState({
    position: {
      x : -1,
      y: -1,
    },
    toggled: false,
    text: null,
    cell_index: -1,
    edited_cell : false
  })
  const [requestStatus,setrequestStatus] = useState({
    success: false,
    error : false
  }); 

  //this is a trick to await on state update
  const updateSummaryState = (newstate) => {
    return new Promise((resolve) => {
      setSummary(newstate, () => resolve()); 
    });
  }
 
  const [unsavedChanges,setUnsavedChanges] = useState([]);
  const uploadChanges = () => {
   
    axios.post("api/modify_results", {
      jobID : jobId,
      results : {
        results: values,
        summary: summary
      }

    }).then(res => {
      setrequestStatus({success: true,
                        error: false})
      //to display success icon for 2 seconds
      setTimeout(() => {
        setrequestStatus({success: false,
          error: false})
      },2000)
      setUnsavedChanges([])
    }).catch(err =>{
      setrequestStatus({success: false,
                        error : true})
     
    })
  }
  //function to see if cursor is inside one of the boxes in the image
  const insideBox = (x,y,boxes) => {
    for( var index= 0; index < boxes.length;++index){
      if(x >= boxes[index].b[0]*scaleFactor && x <= boxes[index].b[2]*scaleFactor && y >= boxes[index].b[1]*scaleFactor && y <= boxes[index].b[3]*scaleFactor)  {
        return index
      }        
    }
  }
  //set the context menu to its initial state
  const resetContextMenu = () => {
    setContextMenu({
      position: {
        x : -1,
        y: -1,
      },
      toggled: false,
      text: null,
      cell_index: -1,
      edited_cell : false,
      lifestage: null
    })
  }

  const handleInfectionToggle = (lifestage) => {
    resetContextMenu()
    //logic to first figure out if cell is infected or not then toggle it 

    changeCell("l" in values[activeIndex].boxes[contextMenu.cell_index],contextMenu.cell_index,lifestage)
    trackUnsavedData(contextMenu.cell_index,activeIndex)
  }

  const lifestageModificiation = (uninfected,lifestage,imageIndex,new_lifestage=null) => {
 
    const change = uninfected * 2 - 1
    
    let summaryEdit = { ...summary }
    let resultEdit = values
    if(new_lifestage == null) {
      return lifestageIteration(lifestage,change,imageIndex,resultEdit,summaryEdit)
    }else{
      [resultEdit,summaryEdit] = lifestageIteration(lifestage,change,imageIndex,resultEdit,summaryEdit)
      return lifestageIteration(new_lifestage,-change,imageIndex,resultEdit,summaryEdit)
    }
  }

  const lifestageIteration = (lifestage,change,imageIndex, resultEdit,summaryEdit) => {
    if (lifestage == -1){
      resultEdit[imageIndex].n_gam+=change;
      summaryEdit.n_gam+=change;
    }else if(lifestage<1.5) {
      resultEdit[imageIndex].n_ring+=change;
      summaryEdit.n_ring+=change;
    }else if(lifestage<2.5){
      resultEdit[imageIndex].n_troph+=change;
      summaryEdit.n_troph+=change;
    }else{
      resultEdit[imageIndex].n_schizont+=change;
      summaryEdit.n_schizont+=change;
    }
    
    return [resultEdit,summaryEdit]
  }

  const resultAndSummaryModification = (uninfected,lifestage,imageIndex,cellIndex) => {
    const change = uninfected * 2 - 1
  
    const [resultEdit, summaryEdit] = lifestageModificiation(uninfected,lifestage,imageIndex)
    resultEdit[imageIndex].n_infected+= change;
    summaryEdit.n_infected+=change;

    resultEdit[imageIndex].n_uninfected-= change;
    summaryEdit.n_uninfected-=change;

    resultEdit[imageIndex].parasitemia = (resultEdit[imageIndex].n_infected / resultEdit[imageIndex].n_cells).toFixed(3)
    summaryEdit.parasitemia = (summaryEdit.n_infected / summaryEdit.n_cells).toFixed(3)

    if(!uninfected)  {
      const index = summaryEdit.asex_stages.indexOf(lifestage)
        summaryEdit.asex_stages.splice(index, 1);
        let filtered_boxes = summaryEdit.boxes.filter(function(el) { return (el.image != imageIndex || el.box_index != cellIndex); })
        
        summaryEdit.boxes = filtered_boxes
      
    }else {
        
        summaryEdit.boxes.push({"image": imageIndex, "box_index": cellIndex, "life": lifestage})
        summaryEdit.asex_stages.push(lifestage)
    }
    return [resultEdit,summaryEdit]
  }


  const cellResultAndSummaryModification = (uninfected,lifestage,imageIndex,undo) => {
    const change = undo * 2 - 1
    let resultEdit = values
    let summaryEdit = summary
    if(!uninfected)  {
      [resultEdit,  summaryEdit] = lifestageModificiation(undo,lifestage,imageIndex)
    } 
    
    resultEdit[imageIndex].n_cells += change
    summaryEdit.n_cells += change

    if(uninfected)  {
      resultEdit[imageIndex].n_uninfected += change
      summaryEdit.n_uninfected += change
    }else{
      resultEdit[imageIndex].n_infected += change
      summaryEdit.n_infected += change
    }

    resultEdit[imageIndex].parasitemia = (resultEdit[imageIndex].n_infected / resultEdit[imageIndex].n_cells).toFixed(3)
    summaryEdit.parasitemia = (summaryEdit.n_infected / summaryEdit.n_cells).toFixed(3)

    
    return [resultEdit,summaryEdit]
  }

  const changeCell = async (infected, cellIndex,  lifestage = null,undo = false, notACell=false,imageIndex=activeIndex) => {
    let resultEdit, summaryEdit
    if(infected == true && lifestage != null) {
      //this means that we are editing a cell's lifestage
      [resultEdit,  summaryEdit] = lifestageModificiation(!infected,values[imageIndex].boxes[cellIndex].l,imageIndex,lifestage)
      resultEdit[imageIndex].boxes[cellIndex].old_val = resultEdit[imageIndex].boxes[cellIndex].l
      resultEdit[imageIndex].boxes[cellIndex].l = lifestage
      setSummary(summaryEdit)
      summary = summaryEdit
      setResults([...resultEdit])
      return
    }
    console.log(undo)
    console.log(infected)
    console.log(values[imageIndex].boxes[cellIndex].old_val)
    if(undo == true && infected == true && values[imageIndex].boxes[cellIndex].old_val != 0) {
      //this means that we are editing a cell's lifestage
      let x = lifestageModificiation(!infected,values[imageIndex].boxes[cellIndex].l,imageIndex,values[imageIndex].boxes[cellIndex].old_val)
      resultEdit = x[0]
      summaryEdit = x[1]
      resultEdit[imageIndex].boxes[cellIndex].l = resultEdit[imageIndex].boxes[cellIndex].old_val
      delete resultEdit[imageIndex].boxes[cellIndex].old_val
      setSummary(summaryEdit)
      summary = summaryEdit
      setResults([...resultEdit])
      return
    }

    
    if(notACell)  {
      [resultEdit,  summaryEdit] = cellResultAndSummaryModification(!infected,values[imageIndex].boxes[cellIndex].l,imageIndex,undo)
      if(undo)  {
        delete resultEdit[imageIndex].boxes[cellIndex].nc
        delete resultEdit[imageIndex].boxes[cellIndex].old_val

      }else{
        resultEdit[imageIndex].boxes[cellIndex].nc = true
        resultEdit[imageIndex].boxes[cellIndex].old_val = true
      }
      setSummary(summaryEdit)
      summary = summaryEdit
      setResults([...resultEdit])
      return
    }

    //logic to first figure out if cell is infected or not then toggle it 
    if(infected)  {
      [resultEdit,  summaryEdit] = resultAndSummaryModification(false,values[imageIndex].boxes[cellIndex].l,imageIndex,cellIndex)
      if(undo)  {
        delete resultEdit[imageIndex].boxes[cellIndex].old_val
        
      }else{
        
        resultEdit[imageIndex].boxes[cellIndex].old_val = resultEdit[imageIndex].boxes[cellIndex].l
        
      }
      
      delete resultEdit[imageIndex].boxes[cellIndex].l
  
    }else{
      //cell is uninfected -> set it to infected
      if(undo){
        [resultEdit,  summaryEdit] = resultAndSummaryModification(true,values[imageIndex].boxes[cellIndex].old_val,imageIndex,cellIndex)
        resultEdit[imageIndex].boxes[cellIndex].l = resultEdit[imageIndex].boxes[cellIndex].old_val
        delete resultEdit[imageIndex].boxes[cellIndex].old_val
      
      }else{
        [resultEdit,  summaryEdit] = resultAndSummaryModification(true,lifestage,imageIndex,cellIndex)
        resultEdit[imageIndex].boxes[cellIndex].old_val = 0
        resultEdit[imageIndex].boxes[cellIndex].l = lifestage
        
      }
      
      
      
    }
    setSummary(summaryEdit)
    summary = summaryEdit
    setResults([...resultEdit])
  }

  const trackUnsavedData = (cellIndex,imageIndex) => {
    //a variable to uniquely identify each cell across all images
    const uniqueCellIndex = cellIndex*(values.length)+ imageIndex

   
    if(unsavedChanges.includes(uniqueCellIndex)) {
      
      const deletedChange = unsavedChanges.filter(number => number != uniqueCellIndex)
      setUnsavedChanges(deletedChange)
    }else{
      
      setUnsavedChanges([...unsavedChanges,uniqueCellIndex])
  
    }
  }

  const handleCellToggle = () => {
    resetContextMenu()
    
    changeCell("l" in values[activeIndex].boxes[contextMenu.cell_index],contextMenu.cell_index,null,false,true)
    trackUnsavedData(contextMenu.cell_index,activeIndex)
  }



  const undoChange = () => {
    resetContextMenu()
    changeCell("l" in values[activeIndex].boxes[contextMenu.cell_index],contextMenu.cell_index,null,true,"nc" in values[activeIndex].boxes[contextMenu.cell_index])
    trackUnsavedData(contextMenu.cell_index,activeIndex)
  }

  const undoAllChanges = () => {
    // key = cell_index *(image_num) + image_index
    unsavedChanges.forEach((key) => {
      const cellIndex = Math.floor(key / values.length)
      const imageIndex = key % values.length
      
      changeCell("l" in values[imageIndex].boxes[cellIndex],cellIndex,null,"old_val" in values[imageIndex].boxes[cellIndex],"nc" in values[imageIndex].boxes[cellIndex],imageIndex)
      
    })
    setUnsavedChanges([])
  }
  const handleClick = (e) => {
    // detect a left/right click
    
    const offsetX = Math.round(e.clientX - e.target.getBoundingClientRect().x)
    const offsetY =  Math.round(e.clientY - e.target.getBoundingClientRect().y)
    
    const box = insideBox(offsetX,offsetY,values[activeIndex].boxes)
    if(box == undefined) {
      resetContextMenu()
      return;
    }
    e.preventDefault();

    setContextMenu({
      position: {
        x: offsetX,
        y: offsetY,
      },
      toggled: true,
      infected: "l" in values[activeIndex].boxes[box],
      cell_index: box,
      edited_cell : "old_val" in values[activeIndex].boxes[box],
      lifestage: values[activeIndex].boxes[box].l
    })
    
  };

  const endPoint =
    jobId === "example"
      ? "api/example"
      : `https://storage.googleapis.com/myplasmocount-bucket/${jobId}`;
  // for production: https://storage.googleapis.com/plasmocount-bucket/${jobId}
  const canvasRef = useRef(null)
  const canvasRef1 = useRef(null)
  const divRef = useRef(null)
  useEffect(() => {
    
    const img = new Image()
    img.onload = function() {
    
      const width = divRef.current.offsetWidth
      const scale_factor = width/this.width
      setScaleFactor(scale_factor);
      const other_layer = canvasRef1.current
      other_layer.width = width
      other_layer.height = this.height * scale_factor
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      canvas.width = width;
      canvas.height = this.height * scale_factor;
     
     

      context.drawImage(this, 0,0,context.canvas.width, context.canvas.height)

      context.strokeStyle = 'green'
      values[activeIndex].boxes.forEach(element => {
        if("old_val" in element){
          context.setLineDash([5, 5]);
        }else{
          context.setLineDash([]);
        }
        if(!("l"in element)){
          if("old_val" in element){
            context.strokeStyle = 'rgba(50,50,50,1)';
          }else{
            context.strokeStyle = 'rgba(50,50,50,0.3)';
          }
          
        }else if(element.l==-1) {
          context.strokeStyle = '#ffd92f'
        }else if(element.l<1.5) {
          context.strokeStyle = '#f77189'
        }else if(element.l<2.5){
          context.strokeStyle = '#50b131'
        }else{
          context.strokeStyle = '#3ba3ec'
        }

        if("nc" in element){
          context.fillRect(element.b[0] * scale_factor,element.b[1] * scale_factor,(element.b[2]-element.b[0]) * scale_factor,(element.b[3]-element.b[1]) * scale_factor)
        }else{
        context.strokeRect(element.b[0] * scale_factor,element.b[1] * scale_factor,(element.b[2]-element.b[0]) * scale_factor,(element.b[3]-element.b[1]) * scale_factor)
        }
      });
    }   
    if(!cloudImage)  {

      let file_extension = files[activeIndex].name.split('.').pop()
      if('tiff'.includes(file_extension)){
        img.src = endPoint + "/" + String(activeIndex)
      }else{
        
        img.src = URL.createObjectURL(files[activeIndex]);
      }
    }else{
      img.src = endPoint + "/" + String(activeIndex)
    }
  }, [activeIndex, unsavedChanges])

  useEffect(() => {
    const canvas = canvasRef1.current
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height);
    if(contextMenu.cell_index == -1)  {
      return;
    }

    
    context.strokeStyle = 'rgba(0,0,0,1)';
    const target_box = values[activeIndex].boxes[contextMenu.cell_index]
    context.strokeRect(target_box.b[0] * scaleFactor,target_box.b[1] * scaleFactor,(target_box.b[2]-target_box.b[0]) * scaleFactor,(target_box.b[3]-target_box.b[1]) * scaleFactor)

  }, [contextMenu])
  return (
    <div className={styles.box}>
    <div style={{ display: 'flex',padding:'10px',height: '35px',fontSize: '75%'}}>
      
    Ring &nbsp;<div style={{ backgroundColor: '#f77189',width: '15px',height: '15px',borderRadius:'3px'}}></div>&emsp;&emsp;
    Trophozoite &nbsp;<div style={{ backgroundColor: '#50b131',width: '15px',height: '15px',borderRadius:'3px'}}></div>&emsp;&emsp;
    Schizont &nbsp;<div style={{ backgroundColor: '#3ba3ec',width: '15px',height: '15px',borderRadius:'3px'}}></div>&emsp;&emsp;
    Gametocyte &nbsp;<div style={{ backgroundColor: '#ffd92f',width: '15px',height: '15px',borderRadius:'3px'}}> </div>&emsp;&emsp;
    Uninfected &nbsp;<div style={{ backgroundColor: '#323232',width: '15px',height: '15px',opacity: '0.3',borderRadius:'3px'}}></div>
    
    </div>
    
    <div ref={divRef}  style={{width:"100%", position: "relative", height: (canvasRef.current == null ? 0: canvasRef.current.height)}}>
    <canvas ref={canvasRef}  style={{position: "absolute", top:"0",left:"0", zIndex: "0"}}/>
    <canvas ref={canvasRef1} style={{position: "absolute", top:"0",left:"0", zIndex: "1"}} onClick={handleClick} onContextMenu={handleClick}/>
    {contextMenu.toggled ? <div style={
    {
      position: "absolute",
      display: "flex",
      zIndex: "2",
      flexDirection: "column",
      top: contextMenu.position.y,
      left: Math.min(contextMenu.position.x,divRef.current.offsetWidth -190),
    }
      }>
        {contextMenu.infected ?
        (contextMenu.edited_cell ? <div className={styles.contextmenu}><button className={styles.button} onClick={undoChange}  >Undo Change</button></div>:
        <div className={styles.contextmenu}>
        <button className={styles.button} onClick={() => handleInfectionToggle(null)}  >Mark as Uninfected</button>
        {(contextMenu.lifestage < 0 || contextMenu.lifestage > 1.5) && <button className={styles.button} onClick={() => handleInfectionToggle(1)}  >Mark as Ring</button>}
        {(contextMenu.lifestage <= 1.5 || contextMenu.lifestage > 2.5) && <button className={styles.button} onClick={() => handleInfectionToggle(2)}  >Mark as Trophozoite</button>}
        {(contextMenu.lifestage <= 2.5) && <button className={styles.button} onClick={() => handleInfectionToggle(2.75)}  >Mark as Schizont</button>}
        {(contextMenu.lifestage != -1) && <button className={styles.button} onClick={() => handleInfectionToggle(-1)}  >Mark as Gametocyte</button>}
        <button className={styles.button} onClick={handleCellToggle}  >Not a red blood cell</button>
        </div>):
        (contextMenu.edited_cell ? <div className={styles.contextmenu}><button className={styles.button} onClick={undoChange}  >Undo Change</button></div>:
        <div className={styles.contextmenu}>
        <button className={styles.button} onClick={() => handleInfectionToggle(1)}  >Mark as Ring</button>
        <button className={styles.button} onClick={() => handleInfectionToggle(2)}  >Mark as Trophozoite</button>
        <button className={styles.button} onClick={() => handleInfectionToggle(2.75)}  >Mark as Schizont</button>
        <button className={styles.button} onClick={() => handleInfectionToggle(-1)}  >Mark as Gametocyte</button>
        <button className={styles.button} onClick={handleCellToggle}  >Not a red blood cell</button> 
        
        </div>)}
        
      </div> :<div></div> }
      
    </div>
    
    {unsavedChanges.length ?  <div style={{padding: "6px",textAlign:"right"}}>
          <button className="ui primary button" onClick={uploadChanges}>
            Save
          </button><button className="ui button" onClick={undoAllChanges}>
            Undo
          </button></div>: <div></div>}
    {requestStatus.success ? <div style={{padding: "6px",textAlign:"right"}}><div style={{fontSize: 14}}className="ui green label">Success &ensp;<i class="check circle icon"></i></div></div> : <div></div>}
    {requestStatus.error ? <div style={{padding: "6px",textAlign:"right"}}><div style={{fontSize: 14}}className="ui red label">Error &ensp;<i class="exclamation circle icon"></i></div></div> : <div></div>}
    </div>

 );
};

export default TableRowCard;