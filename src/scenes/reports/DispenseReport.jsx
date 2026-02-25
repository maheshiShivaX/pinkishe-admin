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
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { DataGrid, GridToolbar, GridToolbarContainer } from "@mui/x-data-grid";
import { Formik } from "formik";
import { Header } from "../../components";
import { tokens } from "../../theme";
import { fetchStateDistrictWiseReport, saveReport, viewSavedReport, updateSavedReport, clearSelectedSavedReport, fetchDispenseReport } from "../../store/reportsSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
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
    level: "national",
    startDate: formatDate(thirtyOneDaysAgo),
    endDate: formatDate(yesterday),
    includeColumns: {
        level: true,
        days: true,
        schoolgirls: true,
        machinesInstalled: true,
        schools: true,
        padsDispensed: true,
        consumptionRate: true,
    },
};

const DispenseReport = () => {
    const params = useParams();
    const reportId = params?.id;
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");
    const navigate = useNavigate();

    const {
        dispenseReport: { data = [], summary = null } = {},
        dispenseReportLoading,
        saveReportLoading,
        selectedSavedReport,
        viewSavedReportLoading,
    } = useSelector((state) => state.reports);

    const [openSave, setOpenSave] = useState(false);
    const [reportName, setReportName] = useState("");
    const [description, setDescription] = useState("");

    /* =========================
         FETCH SAVED REPORT
      ========================= */
    useEffect(() => {
        if (token && reportId) {
            dispatch(viewSavedReport({ token, id: reportId }));
        } else {
            // ✅ VERY IMPORTANT
            dispatch(clearSelectedSavedReport());
            setReportName("");
            setDescription("");
        }
    }, [token, reportId, dispatch]);

    useEffect(() => {
        if (selectedSavedReport) {
            setReportName(selectedSavedReport.reportName || "");

            setDescription(
                selectedSavedReport.description ||
                selectedSavedReport.reportDescription ||
                selectedSavedReport.report_desc ||
                ""
            );
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
       SAVE / UPDATE
       ========================= */
    const handleSaveOrUpdate = async (values) => {
        if (!reportName) return;

        const payload = {
            token,
            reportName,
            description,
            filters: values,
        };

        try {
            if (reportId) {
                await dispatch(
                    updateSavedReport({ ...payload, summary, id: reportId })
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
                        reportType: "dispense_report",
                        summary,
                    })
                ).unwrap();
                // ✅ SUCCESS MESSAGE (UPDATE)
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

    const allColumns = [
        { field: "level", headerName: "Level", flex: 1 },
        { field: "days", headerName: "Days", flex: 0.5 },
        { field: "schoolgirls", headerName: "No of Schoolgirls", flex: 1 },
        { field: "machinesInstalled", headerName: "No of Machines Installed", flex: 1 },
        { field: "schools", headerName: "No of Schools", flex: 1 },
        { field: "padsDispensed", headerName: "No of Pads Dispensed", flex: 1 },
        { field: "consumptionRate", headerName: "Consumption Rate", flex: 1 },
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
            "State / District Wise Dispense Report",
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
            `Total Schoolgirls: ${summary.totalSchoolgirls}`,
            `Total Machines Installed: ${summary.totalMachinesInstalled}`,
            `Total Schools: ${summary.totalSchools}`,
            `Total Pads Dispensed: ${summary.totalPadsDispensed}`,
            `Average Consumption Rate: ${summary.averageConsumptionRate}`,
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

    // { dispenseReportLoading ? <CircularProgress /> : <DataGrid ... /> }

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
                        title={"Dispense Report"}
                        subtitle={"Dispanse report based on selected filters"}
                    />
                )}
            </Box>

            <Formik
                initialValues={parsedFilters}
                enableReinitialize
            >
                {({ values, setFieldValue }) => {

                    useEffect(() => {
                        if (!token || viewSavedReportLoading) return;

                        dispatch(
                            fetchDispenseReport({
                                token,
                                level: values.level,
                                startDate: values.startDate,
                                endDate: values.endDate,
                            })
                        );
                    }, [values.level, values.startDate, values.endDate, token, dispatch, viewSavedReportLoading]);

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
                        ...Object.keys(values.includeColumns)
                            .filter((k) => values.includeColumns[k])
                            .map((k) => ({
                                field: k,
                                headerName:
                                    k === "schoolgirls"
                                        ? "No of Schoolgirls"
                                        : k === "machinesInstalled"
                                            ? "No of Machines Installed"
                                            : k === "padsDispensed"
                                                ? "No of Pads Dispensed"
                                                : k === "consumptionRate"
                                                    ? "Consumption Rate"
                                                    : k === "schools"
                                                        ? "No of Schools"
                                                        : k === "days"
                                                            ? "Days"
                                                            : "Level",
                                flex: 1,
                            })),
                    ];

                    return (
                        <>
                            {/* FILTERS */}
                            <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap="20px" mb="20px">
                                <TextField
                                    select
                                    label="Level"
                                    value={values.level}
                                    onChange={(e) => setFieldValue("level", e.target.value)}
                                    sx={inputSx}
                                >
                                    <MenuItem value="national">National</MenuItem>
                                    <MenuItem value="state">State</MenuItem>
                                    <MenuItem value="district">District</MenuItem>
                                    <MenuItem value="block">Block</MenuItem>
                                    <MenuItem value="school">School</MenuItem>
                                </TextField>

                                <TextField type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={values.startDate} onChange={(e) => setFieldValue("startDate", e.target.value)} sx={inputSx} />

                                <TextField type="date" label="End Date" InputLabelProps={{ shrink: true }} value={values.endDate} onChange={(e) => setFieldValue("endDate", e.target.value)} sx={inputSx} />

                            </Box>

                            {/* INCLUDE COLUMNS */}
                            <Box mb="20px">
                                <Typography fontWeight="bold" mb={1} color="#fff">Include Columns:</Typography>
                                <FormGroup row>
                                    {Object.keys(values.includeColumns).map((key) => (
                                        <FormControlLabel
                                            key={key}
                                            label={allColumns.find((c) => c.field === key)?.headerName}
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

                            {/* DATA GRID */}
                            <Box height="70vh">
                                {dispenseReportLoading ? (
                                    <CircularProgress />
                                ) : (
                                    <DataGrid
                                        rows={data.map((row, i) => ({
                                            id: `${row.level}-${i}`,
                                            ...row,
                                        }))}
                                        columns={displayedColumns}
                                        // slots={{ toolbar: GridToolbar }}
                                        pageSizeOptions={[10, 25, 50]}
                                        localeText={{ noRowsLabel: "No data available for selected filters" }}
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
                                            "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.greenAccent[700], color: "#fff" },
                                            "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
                                            "& .MuiDataGrid-toolbarContainer": { color: "#fff" },
                                            "& .MuiDataGrid-toolbarContainer button": { color: "#fff !important" },
                                            "& .MuiDataGrid-toolbarContainer svg": { color: "#fff !important" },
                                            "& .MuiPaper-root": { backgroundColor: colors.primary[500], color: "#fff" },
                                        }}
                                    />
                                )}
                            </Box>

                            {/* SAVE MODAL */}
                            <Dialog
                                open={openSave}
                                onClose={() => setOpenSave(false)}
                                maxWidth="sm"
                                fullWidth
                            >
                                <DialogTitle sx={{ pb: 1 }}>
                                    {reportId ? "Update Report" : "Save Report"}
                                </DialogTitle>

                                <DialogContent
                                    sx={{
                                        pt: 4,   // ✅ more space for floating label
                                        pb: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 2,
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        label="Report Name"
                                        value={reportName}
                                        onChange={(e) => setReportName(e.target.value)}
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: {
                                                color: "#bbb",                 // default label
                                                "&.Mui-focused": { color: "#fff" },   // focus me white
                                                "&.MuiInputLabel-shrink": { color: "#fff" }, // jab value ho
                                            },
                                        }}
                                        InputProps={{
                                            sx: {
                                                color: "#fff", // text white
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "#777",
                                                },
                                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "#aaa",
                                                },
                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "#4caf50",
                                                },
                                            },
                                        }}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Description"
                                        multiline
                                        rows={4}
                                        value={description}
                                        onChange={(e) => {
                                            const text = e.target.value;
                                            if (text.length <= 200) setDescription(text);
                                        }}
                                        helperText={`${description.length}/200 words`}
                                        placeholder="Enter report description (max 200 words)"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: {
                                                color: "#bbb",                 // default label
                                                "&.Mui-focused": { color: "#fff" },   // focus me white
                                                "&.MuiInputLabel-shrink": { color: "#fff" }, // jab value ho
                                            },
                                        }}
                                        InputProps={{
                                            sx: {
                                                color: "#fff",
                                                "& textarea::placeholder": {
                                                    color: "#aaa",
                                                    opacity: 1,
                                                },
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "#777",
                                                },
                                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "#aaa",
                                                },
                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "#4caf50",
                                                },
                                            },
                                        }}
                                        FormHelperTextProps={{
                                            sx: { color: "#bbb", textAlign: "right" },
                                        }}
                                    />
                                </DialogContent>

                                <DialogActions sx={{ px: 3, pb: 2 }}>
                                    <Button onClick={() => setOpenSave(false)}>Cancel</Button>
                                    <Button
                                        variant="contained"
                                        disabled={!reportName || saveReportLoading}
                                        onClick={() => handleSaveOrUpdate(values)}
                                    >
                                        Save
                                    </Button>
                                </DialogActions>
                            </Dialog>

                            {/* ✅ SUMMARY */}
                            {summary && (
                                <Box
                                    borderRadius="8px"
                                    backgroundColor={colors.primary[500]}
                                >
                                    <Typography color="#fff" fontWeight="bold" mb={1}>
                                        Summary (As per Include)
                                    </Typography>

                                    <Typography color="#fff" mb={1}>
                                        <b>Period:</b> {summary.period}
                                    </Typography>

                                    <Box
                                        display="grid"
                                        gridTemplateColumns="1fr"
                                        gap="8px"
                                    >
                                        <Typography color="#fff">
                                            <b>Number of Days:</b> {summary.numberOfDays}
                                        </Typography>

                                        <Typography color="#fff">
                                            <b>Total Schoolgirls:</b> {summary.totalSchoolgirls}
                                        </Typography>

                                        <Typography color="#fff">
                                            <b>Total Machines Installed:</b> {summary.totalMachinesInstalled}
                                        </Typography>

                                        <Typography color="#fff">
                                            <b>Total Schools:</b> {summary.totalSchools}
                                        </Typography>

                                        <Typography color="#fff">
                                            <b>Total Pads Dispensed:</b> {summary.totalPadsDispensed}
                                        </Typography>

                                        <Typography color="#fff">
                                            <b>Average Consumption Rate:</b> {summary.averageConsumptionRate}
                                        </Typography>
                                    </Box>
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

export default DispenseReport;
