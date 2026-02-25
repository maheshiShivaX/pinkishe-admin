import {
    Box,
    TextField,
    MenuItem,
    CircularProgress,
    Typography,
    useTheme,
    FormControlLabel,
    Checkbox,
    FormGroup,
    ListItemText,
} from "@mui/material";
import { DataGrid, GridToolbar, GridToolbarContainer } from "@mui/x-data-grid";
import { Formik } from "formik";
import { Header } from "../../components";
import { tokens } from "../../theme";
import { fetchMachineWiseReport, saveReport, viewSavedReport, updateSavedReport, clearSelectedSavedReport, clearMachineWiseReport } from "../../store/reportsSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMemo } from "react";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { showNotification } from "../../store/notificationSlice";
import NotificationModal from "../notificationModal";

/* =========================
   DATE HELPERS
========================= */
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

const thirtyOneDaysAgo = new Date(today);
thirtyOneDaysAgo.setDate(today.getDate() - 31);

const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

/* =========================
   INITIAL VALUES
========================= */
const initialValues = {
    states: [],
    districts: [],
    startDate: formatDate(thirtyOneDaysAgo),
    endDate: formatDate(yesterday),
    dispenseType: "all",
    includeColumns: {
        state: true,
        schoolDistrict: true,
        machineId: true,
        schoolName: true,
        supportedGirls: true,
        padsDispensed: true,
        avgConsumption: true,
        totalRefill: true,
    },
};

/* =========================
   OPTIONS
========================= */
const STATE_OPTIONS = [
    "All States",
    "Chhattisgarh",
    "Uttarakhand",
    "Telangana",
];

const DISTRICT_OPTIONS = [
    "All Districts",
    "Udham Singh Nagar",
    "Sakti",
    "Narayanpur",
    "Asifabad",
    "Adilabad",
];

const MachineWiseDispenseReport = () => {
    const params = useParams();
    const reportId = params?.id;
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    const {
        machineWiseReport: { data = [], summary = null } = {},
        machineWiseLoading,
        saveReportLoading,
        selectedSavedReport,
        viewSavedReportLoading,
    } = useSelector((state) => state.reports);

    const [openSave, setOpenSave] = useState(false);
    const [reportName, setReportName] = useState("");

    /* =========================
         FETCH SAVED REPORT
      ========================= */
    useEffect(() => {
        if (token && reportId) {
            dispatch(viewSavedReport({ token, id: reportId }));
        } else {
            // ✅ VERY IMPORTANT
            dispatch(clearSelectedSavedReport());
            dispatch(clearMachineWiseReport());
            setReportName("");
        }
    }, [token, reportId, dispatch]);

    useEffect(() => {
        if (selectedSavedReport?.reportName) {
            setReportName(selectedSavedReport.reportName);
        }
    }, [selectedSavedReport]);

    /* =========================
         MERGE FILTERS
      ========================= */
    const parsedFilters = useMemo(() => {
        if (!selectedSavedReport?.filters) return initialValues;

        return {
            ...initialValues,
            ...selectedSavedReport.filters,
        };
    }, [selectedSavedReport]);

    /* =========================
         API PAYLOAD BUILDER
      ========================= */
    const buildMachineWisePayload = (values) => ({
        states: values.states || [],
        districts: values.districts || [],
        startDate: values.startDate,
        endDate: values.endDate,
        dispenseType: values.dispenseType,
    });

    /* =========================
    SAVE / UPDATE
    ========================= */
    const handleSaveOrUpdate = async (values) => {
        if (!reportName) return;

        const payload = {
            token,
            reportName,
            filters: values,
        };

        try {
            if (reportId) {
                await dispatch(
                    updateSavedReport({ ...payload, id: reportId })
                ).unwrap();

                // ✅ SUCCESS MESSAGE (UPDATE)
                dispatch(
                    showNotification({
                        message: "Report updated successfully!",
                        type: "success",
                    })
                );
            } else {
                await dispatch(
                    saveReport({
                        ...payload,
                        reportType: "machine_wise_dispense",
                        summary,
                    })
                ).unwrap();
                // ✅ SUCCESS MESSAGE (SAVE)
                dispatch(
                    showNotification({
                        message: "Report saved successfully!",
                        type: "success",
                    })
                );
            }

            setOpenSave(false);
            // navigate("/saved-reports"); // ✅ SUCCESS ke baad navigate

        } catch (error) {
            console.error("Save/Update failed:", error);
            // ❌ ERROR MESSAGE
            dispatch(
                showNotification({
                    message: "Failed to save report. Please try again.",
                    type: "error",
                })
            );
        }
    };

    /* =========================
       INPUT STYLE
    ========================= */
    const inputSx = {
        "& .MuiInputBase-input": { color: "#fff" },

        "& .MuiInputLabel-root": { color: "#bbb" },
        "& .MuiInputLabel-root.Mui-focused": {
            color: colors.greenAccent[400],
        },

        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                borderColor: "#666",
            },
            "&:hover fieldset": {
                borderColor: "#aaa",
            },
            "&.Mui-focused fieldset": {
                borderColor: colors.greenAccent[400],
                borderWidth: "2px",
            },
        },

        "& .MuiSvgIcon-root": { color: "#fff" },

        "& input::-webkit-calendar-picker-indicator": {
            filter: "invert(1)",
        },
    };

    /* =========================
       TABLE COLUMNS
    ========================= */
    const allColumns = [
        {
            field: "srNo",
            headerName: "Sr No",
            width: 80,
            sortable: false,
            filterable: false,
            renderCell: (params) =>
                params.api.getRowIndexRelativeToVisibleRows(params.id) + 1,
        },
        { field: "state", headerName: "State", flex: 1 },
        { field: "schoolDistrict", headerName: "District", flex: 1 },
        { field: "machineId", headerName: "Machine ID", flex: 1 },
        { field: "schoolName", headerName: "School Name", flex: 2 },
        { field: "supportedGirls", headerName: "Supported Girls", flex: 1 },
        { field: "padsDispensed", headerName: "Pads Dispensed", flex: 1 },
        { field: "avgConsumption", headerName: "Avg Consumption / Girl", flex: 1 },
        { field: "totalRefill", headerName: "Total Refill", flex: 1 },
    ];

    const handleDownloadPDF = (rows, columns, filters) => {
        const doc = new jsPDF("l", "mm", "a4");

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        /* =========================
           HEADER (ONLY FIRST PAGE)
        ========================= */
        doc.setFontSize(14);
        doc.text(
            "Machine Wise Dispense & Utilization Report",
            pageWidth / 2,
            12,
            { align: "center" }
        );

        doc.setFontSize(9);

        const fromDate = filters.startDate || "_____";
        const toDate = filters.endDate || "_____";

        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        const days =
            filters.startDate && filters.endDate
                ? Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
                : "_____";

        doc.text(`Dates: From ${fromDate} To ${toDate}`, 14, 20);
        doc.text(`Days: ${days}`, 14, 25);
        doc.text(
            `State(s): ${filters.states?.length ? filters.states.join(", ") : "All"}`,
            14,
            30
        );
        doc.text(
            `District(s): ${filters.districts?.length ? filters.districts.join(", ") : "All"}`,
            14,
            35
        );

        /* =========================
           TABLE
        ========================= */
        autoTable(doc, {
            startY: 42,
            showHead: "firstPage", // ✅ HEADER ONLY ON FIRST PAGE
            head: [columns.map((c) => c.headerName)],
            body: rows.map((row, index) =>
                columns.map((col) =>
                    col.field === "srNo" ? index + 1 : row[col.field] ?? "-"
                )
            ),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [40, 130, 180] },
        });

        /* =========================
           SUMMARY (AFTER TABLE ONLY)
        ========================= */
        let y = doc.lastAutoTable.finalY + 10;

        // Agar space kam ho to new page
        if (y + 60 > pageHeight) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(10);
        doc.text("Summary (As per Include)", 14, y);
        y += 6;

        const summaryLines = [
            `Period: ${summary.period}`,
            `Number of Days: ${summary.numberOfDays}`,
            `Number of States: ${summary.numberOfStates}`,
            `Number of Districts: ${summary.numberOfDistricts}`,
            `Number of Machines Installed: ${summary.numberOfMachinesInstalled}`,
            `Number of Schools Covered: ${summary.numberOfSchoolsCovered}`,
            `Number of Supported Girls: ${summary.numberOfSupportedGirls}`,
            `Number of Pads Dispensed: ${summary.numberOfPadsDispensed}`,
            `Average Consumption per Girl: ${summary.averageConsumptionPerGirl}`,
            `Total Refills: ${summary.totalRefills}`,
        ];

        doc.setFontSize(9);
        summaryLines.forEach((line) => {
            y += 3;              // 👈 top space
            doc.text(line, 14, y);
            y += 3;              // 👈 bottom space
        });

        /* =========================
           FOOTER (ONLY ON LAST PAGE)
        ========================= */
        const printedBy =
            selectedSavedReport?.createdBy ||
            localStorage.getItem("userName") ||
            "_____";

        const generatedAt = new Date().toLocaleString();

        doc.setFontSize(8);
        doc.text(`Printed By: ${printedBy}`, 14, pageHeight - 10);
        doc.text(
            `Date and Time of Report Generation: ${generatedAt}`,
            pageWidth - 14,
            pageHeight - 10,
            { align: "right" }
        );

        doc.save("machine-wise-dispense-report.pdf");
    };

    /* =========================
       CUSTOM TOOLBAR (NO EXPORT)
    ========================= */
    const CustomToolbar = ({ rows, columns, filters }) => {
        return (
            <GridToolbarContainer>
                {/* DEFAULT GRID TOOLBAR (EXPORT REMOVED) */}
                <GridToolbar
                    csvOptions={{ disableToolbarButton: true }}
                    printOptions={{ disableToolbarButton: true }}
                />

                {/* YOUR DOWNLOAD PDF BUTTON */}
                <Button
                    onClick={() => handleDownloadPDF(rows, columns, filters)}
                    startIcon={<DownloadOutlinedIcon />}
                    sx={{
                        textTransform: "none",
                        color: "#fff",
                        fontSize: "0.875rem",
                        minWidth: "auto",
                        padding: "6px 8px",
                    }}
                >
                    Download
                </Button>

                <Button
                    onClick={() => setOpenSave(true)}
                    disabled={!summary}
                    startIcon={<DownloadOutlinedIcon />}
                    sx={{
                        textTransform: "none",
                        color: "#fff",
                        fontSize: "0.875rem",
                        minWidth: "auto",
                        padding: "6px 8px",
                    }}
                >
                    {reportId ? "Update Report" : "Save"}
                </Button>
            </GridToolbarContainer>
        );
    };

    if (viewSavedReportLoading) {
        return <CircularProgress />;
    }

    return (
        <Box m="20px">
            <Box display="flex" alignItems="center" gap={1} mb={2}>
                {reportId && (
                    <ArrowBackOutlinedIcon
                        sx={{
                            cursor: "pointer",
                            color: "#fff",
                            fontSize: "28px",
                        }}
                        onClick={() => navigate(-1)}
                    />
                )}

                {reportId ? (
                    <h1>{selectedSavedReport?.reportName}</h1>
                ) : (
                    <Header
                        title={"Machine Wise Dispense & Utilization Report"}
                        subtitle={"Machine-wise pad distribution and consumption"}
                    />
                )}
            </Box>

            <Formik
                initialValues={parsedFilters}
                enableReinitialize
            >
                {({ values, setFieldValue }) => {
                    useEffect(() => {
                        if (!token) return;

                        // Wait for saved report to finish loading
                        if (reportId && viewSavedReportLoading) return;

                        // Only fetch if we have valid filters (after saved report is loaded)
                        dispatch(
                            fetchMachineWiseReport({
                                token,
                                ...buildMachineWisePayload(values),
                            })
                        );
                    }, [values, token, dispatch, reportId, viewSavedReportLoading]);

                    const displayedColumns = [
                        {
                            field: "srNo",
                            headerName: "Sr No",
                            width: 80,
                            sortable: false,
                            filterable: false,
                            disableColumnMenu: true,
                            renderCell: (params) =>
                                params.api.getRowIndexRelativeToVisibleRows(params.id) + 1,
                        },
                        ...(Object.keys(values.includeColumns)
                            .filter((k) => values.includeColumns[k])
                            .map((k) => ({
                                field: k,
                                headerName:
                                    k === "schoolDistrict"
                                        ? "District"
                                        : k.replace(/([A-Z])/g, " $1"),
                                flex: 1,
                            }))),
                    ];

                    const handleMultiSelect = (field, allLabel) => (e) => {
                        const value = e.target.value;

                        if (value.includes(allLabel)) {
                            setFieldValue(field, []);
                        } else {
                            setFieldValue(field, value);
                        }
                    };

                    return (
                        <>
                            <Box
                                display="grid"
                                gridTemplateColumns="repeat(4, 1fr)"
                                gap="20px"
                                mb="20px"
                            >
                                <TextField
                                    select
                                    label=""
                                    SelectProps={{
                                        multiple: true,
                                        displayEmpty: true,
                                        renderValue: (selected) => {
                                            if (selected.length === 0) {
                                                return "All States";   // ✅ DEFAULT TEXT
                                            }
                                            return selected.join(", ");
                                        },
                                    }}
                                    value={values.states}
                                    onChange={handleMultiSelect("states", "All States")}
                                    sx={inputSx}
                                >
                                    {STATE_OPTIONS.map((state) => (
                                        <MenuItem key={state} value={state}>
                                            <Checkbox
                                                checked={
                                                    values.states.length === 0
                                                        ? state === "All States"
                                                        : values.states.includes(state)
                                                }
                                            />
                                            <ListItemText primary={state} />
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    select
                                    label=""
                                    SelectProps={{
                                        multiple: true,
                                        displayEmpty: true,
                                        renderValue: (selected) => {
                                            if (selected.length === 0) {
                                                return "All Districts";   // ✅ DEFAULT TEXT
                                            }
                                            return selected.join(", ");
                                        },
                                    }}
                                    value={values.districts}
                                    onChange={handleMultiSelect("districts", "All Districts")}
                                    sx={inputSx}
                                >
                                    {DISTRICT_OPTIONS.map((district) => (
                                        <MenuItem key={district} value={district}>
                                            <Checkbox
                                                checked={
                                                    values.districts.length === 0
                                                        ? district === "All Districts"
                                                        : values.districts.includes(district)
                                                }
                                            />
                                            <ListItemText primary={district} />
                                        </MenuItem>
                                    ))}
                                </TextField>


                                <TextField
                                    type="date"
                                    label="Start Date"
                                    InputLabelProps={{ shrink: true }}
                                    value={values.startDate}
                                    onChange={(e) =>
                                        setFieldValue("startDate", e.target.value)
                                    }
                                    sx={inputSx}
                                />

                                <TextField
                                    type="date"
                                    label="End Date"
                                    InputLabelProps={{ shrink: true }}
                                    value={values.endDate}
                                    onChange={(e) =>
                                        setFieldValue("endDate", e.target.value)
                                    }
                                    sx={inputSx}
                                />

                                <TextField
                                    select
                                    label="Type of Dispense"
                                    value={values.dispenseType}
                                    onChange={(e) =>
                                        setFieldValue("dispenseType", e.target.value)
                                    }
                                    sx={inputSx}
                                >
                                    <MenuItem value="all">All</MenuItem>
                                    <MenuItem value="dispensed">
                                        Dispense through Machine
                                    </MenuItem>
                                    <MenuItem value="manual">
                                        Manual pad distribution
                                    </MenuItem>
                                </TextField>
                            </Box>

                            {/* INCLUDE COLUMNS */}
                            <Box mb="20px">
                                <Typography fontWeight="bold" mb={1} color="#fff">
                                    Include Columns:
                                </Typography>

                                <FormGroup row>
                                    {Object.keys(values.includeColumns).map((key) => (
                                        <FormControlLabel
                                            key={key}
                                            label={
                                                allColumns.find((c) => c.field === key)?.headerName
                                            }
                                            sx={{ color: "#fff" }}
                                            control={
                                                <Checkbox
                                                    checked={values.includeColumns[key]}
                                                    onChange={(e) =>
                                                        setFieldValue("includeColumns", {
                                                            ...values.includeColumns,
                                                            [key]: e.target.checked,
                                                        })
                                                    }
                                                    sx={{
                                                        color: "#ccc",
                                                        "&.Mui-checked": {
                                                            color: theme.palette.success.main,
                                                        },
                                                    }}
                                                />
                                            }
                                        />
                                    ))}
                                </FormGroup>
                            </Box>

                            {/* TABLE */}
                            <Box height="70vh">
                                {machineWiseLoading ? (
                                    <CircularProgress />
                                ) : (
                                    <DataGrid
                                        rows={data?.length > 0 && data.map((row, i) => ({
                                            id: `${row.machineId}-${i}`,
                                            ...row,
                                        }))}
                                        columns={displayedColumns}
                                        // slots={{ toolbar: GridToolbar }}
                                        pageSizeOptions={[10, 25, 50]}
                                        localeText={{
                                            noRowsLabel: "No data available for selected filters",
                                        }}
                                        slots={{
                                            toolbar: () => (
                                                <CustomToolbar
                                                    rows={data}
                                                    columns={displayedColumns}
                                                    filters={parsedFilters}
                                                />
                                            ),
                                        }}
                                        sx={{
                                            border: "none",
                                            "& .MuiDataGrid-columnHeaders": {
                                                backgroundColor: colors.greenAccent[700],
                                                color: "#fff",
                                            },
                                            "& .MuiDataGrid-virtualScroller": {
                                                backgroundColor: colors.primary[400],
                                            },
                                            "& .MuiDataGrid-toolbarContainer": {
                                                color: "#fff",
                                            },
                                            "& .MuiDataGrid-toolbarContainer button": {
                                                color: "#fff !important",
                                            },
                                            "& .MuiDataGrid-toolbarContainer svg": {
                                                color: "#fff !important",
                                            },
                                            "& .MuiPaper-root": {
                                                backgroundColor: colors.primary[500],
                                                color: "#fff",
                                            },
                                        }}
                                    />
                                )}
                            </Box>

                            {/* SAVE MODAL */}
                            <Dialog open={openSave} onClose={() => setOpenSave(false)}>
                                <DialogTitle>
                                    {reportId ? "Update Report" : "Save Report"}
                                </DialogTitle>
                                <DialogContent>
                                    <TextField
                                        fullWidth
                                        label="Report Name"
                                        value={reportName}
                                        onChange={(e) =>
                                            setReportName(e.target.value)
                                        }
                                    />
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setOpenSave(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        disabled={
                                            !reportName || saveReportLoading
                                        }
                                        onClick={() =>
                                            handleSaveOrUpdate(values)
                                        }
                                    >
                                        Save
                                    </Button>
                                </DialogActions>
                            </Dialog>

                            {/* SUMMARY */}
                            {summary && (
                                <Box
                                    borderRadius="8px"
                                    backgroundColor={colors.primary[500]}
                                    display="grid"
                                    gridTemplateColumns="1fr"
                                    gap="8px"
                                >
                                    <Typography color="#fff" fontWeight="bold" mb={1}>
                                        Summary (As per Include)
                                    </Typography>

                                    <Typography color="#fff">
                                        <b>Period:</b> {summary.period}
                                    </Typography>
                                    <Typography color="#fff">
                                        <b>Number of Days:</b> {summary.numberOfDays}
                                    </Typography>
                                    <Typography color="#fff">
                                        <b>Number of States:</b> {summary.numberOfStates}
                                    </Typography>
                                    <Typography color="#fff">
                                        <b>Number of Districts:</b> {summary.numberOfDistricts}
                                    </Typography>
                                    <Typography color="#fff">
                                        <b>Number of Machines Installed:</b>{" "}
                                        {summary.numberOfMachinesInstalled}
                                    </Typography>
                                    <Typography color="#fff">
                                        <b>Number of Schools Covered:</b>{" "}
                                        {summary.numberOfSchoolsCovered}
                                    </Typography>
                                    <Typography color="#fff">
                                        <b>Number of Supported Girls:</b>{" "}
                                        {summary.numberOfSupportedGirls}
                                    </Typography>
                                    <Typography color="#fff">
                                        <b>Number of Pads Dispensed:</b>{" "}
                                        {summary.numberOfPadsDispensed}
                                    </Typography>
                                    <Typography color="#fff">
                                        <b>Average Consumption per Girl:</b>{" "}
                                        {summary.averageConsumptionPerGirl}
                                    </Typography>
                                    <Typography color="#fff">
                                        <b>Total Refills:</b> {summary.totalRefills}
                                    </Typography>
                                </Box>
                            )}
                        </>
                    );
                }}
            </Formik>
            {/* Notification Modal */}
            <NotificationModal />
        </Box>
    );
};

export default MachineWiseDispenseReport;
