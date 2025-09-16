import { Box, Typography, useTheme, CircularProgress, Chip } from "@mui/material";
import { Header } from "../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { fetchDispenseHistoryForMachineId } from "../../store/dispenseSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const DispenseHistory = () => {
  const { id } = useParams();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const { machineDispenseDetails, loading, error } = useSelector((state) => state.dispense);
  const token = localStorage.getItem('authToken');
  

  
  useEffect(() => {
    if (token) {
      dispatch(fetchDispenseHistoryForMachineId({ machineId: id, token }));  // Passing an object with machineId and token
    }
  }, [dispatch, token, id]);

  const columns = [
    { field: "id", headerName: "Dispense ID" },
    {
      field: "machineId",
      headerName: "Machine ID",
      flex: 1,
    },
    {
      field: "createdAt",
      headerName: "Date",
      flex: 1,
    },
    {
      field: "itemsDispensed",
      headerName: "Items Dispensed",
      flex: 1,
      renderCell: (params) => (
        <Typography color={params.value === null ? "gray" : undefined}>
        {params.value === null ? "Refilling" : params.value}
      </Typography>
      ),
    },
    {
      field: "stock",
      headerName: "Remaining Stock",
      flex: 1,
    },
    {
      field: "eventType",
      headerName: "Event Type",
      flex: 1,
      renderCell: (params) => (
        <Chip 
          label={params.value === "1" ? "Dispense" : "Refill"} 
          color={params.value === "1" ? "success" : "warning"} 
        />
      ),
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit', 
      hour12: false,
    };
    return date.toLocaleString('en-US', options);
  };

  const rows = [...machineDispenseDetails] // Create a shallow copy of the array
  .filter((item) => item.machineId === id)
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by date in descending order
  .map((item) => ({
    ...item,
    id: item.id,
    createdAt: formatDate(item.createdAt),
    eventType: item.event_type, // Add the event type here for easier labeling
  }));


  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <Box m="20px">
      <Header
        title="Dispense History"
        subtitle={`List of Dispense History for Machine ID: ${id}`}
      />
      <Box
        mt="40px"
        height="75vh"
        maxWidth="100%"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            border: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.greenAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.greenAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-iconSeparator": {
            color: colors.primary[100],
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.gray[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          localeText={{
            noRowsLabel: 'Dispense History is not present',
          }}
        />
      </Box>
    </Box>
  );
};

export default DispenseHistory;
