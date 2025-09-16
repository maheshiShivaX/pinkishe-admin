import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from "@mui/x-data-grid";

import { Header } from "../../components";
import { useDispatch, useSelector } from "react-redux";
import { fetchSchoolData, deleteSchoolData } from "../../store/schoolSlice";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import {
  EditOutlined,
  DeleteOutlined,
  WarningAmber,
} from "@mui/icons-material";
import NotificationModal from "../notificationModal";
import { showNotification } from "../../store/notificationSlice";

const SchoolList = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);

  const {
    data: schoolData = [],
    loading,
    error,
  } = useSelector((state) => state.school);

  const [filterModel, setFilterModel] = useState({
    items: [],
    logicOperator: "and",
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [selectedSchoolName, setSelectedSchoolName] = useState("");

  useEffect(() => {
    dispatch(fetchSchoolData());
  }, [dispatch]);

  const confirmDelete = (id, name) => {
    setSelectedSchoolId(id);
    setSelectedSchoolName(name);
    setOpenDialog(true);
  };

  const handleDeleteConfirmed = () => {
    if (selectedSchoolId) {
      dispatch(deleteSchoolData(selectedSchoolId))
        .unwrap()
        .then(() => {
          dispatch(
            showNotification({
              message: "School deleted successfully!",
              type: "success",
            })
          );
          dispatch(fetchSchoolData());
        })
        .catch((errorMsg) => {
          dispatch(
            showNotification({
              message: errorMsg || "Failed to delete school.",
              type: "error",
            })
          );
        })
        .finally(() => {
          setOpenDialog(false);
          setSelectedSchoolId(null);
        });
    }
  };

  const CustomToolbar = ({ filterModel }) => {
    const getFilenameFromFilters = () => {
      if (!filterModel?.items?.length) return "SchoolsData";

      const filters = filterModel.items
        .filter((item) => item.value)
        .map((item) => `${item.field}-${item.value}`)
        .join("_");

      const today = new Date().toISOString().split("T")[0];
      return `School_${filters}_${today}`.replace(/[^a-zA-Z0-9-_]/g, "_");
    };

    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport
          csvOptions={{
            fileName: getFilenameFromFilters(),
            utf8WithBom: true,
          }}
        />
      </GridToolbarContainer>
    );
  };

  const columns = [
    { field: "schoolName", headerName: "School Name", flex: 2 },
    { field: "schoolAddress", headerName: "Address", flex: 1 },
    { field: "schoolBlock", headerName: "Block", flex: 1 },
    { field: "schoolDistrict", headerName: "District", flex: 1 },
    { field: "state", headerName: "State", flex: 1 },
    { field: "pinCode", headerName: "Pin Code", flex: 1 },
    { field: "geoLocation", headerName: "Geo Location", flex: 1 },
    { field: "numberOfGirls", headerName: "Number of Girls", flex: 1 },
    { field: "schoolSpocName", headerName: "School SPOC", flex: 1 },
    { field: "ngoSpocName", headerName: "NGO SPOC 1", flex: 1 },
    { field: "ngoSpocName2", headerName: "NGO SPOC 2", flex: 1 },
    { field: "ngoCoordinatorName", headerName: "NGO Coordinator", flex: 1 },
    {
      field: "edit",
      headerName: "",
      filterable: false,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={() =>
            navigate(`/edit-school/${params.id}`, {
              state: { schoolData: params.row },
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
        <IconButton
          onClick={() => confirmDelete(params.id, params.row.schoolName)}
        >
          <DeleteOutlined />
        </IconButton>
      ),
    },
  ];

  const rows = Array.isArray(schoolData)
    ? schoolData.map((school) => ({
        ...school,
        id: school.schoolId,
      }))
    : [];

  return (
    <Box m="20px">
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb="20px"
          flexWrap="wrap"
        >
          <Header title="SCHOOL LIST" subtitle="List of Schools" />
          <Button
            color="secondary"
            variant="contained"
            onClick={() => navigate(`/registerSchool`)}
          >
            Add New School
          </Button>
        </Box>

        <NotificationModal />

        <Box
          mt="40px"
          height="75vh"
          maxWidth="100%"
          sx={{
            width: `${columns.length * 200}px`,
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
          {loading ? (
            <CircularProgress />
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              components={{ Toolbar: CustomToolbar }}
              componentsProps={{ toolbar: { filterModel } }}
              filterModel={filterModel}
              onFilterModelChange={(model) => setFilterModel(model)}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
            />
          )}
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
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
          <WarningAmber
            color="warning"
            sx={{ fontSize: 50, marginBottom: theme.spacing(2) }}
          />
          <DialogContentText align="center">
            Are you sure you want to delete the school:{" "}
            <strong>{selectedSchoolName}</strong>? This action cannot be undone.
          </DialogContentText>
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
            autoFocus
          >
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchoolList;
