import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  useMediaQuery,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from "@mui/x-data-grid";

import { tokens } from "../../theme";
import { Header } from "../../components";
import { Formik } from "formik";
import * as yup from "yup";
import { fetchVendingMachines } from "../../store/getVendingMachineSlice";
import { fetchSchoolData } from "../../store/schoolSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  addAllocationMaster,
  deleteAllocationMaster,
} from "../../store/allocationMasterSlice";
import { showNotification } from "../../store/notificationSlice";
import { DataGrid } from "@mui/x-data-grid";
import {
  EditOutlined,
  DeleteOutlined,
  WarningAmber,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import NotificationModal from "../notificationModal";

const initialValues = {
  schoolId: "",
  machineId: "",
};

const checkoutSchema = yup.object().shape({
  schoolId: yup.string().required("School ID is required"),
  machineId: yup.string().required("Machine ID is required"),
});

const AllocationForm = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { vendingMachines = [], loadingVendingMachines } = useSelector(
    (state) => state.getVendingMachine || {}
  );
  const { data: schoolData = [], loading } = useSelector(
    (state) => state.school
  );

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (token) {
      dispatch(fetchVendingMachines(token));
    }
    dispatch(fetchSchoolData());
  }, [dispatch, token]);

  const filteredMachines = (vendingMachines || []).filter(
    (machine) => machine.schoolId === null && machine.status === "inStore"
  );

  const filteredSchools = (schoolData || []).filter(
    (school) => school.machineId === null
  );

  const isNonMobile = useMediaQuery("(min-width:600px)");

  // --- NEW: Dialog state ---
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState(null);
  const [selectedMachineId, setSelectedMachineId] = useState("");

  // --- NEW: Confirm Delete ---
  const confirmDelete = (id, machineId) => {
    setSelectedIdToDelete(id);
    setSelectedMachineId(machineId);
    setOpenDialog(true);
  };

  const handleDeleteConfirmed = () => {
    if (selectedIdToDelete) {
      dispatch(deleteAllocationMaster(selectedIdToDelete))
        .unwrap()
        .then(() => {
          dispatch(
            showNotification({
              message: "Allocation successfully removed.",
              type: "success",
            })
          );
          dispatch(fetchSchoolData());
          dispatch(fetchVendingMachines(token));
        })
        .catch((error) => {
          console.error("Error deleting:", error);
          dispatch(
            showNotification({
              message: "Failed to delete the Allocated Machine",
              type: "error",
            })
          );
        })
        .finally(() => {
          setOpenDialog(false);
          setSelectedIdToDelete(null);
          setSelectedMachineId("");
        });
    }
  };

  const handleFormSubmit = (values, actions) => {
    dispatch(addAllocationMaster(values))
      .unwrap()
      .then(() => {
        dispatch(
          showNotification({
            message: `Vending Machine: ${values.machineId} is now allocated`,
            type: "success",
          })
        );
        dispatch(fetchSchoolData());
        dispatch(fetchVendingMachines(token));
        actions.resetForm({ values: initialValues });
      })
      .catch((error) => {
        dispatch(
          showNotification({
            message: "Error updating Vending Machine.",
            type: "error",
          })
        );
        console.error("Error saving data:", error);
      });
  };

  const [filterModel, setFilterModel] = useState({
    items: [],
    logicOperator: "and",
  });

  const columns = [
    { field: "machineId", headerName: "Machine", flex: 1 },
    { field: "schoolName", headerName: "School Name", flex: 1 },
    { field: "schoolBlock", headerName: "Block", flex: 1 },
    { field: "schoolDistrict", headerName: "District", flex: 1 },
    { field: "state", headerName: "State", flex: 1 },
    {
      field: "edit",
      headerName: "",
      renderCell: (params) => (
        <Tooltip title="Remove Machine">
          <IconButton
            onClick={() => confirmDelete(params.row.id, params.row.machineId)}
          >
            <DeleteOutlined />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const CustomToolbar = ({ filterModel }) => {
    const getFilenameFromFilters = () => {
      if (!filterModel?.items?.length) return "AllocatedMachineData";
      const filters = filterModel.items
        .filter((item) => item.value)
        .map((item) => `${item.field}-${item.value}`)
        .join("_");
      const today = new Date().toISOString().split("T")[0];
      return `AllocatedMachineData_${filters}_${today}`.replace(
        /[^a-zA-Z0-9-_]/g,
        "_"
      );
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

  const rows = Array.isArray(schoolData)
    ? schoolData
        .map((school) => ({
          ...school,
          id: school.schoolId,
        }))
        .filter((school) => school.machineId && school.machineId.trim() !== "")
    : [];

  const colors = tokens(theme.palette.mode);

  return (
    <Box m="20px">
      <Box>
        <Header
          title="ALLOCATE MACHINES"
          subtitle="Allocate Uninstalled machines to School"
        />

        <Formik
          onSubmit={handleFormSubmit}
          initialValues={initialValues}
          validationSchema={checkoutSchema}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
          }) => (
            <form onSubmit={handleSubmit}>
              <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                  "& > div": {
                    gridColumn: isNonMobile ? undefined : "span 4",
                  },
                }}
              >
                {/* <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 2" }}>
                  <InputLabel>School</InputLabel>
                  <Select
                    label="School"
                    name="schoolId"
                    value={values.schoolId}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={touched.schoolId && errors.schoolId}
                  >
                    {filteredSchools.map((school) => (
                      <MenuItem key={school.schoolId} value={school.schoolId}>
                        {school.schoolName}
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.schoolId && errors.schoolId && (
                    <div style={{ color: "red", fontSize: "12px" }}>
                      {errors.schoolId}
                    </div>
                  )}
                </FormControl> */}
                {/* School Dropdown with Search */}
                <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
                  <Autocomplete
                    options={filteredSchools}
                    getOptionLabel={(option) => option.schoolName}
                    value={
                      filteredSchools.find(
                        (s) => s.schoolId === values.schoolId
                      ) || null
                    }
                    onChange={(e, newValue) => {
                      handleChange({
                        target: {
                          name: "schoolId",
                          value: newValue ? newValue.schoolId : "",
                        },
                      });
                    }}
                    onBlur={handleBlur}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="School"
                        variant="filled"
                        error={touched.schoolId && Boolean(errors.schoolId)}
                        helperText={touched.schoolId && errors.schoolId}
                      />
                    )}
                  />
                </FormControl>

                {/* <FormControl
                  fullWidth
                  variant="filled"
                  sx={{ gridColumn: "span 2" }}
                >
                  <InputLabel>Machine</InputLabel>
                  <Select
                    label="Machine Id"
                    name="machineId"
                    value={values.machineId}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={touched.machineId && errors.machineId}
                  >
                    {filteredMachines.map((machine) => (
                      <MenuItem
                        key={machine.machineId}
                        value={machine.machineId}
                      >
                        {machine.machineId}
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.machineId && errors.machineId && (
                    <div style={{ color: "red", fontSize: "12px" }}>
                      {errors.machineId}
                    </div>
                  )}
                </FormControl> */}
                {/* Machine Dropdown with Search */}
                <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
                  <Autocomplete
                    options={filteredMachines}
                    getOptionLabel={(option) => option.machineId.toString()}
                    value={
                      filteredMachines.find(
                        (m) => m.machineId === values.machineId
                      ) || null
                    }
                    onChange={(e, newValue) => {
                      handleChange({
                        target: {
                          name: "machineId",
                          value: newValue ? newValue.machineId : "",
                        },
                      });
                    }}
                    onBlur={handleBlur}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Machine"
                        variant="filled"
                        error={touched.machineId && Boolean(errors.machineId)}
                        helperText={touched.machineId && errors.machineId}
                      />
                    )}
                  />
                </FormControl>
              </Box>

              <Box display="flex" justifyContent="flex-end" mt="20px">
                <Button type="submit" color="secondary" variant="contained">
                  Create New Allocation
                </Button>
              </Box>
            </form>
          )}
        </Formik>
        <NotificationModal />
      </Box>

      <Box mt="60px">
        <Header title="" subtitle="Installed Machines" />
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
          <Typography variant="body1" color="textSecondary" align="center">
            Are you sure you want to remove the machine{" "}
            <strong>{selectedMachineId}</strong>? This action cannot be undone.
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
            autoFocus
          >
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllocationForm;
