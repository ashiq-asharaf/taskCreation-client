import React, { useContext } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { makeStyles } from '@mui/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ApiContext, DataContext } from '../context/MyContext';
import { Update } from '@mui/icons-material';


const initialRows = [
  { id: 1, title: 'Task 1', description: 'Description 1', due_time: '2024-10-01' },
  { id: 2, title: 'Task 2', description: 'Description 2', due_time: '2024-10-02' },
  { id: 3, title: 'Task 3', description: 'Description 3', due_time: '2024-10-03' },
  { id: 4, title: 'Task 4', description: 'Description 4', due_time: '2024-10-04' },
  { id: 5, title: 'Task 5', description: 'Description 5', due_time: '2024-10-05' },
  { id: 6, title: 'Task 6', description: 'Description 6', due_time: '2024-10-06' },
  { id: 7, title: 'Task 7', description: 'Description 7', due_time: '2024-10-07' },
  { id: 8, title: 'Task 8', description: 'Description 8', due_time: '2024-10-08' },
  { id: 9, title: 'Task 9', description: 'Description 9', due_time: '2024-10-09' },
  { id: 10, title: 'Task 10', description: 'Description 10', due_time: '2024-10-10' },
  { id: 11, title: 'Task 11', description: 'Description 11', due_time: '2024-10-11' },
];

const useStyles = makeStyles({
  root: {
    width: '100%',
    '& .header-class': {
      backgroundColor: '#3f51b5',
      color: '#fff',
      fontWeight: 'bold',
    },
    animation: 'fadeIn 0.5s',
  },
  dataGrid: {
    width: '100%',
    '@media (min-width: 600px) and (max-width: 768px)': {
      height: '400px',
      '& .MuiDataGrid-columnHeader': {
        fontSize: '0.8rem',
      },
    },
  },
  '@keyframes fadeIn': {
    '0%': { opacity: 0 },
    '100%': { opacity: 1 },
  },
  stripedRow: {
    backgroundColor: '#f5f5f5',
  },
});

const DataTable = () => {
  const classes = useStyles();

  const { privateApiRequest, emitTaskEvent } = useContext(ApiContext);

  const {
    handleOpen,
    task,
    taskId,
    setTitle,
    setDescription,
    setDueDate,
    setTaskId,
    setStatus
  } = useContext(DataContext);

  const deleteTask = async () => {
    try {
        const response = await privateApiRequest({
          cmd: `tasks/deleteTask`,
          args: {
            userId: localStorage.getItem('userId'),
            taskId: taskId,
          },
          method: "DELETE",
        });
  
        
          emitTaskEvent('taskDeleted', response.rsp);
        
      } catch (err) {
        console.error("Something went wrong", err);
      }
  };

  const deleteTaskDetails = (params) => {
    const selectedTask = params.row;

    setTaskId(selectedTask.id);
    deleteTask();
  }

  const getIndividualTaskDetails = async (params) => {
    
    console.log(params.row, "onClick")
    const selectedTask = params.row;
    setTitle(selectedTask.title);
    setDescription(selectedTask.description);
    setDueDate(selectedTask.due_date);
    setTaskId(selectedTask.id);
    setStatus(selectedTask.status)
    handleOpen();
  }

  const columns = [
    {
      field: 'sl_no',
      headerName: 'Sl No',
      width: 100,
      headerClassName: 'header-class',
      filterable: false, 
      sortable: false, 
      headerAlign: 'center',
      renderCell: (params) => (
        <div style={{ textAlign: 'center' }}>
          {params.row.id}
        </div>
      ),
    },
    { 
      field: 'title', 
      headerName: 'Title', 
      flex: 1,
      headerClassName: 'header-class',
      headerAlign: 'center', 
      renderCell: (params) => (
        <div style={{ textAlign: 'center' }}>{params.value}</div>
      ),
    },
    { 
      field: 'description', 
      headerName: 'Description', 
      flex: 1,
      headerClassName: 'header-class',
      headerAlign: 'center', 
      renderCell: (params) => (
        <div style={{ textAlign: 'center' }}>{params.value}</div>
      ),
    },
    {
      field: 'due_date',
      headerName: 'Due Date',
      flex: 1,
      headerClassName: 'header-class',
      headerAlign: 'center', 
      renderCell: (params) => (
        <div style={{ textAlign: 'center' }}>{params.value}</div>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      headerClassName: 'header-class',
      headerAlign: 'center', 
      width: 150,
      renderCell: (params) => {
        return (
          <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', height: '100%' }}>
              <EditIcon  
              onClick={() => getIndividualTaskDetails(params)}
              style={{ 
                border: 'none', 
                background: 'none', 
                cursor: 'pointer', 
                transition: 'transform 0.2s, color 0.2s' 
              }}
              />
    
              <DeleteIcon   
              onClick={() => deleteTaskDetails()}
              style={{ 
                border: 'none', 
                background: 'none', 
                cursor: 'pointer', 
                transition: 'transform 0.2s, color 0.2s' 
              }}
               />
          </div>
        );
      },
    },
  ];

  const getRowClassName = (params) => {
    return params.indexRelativeToCurrentPage % 2 === 0 ? classes.stripedRow : '';
  };

  return (
    <div className={classes.root}>
      <DataGrid
        className={classes.dataGrid}
        rows={task}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pagination
        autoHeight
        disableSelectionOnClick
        getRowClassName={getRowClassName}
      />
    </div>
  );
};

export default DataTable;
