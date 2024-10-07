import React, { useEffect, useContext } from 'react';
import style from './Home.module.scss';
import Header from '../../components/Header'
import MyTable from '../../components/MyTable'
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from "@mui/material/TextField";
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { ApiContext, DataContext } from "../../context/MyContext";
import { FormLabel } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';




const Home = () => {

    const { privateApiRequest, emitTaskEvent  } = useContext(ApiContext);

    const {
      open,
      setOpen,
      status,
      setStatus,
      title,
      setTitle,
      description,
      setDescription,
      dueDate,
      setDueDate,
      task,
      setTask,
      handleOpen,
      handleClose,
      taskId,
      setTaskId
    } = useContext(DataContext);
    

    const handleChange = (event) => {
        setStatus(event.target.value);
      };

      const insert_update_task = () => {
        if(taskId === 0) {
          addNewTasks();
        } else {
          updateNewtask();
        }
      }

      const addNewTasks = async () => {
        try {
            const response = await privateApiRequest({
              cmd: "tasks/createTasks",
              args: {
                userId: localStorage.getItem('userId'),
                title: title,
                description: description,
                status: status,
                dueDate: dueDate
              },
              method: "POST",
            });
      
           
              emitTaskEvent('taskCreated', response.rsp);
              getTaskDetails();
              handleClose();
           
          } catch (err) {
            console.error("Something went wrong", err);
          }
      }

      const resetData = () => {
        setTitle('');
        setDescription('');
        setDueDate('');
        setTaskId(0);
        handleClose();

      }

      const updateNewtask = async () => {
        try {
            const response = await privateApiRequest({
              cmd: `tasks/updateTasks`,
              args: {
                userId: localStorage.getItem('userId'),
                title: title,
                description: description,
                status: status,
                dueDate: dueDate,
                taskId: taskId
              },
              method: "PUT",
            });
      
            
              emitTaskEvent('taskUpdated', response.rsp);
            
          } catch (err) {
            console.error("Something went wrong", err);
          }
      };


      const getTaskDetails = async () => {
        try {
            const response = await privateApiRequest({
              cmd: "tasks/getTaskDetails",
              args: {
                userId: localStorage.getItem('userId') //Actually we need to pass the userId from contextApi, in the short time i am passing from here.
              },
              method: "GET",
            });
      
            if (response.rsp[0].length !== 0) {
              setTask(response.rsp);
            }
          } catch (err) {
            console.error("Something went wrong", err);
          }
      }

    useEffect(() => {

        getTaskDetails();

    }, []);

  return (
    <div>
          <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style.CreateModal}>
            <Box className={style.form}>
                <Box className={style.formHeadertxt}>
                    <span>Create Tasks</span>
                   <CloseIcon style={{ cursor: "pointer" }} onClick = {resetData}/>
                </Box>
                <Divider />
            <Box className={style.innerForm}>
            <TextField
                id="outlined-basic"
                type="text"
                label="Title"
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                fullWidth
                variant="outlined"
              />
                            <TextField
                id="outlined-basic"
                type="text"
                label="Description"
                maxRows={3}
                multiline
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                fullWidth
                variant="outlined"
              />
               <FormLabel>Status</FormLabel>
                            <Select
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
          value={status}
          label= "Status"
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={0}>Pending</MenuItem>
          <MenuItem value={1}>Completed</MenuItem>
        </Select>
        <FormLabel>Duration</FormLabel>
            <TextField
                id="outlined-basic"
                type="date"
                onChange={(e) => setDueDate(e.target.value)}
                value={dueDate}
                fullWidth
                variant="outlined"
              />
              <Button variant="contained"  onClick={insert_update_task} fullWidth >Create Tasks</Button>
            </Box>
          </Box>
        </Box>
      </Modal>
       <Header />
       <div className={style.taskWrapper}>
            <div className={style.taskListContainer}>
                <div className={style.taskTitle}>
                  <span>My Tasks</span>  
                  <div>
                  <Button variant="contained"  onClick={handleOpen}>Add Tasks</Button>
                  </div>
                </div>
                <div className={style.tableWrapper}>
                    <MyTable />
                </div>
            </div>
       </div>
    </div>
  )
}

export default Home