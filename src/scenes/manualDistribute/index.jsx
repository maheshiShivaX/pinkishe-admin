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
import { addManualPads, deleteManualPads, getManualPads, updateManualPads } from "../../store/manualPadsSlice";
import { useNavigate, useParams } from "react-router-dom";

// const initialValues = {
//     machineId: "",
//     padCounts: "",
//     remark: "",
// };

const checkoutSchema = yup.object().shape({
    machineId: yup.string().required("Machine ID is required"),
    padCounts: yup.number().required("Pad Count is required").positive().integer(),
    remark: yup.string().required("Remark is required"),
    dateOfEntry: yup.date().required("Date of Entry is required"),
    eventStartDate: yup.date().required("Event Start Date is required"),
    eventEndDate: yup.date().required("Event End Date is required"),
});

const ManualPadDistribute = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme();
    const [initialValues, setInitialValues] = useState({
        id: null,
        machineId: "",
        padCounts: "",
        remark: "",
        dateOfEntry: new Date().toISOString().split("T")[0], // defaults to today
        eventStartDate: "",
        eventEndDate: "",
    });
    const { vendingMachines = [], loadingVendingMachines } = useSelector(
        (state) => state.getVendingMachine || {}
    );

    const { manualPads = [], loading } = useSelector(state => state.manualPads);

    const token = localStorage.getItem("authToken");

    useEffect(() => {
        if (token) {
            dispatch(fetchVendingMachines(token));
        }
    }, [dispatch, token]);

    useEffect(() => {
        dispatch(getManualPads(token));
    }, [dispatch]);

    useEffect(() => {
        if (manualPads) {
            setInitialValues({
                machineId: manualPads.machineId,
                padCounts: manualPads.padCounts,
                remark: manualPads.remark,
                dateOfEntry: new Date().toISOString().split("T")[0],
                eventStartDate: manualPads.eventStartDate,
                eventEndDate: manualPads.eventStartDate,
            });
        }
    }, [manualPads]);

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
            dispatch(deleteManualPads(selectedIdToDelete))
                .unwrap()
                .then(() => {
                    dispatch(
                        showNotification({
                            message: "Manual Pads successfully removed.",
                            type: "success",
                        })
                    );
                    dispatch(getManualPads());
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

    // Handle form submit (create or update)
    const handleFormSubmit = (values, actions) => {
        if (values.id) {
            // Update
            dispatch(updateManualPads({ id: values.id, manualPadsData: values }))
                .unwrap()
                .then(() => {
                    dispatch(
                        showNotification({ message: "Manual Pad updated successfully!", type: "success" })
                    );
                    actions.resetForm({ values: { id: null, machineId: "", padCounts: "", remark: "", dateOfEntry: new Date().toISOString().split("T")[0], eventStartDate: "", eventEndDate: "" } });
                    dispatch(getManualPads(token));
                })
                .catch(() => {
                    dispatch(
                        showNotification({ message: "Error updating Manual Pad.", type: "error" })
                    );
                });
        } else {
            // Create
            dispatch(addManualPads(values))
                .unwrap()
                .then(() => {
                    dispatch(
                        showNotification({ message: "Manual Pad created successfully!", type: "success" })
                    );
                    actions.resetForm({ values: { id: null, machineId: "", padCounts: "", remark: "", dateOfEntry: new Date().toISOString().split("T")[0], eventStartDate: "", eventEndDate: "", } });
                    dispatch(getManualPads(token));
                })
                .catch(() => {
                    dispatch(
                        showNotification({ message: "This Machine Manual Pads Already Exits", type: "error" })
                    );
                });
        }
    };

    const [filterModel, setFilterModel] = useState({
        items: [],
        logicOperator: "and",
    });

    const handleEdit = (row) => {
        setInitialValues({
            id: row.id,
            machineId: row.machineId,
            padCounts: row.padCounts,
            remark: row.remark,
            dateOfEntry: row.dateOfEntry,
            eventStartDate: row?.eventStartDate,
            eventEndDate: row?.eventEndDate,
        });
    };

    const columns = [
        { field: "machineId", headerName: "Machine", flex: 1 },
        { field: "padCounts", headerName: "Pad Counts", flex: 1 },
        { field: "dateOfEntry", headerName: "Date Of Entry", flex: 1 },
        { field: "eventStartDate", headerName: "Event Start Date", flex: 1 },
        { field: "eventEndDate", headerName: "Event End Date", flex: 1 },
        { field: "remark", headerName: "Message", flex: 1 },
        {
            field: "edit",
            headerName: "",
            filterable: false,
            sortable: false,
            renderCell: (params) => (
                <IconButton onClick={() => handleEdit(params.row)}>
                    <EditOutlined />
                </IconButton>
            ),
        },
        {
            field: "delete",
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



    const rows = Array.isArray(manualPads)
        ? manualPads
            .map((school) => ({
                ...school,
                id: school.id,
            }))
            .filter((school) => school.machineId && school.machineId.trim() !== "")
        : [];

    const colors = tokens(theme.palette.mode);

    return (
        <Box m="20px">
            <Box>
                <Header
                    title="Manual Pad Distribution"
                    subtitle="Add Manual Pad Distribution"
                />

                <Formik
                    enableReinitialize
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

                                <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
                                    <Autocomplete
                                        options={vendingMachines}
                                        getOptionLabel={(option) => option.machineId.toString()}
                                        value={vendingMachines?.find(
                                            (m) => m.machineId?.toString() === values.machineId?.toString()
                                        ) || null}
                                        onChange={(e, newValue) => {
                                            handleChange({
                                                target: { name: "machineId", value: newValue ? newValue.machineId.toString() : "" },
                                            });
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Machine"
                                                variant="filled"
                                                error={touched.machineId && Boolean(errors.machineId)}
                                                helperText={touched.machineId && errors.machineId}
                                            />
                                        )}
                                        variant="filled"
                                    />
                                </FormControl>

                                {/* Pad Count Input */}
                                <TextField
                                    fullWidth
                                    sx={{ gridColumn: "span 2" }}
                                    label="Pad Count"
                                    name="padCounts"
                                    variant="filled"
                                    type="number"
                                    value={values.padCounts}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.padCounts && Boolean(errors.padCounts)}
                                    helperText={touched.padCounts && errors.padCounts}
                                />

                                {/* Remark Input */}
                                <TextField
                                    fullWidth
                                    sx={{ gridColumn: "span 2" }}
                                    label="Remark"
                                    name="remark"
                                    variant="filled"
                                    value={values.remark}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.remark && Boolean(errors.remark)}
                                    helperText={touched.remark && errors.remark}
                                />

                                {/* 🟢 New Date Fields */}
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="date"
                                    label="Date of Entry"
                                    name="dateOfEntry"
                                    value={values.dateOfEntry}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    InputLabelProps={{ shrink: true }}
                                />

                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="date"
                                    label="Event Start Date"
                                    name="eventStartDate"
                                    value={values.eventStartDate}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    InputLabelProps={{ shrink: true }}
                                />

                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="date"
                                    label="Event End Date"
                                    name="eventEndDate"
                                    value={values.eventEndDate}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Box>

                            <Box display="flex" justifyContent="flex-end" mt="20px">
                                <Button type="submit" color="secondary" variant="contained">
                                    Create Manual Pad Distribution
                                </Button>
                            </Box>
                        </form>
                    )}
                </Formik>
                <NotificationModal />
            </Box>

            <Box mt="60px">
                <Header title="" subtitle="Manual Pads" />
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

export default ManualPadDistribute;
