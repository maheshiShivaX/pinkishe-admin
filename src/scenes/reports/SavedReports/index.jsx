import {
    Box,
    IconButton,
    CircularProgress,
    useTheme,
    Typography
} from "@mui/material";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { tokens } from "../../../theme";
import { Header } from "../../../components";
import {
    deleteSavedReport,
    fetchAvgConsumptionReport,
    fetchMachineWiseReport,
    fetchSavedReports,
    fetchStateDistrictWiseReport,
    viewSavedReport,
    fetchMachineWiseDispenseRefill,
    fetchDispenseReport
} from "../../../store/reportsSlice";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useState } from "react";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import { useParams } from "react-router-dom";

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
   DEFAULT FILTERS
========================= */
const defaultFilters = {
    states: [],
    districts: [],
    startDate: formatDate(thirtyOneDaysAgo),
    endDate: formatDate(yesterday),
    dispenseType: "all",
    includeColumns: {},
};

const thStyle = {
    border: "none",
    textAlign: "left",
    padding: "6px",
    fontSize: "12px",     // header thoda bold & clear
    fontWeight: 600,
};

const tdStyle = {
    border: "none",
    padding: "6px",
    fontSize: "11px",     // 👈 data font chhota
};

const SavedReports = () => {
    const theme = useTheme();
    const params = useParams();
    const type = params?.role;
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");
    const [openPdf, setOpenPdf] = useState(false);
    const [currentType, setCurrentType] = useState(null);

    const {
        machineWiseReport: { data: machineData = [], summary: machineSummary = null } = {},
        stateDistrictWiseReport: { data: stateDistrictData = [], summary: stateDistrictSummary = null } = {},
        machineWiseDispenseRefill: { data: machineWiseDispenseRefillData = [], summary: machineWiseDispenseRefillSummary = null } = {},
        avgConsumptionReport: avgConsumptionData = [],
        dispenseReport: { data: dispenseData = [], summary: dispenseSummary = null } = {},
        dispenseReportLoading,
        savedReports,
        savedReportsLoading,
        selectedSavedReport,
        machineWiseLoading,
    } = useSelector((state) => state.reports);

    /* =========================
          SAFE DERIVED VALUES
       ========================= */
    const filters = selectedSavedReport?.filters || defaultFilters;
    const includeColumns = filters.includeColumns || {};

    /* =========================
       INITIAL LOAD
    ========================= */
    useEffect(() => {
        if (token) {
            dispatch(fetchSavedReports({ token, type }));
        }
    }, [dispatch, token, type]);

    /* =========================
       VIEW PDF
    ========================= */
    const handleView = (row) => {
        setCurrentType(row.report_type);

        dispatch(viewSavedReport({ token, id: row.id }))
            .unwrap()
            .then(() => setOpenPdf(true));
    };

    const handleEdit = (row) => {
        dispatch(viewSavedReport({ token, id: row.id }))
            .unwrap()
            .then(() => {
                navigate(`/reports/${row?.report_type}/edit/${row.id}`);
            });
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this report?")) {
            dispatch(deleteSavedReport({ token, id }));
        }
    };

    /* =========================
         FETCH DATA FOR PDF
      ========================== */
    useEffect(() => {
        if (!openPdf || !selectedSavedReport?.filters) return;

        const payload = { token, ...selectedSavedReport.filters };

        if (currentType === "machine_wise_dispense") {
            dispatch(fetchMachineWiseReport(payload));
        } else if (currentType === "state_district_wise_dispense") {
            dispatch(fetchStateDistrictWiseReport(payload));
        } else if (currentType === "avg_consumption_comparison") {
            dispatch(fetchAvgConsumptionReport(payload));
        } else if (currentType === "machine_wise_dispense_refill") {
            dispatch(fetchMachineWiseDispenseRefill(payload));
        } else if (currentType === "dispense_report") {
            dispatch(fetchDispenseReport(payload));
        }
    }, [openPdf, currentType, selectedSavedReport, dispatch, token]);

    /* =========================
       EXPORT PDF
    ========================== */
    const exportToPdf = async () => {
        const element = document.getElementById("pdf-content");
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            scrollY: -window.scrollY,
        });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Add remaining pages
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(`${selectedSavedReport?.reportName || "report"}.pdf`);
    };

    const columns = [
        {
            field: "srNo",
            headerName: "Sr No",
            width: 80,
            sortable: false,
            filterable: false,
            renderCell: (params) =>
                params.api.getRowIndexRelativeToVisibleRows(params.id) + 1,
        },
        {
            field: "report_name",
            headerName: "Report Name",
            flex: 1,
        },
        // {
        //     field: "report_type",
        //     headerName: "Report Type",
        //     flex: 2,
        // },
        {
            field: "owner_name",
            headerName: "Owner",
            flex: 1,
        },
        {
            field: "created_at",
            headerName: "Created On",
            flex: 1,
            valueGetter: (params) =>
                new Date(params.value).toLocaleDateString(),
        },
        {
            headerName: "Actions",
            flex: 1,
            renderCell: ({ row }) => (
                <>
                    <IconButton
                        title="View"
                        onClick={() => handleView(row)}
                    >
                        <VisibilityOutlined />
                    </IconButton>

                    <IconButton
                        title="Edit"
                        onClick={() => handleEdit(row)}
                    >
                        <EditOutlined />
                    </IconButton>

                    <IconButton
                        title="Delete"
                        onClick={() => handleDelete(row.id)}
                    >
                        <DeleteOutlined />
                    </IconButton>
                </>
            ),
        },
    ];

    /* =========================
    DETERMINE PDF DATA BASED ON REPORT TYPE
    ========================== */
    let pdfData = [];
    let pdfSummary = null;
    let reportTitle = "";

    if (currentType === "machine_wise_dispense") {
        pdfData = machineData;
        pdfSummary = machineSummary;
        reportTitle = "Machine Wise Dispense & Utilization Report";
    } else if (currentType === "state_district_wise_dispense") {
        pdfData = stateDistrictData;
        pdfSummary = stateDistrictSummary;
        reportTitle = "State/District Wise Dispense Report";
    } else if (currentType === "avg_consumption_comparison") {
        pdfData = avgConsumptionData; // now correctly filled
        pdfSummary = null;
        reportTitle = "Average Consumption Comparison Report";
    } else if (currentType === "machine_wise_dispense_refill") {
        pdfData = machineWiseDispenseRefillData;
        pdfSummary = machineWiseDispenseRefillSummary;
        reportTitle = "Machine Wise Dispense & Refill Report";
    } else if (currentType === "dispense_report") {
        pdfData = dispenseData;
        pdfSummary = dispenseSummary;
        reportTitle = "Dispense Report";
    }

    return (
        <>
            <Box m="20px">
                <Header
                    title={
                        role === "user"
                            ? "My Reports"
                            : (role === "superadmin" && type === "user" || role === "admin" && type === "user")
                                ? "Users Report"
                                : (type === "admin") ? "Standard Reports" : "Saved Reports"
                    }
                    subtitle="View, edit or delete reports"
                />

                <Box height="70vh">
                    {savedReportsLoading ? (
                        <CircularProgress />
                    ) : (
                        <DataGrid
                            rows={savedReports}
                            columns={columns}
                            getRowId={(row) => row.id}
                            pageSizeOptions={[10, 25]}
                            sx={{
                                border: "none",
                                "& .MuiDataGrid-columnHeaders": {
                                    backgroundColor: colors.greenAccent[700],
                                    color: "#fff",
                                },
                                "& .MuiDataGrid-virtualScroller": {
                                    backgroundColor: colors.primary[400],
                                },
                                "& .MuiDataGrid-footerContainer": {
                                    backgroundColor: colors.primary[500],
                                },
                            }}
                            localeText={{
                                noRowsLabel: "No saved reports found",
                            }}
                        />
                    )}
                </Box>
            </Box>


            {/* ========================= PDF DIALOG ========================= */}
            <Dialog open={openPdf} onClose={() => setOpenPdf(false)} maxWidth="lg" fullWidth>
                <Box display="flex" justifyContent="space-between" p={2}>
                    <Typography variant="h6">{selectedSavedReport?.reportName}</Typography>
                    <Box>
                        <IconButton onClick={() => window.print()}>
                            <PrintOutlinedIcon />
                        </IconButton>
                        <IconButton onClick={exportToPdf}>
                            <DownloadOutlinedIcon />
                        </IconButton>
                    </Box>
                </Box>

                <DialogContent dividers>
                    {machineWiseLoading ? (
                        <CircularProgress />
                    ) : (
                        <Box
                            id="pdf-content"
                            p={3}
                            bgcolor="#fff"
                            color="#000"
                            sx={{ width: "100%", overflow: "visible" }}
                        >
                            <Typography variant="h6" align="center" gutterBottom>
                                {reportTitle}
                            </Typography>

                            <Typography variant="body2">
                                <b>Period:</b> {filters.startDate} to {filters.endDate}
                            </Typography>

                            <Box mt={2}>
                                <table
                                    width="100%"
                                    cellPadding="8"
                                    style={{ borderCollapse: "collapse", fontSize: "12px" }}
                                >
                                    <thead>
                                        <tr style={{ backgroundColor: "#f1f1f1", fontWeight: "bold" }}>
                                            <th style={thStyle}>Sr No</th>
                                            {Object.keys(includeColumns)
                                                .filter((k) => includeColumns[k])
                                                .map((col) => (
                                                    <th key={col} style={thStyle}>
                                                        {col.replace(/([A-Z])/g, " $1").trim()}
                                                    </th>
                                                ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pdfData.map((row, index) => (
                                            <tr
                                                key={index}
                                                style={{
                                                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f7f7f7",
                                                }}
                                            >
                                                <td style={tdStyle}>{index + 1}</td>
                                                {Object.keys(includeColumns)
                                                    .filter((k) => includeColumns[k])
                                                    .map((col) => (
                                                        <td key={col} style={tdStyle}>
                                                            {row[col] ?? "-"}
                                                        </td>
                                                    ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Box>

                            {pdfSummary && (
                                <Box mt={3}>
                                    <Typography fontWeight="bold" mb={1}>
                                        Summary
                                    </Typography>
                                    {Object.entries(pdfSummary).map(([k, v]) => (
                                        <Box
                                            key={k}
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                padding: "6px 0",
                                                borderBottom: "1px solid #eee",
                                                fontSize: "13px",
                                            }}
                                        >
                                            <Typography sx={{ fontWeight: 500 }}>{k}</Typography>
                                            <Typography sx={{ marginLeft: "20px" }}>{v}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default SavedReports;
