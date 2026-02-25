import {
  Box,
  Typography,
  useTheme,
  CircularProgress,
  Button,
  IconButton,
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
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { fetchVendingMachines } from "../../store/getVendingMachineSlice";
import { deleteVendingMachine } from "../../store/vendingMasterSlice";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  EditOutlined,
  DeleteOutlined,
  WarningAmber,
} from "@mui/icons-material";
import { showNotification } from "../../store/notificationSlice";
import NotificationModal from "../notificationModal";

const Invoices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState(null);
  const [filterModel, setFilterModel] = useState({
    items: [],
    logicOperator: "and",
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [selectedMachineName, setSelectedMachineName] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  const { vendingMachines, loadingVendingMachines, errorVendingMachines } =
    useSelector((state) => state.getVendingMachine || {});

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (token) {
      dispatch(fetchVendingMachines(token));
    }
  }, [dispatch, token]);

  const confirmDelete = (machineId, machineName) => {
    setSelectedMachineId(machineId);
    setSelectedMachineName(machineName);
    setOpenDialog(true);
  };

  const handleDeleteConfirmed = () => {
    if (selectedMachineId) {
      dispatch(deleteVendingMachine(selectedMachineId))
        .unwrap()
        .then(() => {
          dispatch(
            showNotification({
              message: "Vending Machine deleted successfully!",
              type: "success",
            })
          );
          dispatch(fetchVendingMachines(token));
        })
        .catch((errorMsg) => {
          dispatch(
            showNotification({
              message: errorMsg,
              type: "error",
            })
          );
        })
        .finally(() => {
          setOpenDialog(false);
          setSelectedMachineId(null);
          setSelectedMachineName("");
        });
    }
  };

  const columns = [
    {
      field: "machineId",
      headerName: "Machine ID",
      flex: 1,
      renderCell: (params) => (
        <Typography
          color="secondary"
          sx={{ cursor: "pointer", fontWeight: "bold" }}
          onClick={() => navigate(`/dispenseHistoryMachine/${params.id}`)}
        >
          {params.value}
        </Typography>
      ),
    },
    // { field: "gsmModuleImei", headerName: "GSM Module IMEI", flex: 1 },
    { field: "vendorName", headerName: "Vendor", flex: 1 },
    // { field: "simCardNumber", headerName: "Sim Card Number", flex: 1 },
    { field: "padCapacity", align: "center", headerName: "Pad Capacity", flex: 1 },
    {
      field: "remaingStock",
      headerName: "Stock",
      align: "center", 
      headerAlign: "center",
      flex: 1,
      renderCell: (params) => {
        const stock = params.value ?? 0;

        let bgColor = "";
        let textColor = "";

        if (stock <= 15) {
          bgColor = colors.redAccent[500];
          textColor = colors.redAccent[100];
        } else if (stock <= 30) {
          bgColor = colors.yellowAccent?.[500] || "#ffe14c";
          textColor = colors.yellowAccent?.[900] || "#332f0f";
        } else {
          bgColor = colors.greenAccent[500];
          textColor = colors.greenAccent[900];
        }

        return (
          <Box
            bgcolor={bgColor}
            color={textColor}
            p="5px 10px"
            borderRadius="4px"
            fontWeight="bold"
            width="fit-content"
            mx="auto"
          >
            {stock}
          </Box>
        );
      },
    },

    {
      field: "schoolName",
      headerName: "School Name",
      flex: 1,
      valueGetter: (params) => params.row?.school?.schoolName,
    },
    {
      field: "schoolState",
      headerName: "State",
      flex: 1,
      valueGetter: (params) => params.row?.school?.state,
    },
    {
      field: "schoolDistrict",
      headerName: "District",
      flex: 1,
      valueGetter: (params) => params.row?.school?.schoolDistrict,
    },
    {
      field: "schoolBlock",
      headerName: "Block",
      flex: 1,
      valueGetter: (params) => params.row?.school?.schoolBlock,
    },
    {
      field: "schoolSpocName",
      headerName: "School Spoc",
      flex: 1,
      valueGetter: (params) => params.row?.school?.schoolSpocName,
    },
    {
      field: "ngoSpocName",
      headerName: "NGO Spoc",
      flex: 1,
      valueGetter: (params) => params.row?.school?.ngoSpocName,
    },
    {
      field: "onlineStatus",
      headerName: "Live Status",
      flex: 1,
      valueGetter: (params) => {
        const updatedAt = params.row?.onlineStatusUpdatedAt;
        if (!updatedAt) return "Offline";

        const lastUpdated = new Date(updatedAt).getTime();
        const now = new Date().getTime();
        const diffInSeconds = (now - lastUpdated) / 1000;
        return diffInSeconds <= 1800 ? "Online" : "Offline";
      },
      renderCell: (params) => (
        <Typography
          color={params.value === "Online" ? "green" : "error"}
          fontWeight="bold"
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Machine Status",
      flex: 1,
    },
    {
      field: "edit",
      headerName: "",
      filterable: false,
      sortable: false,
      renderCell: (params) => {
        if (userRole === "admin" || userRole === "superadmin") {
          return (
            <IconButton
              onClick={() => navigate(`/edit-vending-machine/${params.id}`)}
            >
              <EditOutlined />
            </IconButton>
          );
        }
        return null;
      },
    },
    {
      field: "delete",
      headerName: "",
      filterable: false,
      sortable: false,
      renderCell: (params) => {
        if (userRole === "admin" || userRole === "superadmin") {
          return (
            <IconButton
              onClick={() => confirmDelete(params.id, params.row.machineId)}
            >
              <DeleteOutlined />
            </IconButton>
          );
        }
        return null;
      },
    },
  ];

  const CustomToolbar = ({ filterModel }) => {
    const getFilenameFromFilters = () => {
      if (!filterModel?.items?.length) return "VendingMachinesData";

      const filters = filterModel.items
        .filter((item) => item.value)
        .map((item) => `${item.field}-${item.value}`)
        .join("_");

      const today = new Date().toISOString().split("T")[0];
      return `VendingMachines_${filters}_${today}`.replace(
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

  const rows = Array.isArray(vendingMachines)
    ? vendingMachines.map((item) => ({
        ...item,
        id: item.machineId,
        status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      }))
    : [];

  if (loadingVendingMachines) {
    return <CircularProgress />;
  }

  if (errorVendingMachines) {
    return <Typography color="error">Error: {errorVendingMachines}</Typography>;
  }

  return (
    <Box m="20px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="20px"
        flexWrap="wrap"
      >
        <Header
          title="Vending Machines Status"
          subtitle="List and status of all Vending Machines."
        />

        <Button
          color="secondary"
          variant="contained"
          onClick={() => navigate(`/vendingMaster`)}
        >
          Add New Machine
        </Button>
      </Box>

      <NotificationModal />
      <Box
        mt="40px"
        height="75vh"
        maxWidth="100%"
        sx={{
          width: `${columns.length * 200}px`,
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
          components={{ Toolbar: CustomToolbar }}
          componentsProps={{ toolbar: { filterModel } }}
          filterModel={filterModel}
          onFilterModelChange={(model) => setFilterModel(model)}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          // checkboxSelection
        />
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
            Are you sure you want to delete Machine ID:{" "}
            <strong>{selectedMachineName}</strong>? This action cannot be
            undone.
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

export default Invoices;
