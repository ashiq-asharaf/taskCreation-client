import React, { useState } from 'react';
import { DataContext } from './MyContext';

const DataProvider = (props) => {

    const [email, setEmail] = useState("");
    const [password, setpassword] = useState("");
    const [name, setName] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");



    const [task, setTask] = useState([]);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(0);
    const[title, setTitle] = useState('');
    const[description, setDescription] = useState('');
    const[dueDate, setDueDate] = useState('');
    const [taskId, setTaskId] = useState(0);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);


    const contextValue = {
      email,
      setEmail,
      password,
      setpassword,
      name,
      setName,
      isSignUp,
      setIsSignUp,
      snackbarOpen,
      setSnackbarOpen,
      snackbarMessage,
      setSnackbarMessage,
      task,
      setTask,
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
      handleOpen,
      handleClose,
      taskId,
      setTaskId
    };

    return (
        <DataContext.Provider value={contextValue}>{props.children}</DataContext.Provider>
    )

}

export default DataProvider;