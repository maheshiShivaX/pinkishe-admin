import {
  Box,
  Typography,
  useTheme,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from "@mui/x-data-grid";

import { Header } from "../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  getGeoLocation,
  deleteGeolocation,
} from "../../store/geolocationSlice";
import { showNotification } from "../../store/notificationSlice";
import { useNavigate } from "react-router-dom";
import {
  EditOutlined,
  DeleteOutlined,
  WarningAmber,
} from "@mui/icons-material";
import NotificationModal from "../notificationModal";

const GeoLocationList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [filterModel, setFilterModel] = useState({
    items: [],
    logicOperator: "and",
  });
  const {
    data: geoLocationData,
    loading,
    error,
  } = useSelector((state) => state.geolocation);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [selectedLocationName, setSelectedLocationName] = useState("");

  useEffect(() => {
    dispatch(getGeoLocation());
  }, [dispatch]);

  const confirmDelete = (id, blockName) => {
    setSelectedLocationId(id);
    setSelectedLocationName(blockName);
    setOpenDialog(true);
  };

  const handleDeleteConfirmed = () => {
    if (selectedLocationId) {
      dispatch(deleteGeolocation(selectedLocationId))
        .unwrap()
        .then(() => {
          dispatch(
            showNotification({
              message: "Geo Location deleted successfully!",
              type: "success",
            })
          );
          dispatch(getGeoLocation());
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
          setSelectedLocationId(null);
        });
    }
  };

  const CustomToolbar = ({ filterModel }) => {
    const getFilenameFromFilters = () => {
      if (!filterModel?.items?.length) return "GeoLocationData";

      const filters = filterModel.items
        .filter((item) => item.value)
        .map((item) => `${item.field}-${item.value}`)
        .join("_");

      const today = new Date().toISOString().split("T")[0];
      return `GeoLocation_${filters}_${today}`;
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
    { field: "block", headerName: "Block", flex: 1 },
    { field: "district", headerName: "District", flex: 1 },
    { field: "state", headerName: "State", flex: 1 },
    {
      field: "edit",
      headerName: "",
      filterable: false,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={() =>
            navigate(`/edit-geolocation/${params.id}`, {
              state: { geoLocationData: params.row },
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
        <IconButton onClick={() => confirmDelete(params.id, params.row.block)}>
          <DeleteOutlined />
        </IconButton>
      ),
    },
  ];

  const rows = Array.isArray(geoLocationData)
    ? geoLocationData.map((item) => ({
        id: item.id,
        state: item.state,
        district: item.district,
        block: item.block,
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
        <Header
          title="Geolocation Data"
          subtitle="List of Geolocation Information"
        />
        <Button
          color="secondary"
          variant="contained"
          onClick={() => navigate(`/geoForm`)}
        >
          Add New Location
        </Button>
      </Box>

      <NotificationModal />
      <Box
        mt="40px"
        height="75vh"
        maxWidth="100%"
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
            Are you sure you want to delete the block:{" "}
            <strong>{selectedLocationName}</strong>? This action cannot be
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

export default GeoLocationList;
