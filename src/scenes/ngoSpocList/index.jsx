// src/scenes/team/NgoSpocList.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { WarningAmber, DeleteOutlined,EditOutlined } from "@mui/icons-material";
import { tokens } from "../../theme";
import { useTheme } from "@mui/material/styles";
import { Header } from "../../components";
import {
  fetchNgoSpoc,
  deleteNgoSpoc,
} from "../../store/ngoSpocSlice";
import { showNotification } from "../../store/notificationSlice";
import NotificationModal from "../notificationModal";
import { useNavigate } from "react-router-dom";
const NgoSpocList = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  const { ngoSpocNames = [], loadingNgoSpocNames } = useSelector(
    (state) => state.ngoSpoc || {}
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState(null);
  const [selectedSpocName, setSelectedSpocName] = useState("");

  useEffect(() => {
    if (token) {
      dispatch(fetchNgoSpoc(token));
    }
  }, [dispatch, token]);

  const confirmDelete = (id, name) => {
    setSelectedIdToDelete(id);
    setSelectedSpocName(name);
    setOpenDialog(true);
  };

  const handleDeleteConfirmed = () => {
    if (selectedIdToDelete) {
      dispatch(deleteNgoSpoc(selectedIdToDelete))
        .unwrap()
        .then(() => {
          dispatch(
            showNotification({
              message: "Spoc deleted successfully!",
              type: "success",
            })
          );
          dispatch(fetchNgoSpoc(token));
        })
        .catch(() => {
          dispatch(
            showNotification({
              message: "Error deleting Spoc.",
              type: "error",
            })
          );
        })
        .finally(() => {
          setOpenDialog(false);
          setSelectedIdToDelete(null);
        });
    }
  };

  const spocTypeLabels = {
    ngoSpoc: "Ngo Spoc",
    ngoCoordinator: "NGO Coordinator",
    schoolSpoc: "School Spoc",
  };

  const columns = [
    { field: "spocName", headerName: "Spoc Name", flex: 1 },
    {
      field: "spocType",
      headerName: "Spoc Type",
      flex: 1,
      valueGetter: (params) => spocTypeLabels[params.value] || params.value,
    },
    { field: "spocMobileNo", headerName: "Phone Number", flex: 1 },
    {
      field: "edit",
      headerName: "",
      filterable: false,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={() =>
            navigate(`/edit-spoc/${params.id}`, {
              state: { ngoSpocNames: params.row },
            })
          }
        >
          <EditOutlined />
        </IconButton>
      ),
    },
    {
      field: "delete",
      headerName: "",
      filterable: false,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Remove Spoc">
          <IconButton
            onClick={() => confirmDelete(params.row.id, params.row.spocName)}
          >
            <DeleteOutlined />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const rows = Array.isArray(ngoSpocNames)
    ? ngoSpocNames.map((ngo, index) => ({
        id: ngo.id || `temp-id-${index}`,
        spocName: ngo.spocName,
        spocType: ngo.spocType,
        spocMobileNo: ngo.spocMobileNo,
      }))
    : [];

  return (
    <Box m="20px">
       <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb="20px"
          flexWrap="wrap"
        >
          <Header title="SPOC LIST" subtitle="List of Registered Spocs" />
          <Button
            color="secondary"
            variant="contained"
            onClick={() => navigate(`/ngo`)}
          >
            Add New Spoc
          </Button>
        </Box>
      
      <NotificationModal />
      <Box
        mt="40px"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { border: "none" },
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
        {loadingNgoSpocNames ? (
          <CircularProgress />
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            components={{ Toolbar: GridToolbar }}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            getRowId={(row) => row.id}
          />
        )}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          <Typography variant="h6" color="warning.main" align="center">
            Confirm Deletion
          </Typography>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <WarningAmber color="warning" sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="body1" align="center">
            Are you sure you want to delete the Spoc:{" "}
            <strong>{selectedSpocName}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            color="primary"
            variant="contained"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirmed}
            color="secondary"
            variant="contained"
          >
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NgoSpocList;
