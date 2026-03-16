import {
    Box,
    IconButton,
    CircularProgress,
    useTheme,
    Typography,
    Dialog,
    DialogContent
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { tokens } from "../../../theme";
import { Header } from "../../../components";
import {
    deleteSavedReport,
    fetchAvgConsumptionReport,
    fetchMachineWiseDispenseRefill,
    fetchMachineWiseReport,
    fetchSavedReports,
    fetchStateDistrictWiseReport,
    fetchDispenseReport,
    viewSavedReport,
    clearSelectedSavedReport
} from "../../../store/reportsSlice";

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
    includeColumns: {}
};

/* =========================
   TABLE STYLES
========================= */
const thStyle = {
    border: "none",
    textAlign: "left",
    padding: "6px",
    fontSize: "12px",
    fontWeight: 600
};

const tdStyle = {
    border: "none",
    padding: "6px",
    fontSize: "11px"
};

/* =========================
   REPORT TYPE MAP
========================= */
const reportTypeMap = {
    "1": "dispense_report",
    "2": "machine_wise_dispense",
    "3": "state_district_wise_dispense",
    "4": "avg_consumption_comparison",
    "5": "machine_wise_dispense_refill",

    dispense_report: "dispense_report",
    machine_wise_dispense: "machine_wise_dispense",
    state_district_wise_dispense: "state_district_wise_dispense",
    avg_consumption_comparison: "avg_consumption_comparison",
    machine_wise_dispense_refill: "machine_wise_dispense_refill"
};

const reportTitleMap = {
    dispense_report: "Dispense Report",
    machine_wise_dispense: "Machine Wise Dispense & Utilization Report",
    state_district_wise_dispense: "State / District Wise Dispense Report",
    avg_consumption_comparison: "Average Consumption Comparison Report",
    machine_wise_dispense_refill: "Machine Wise Dispense & Refill Report"
};

const normalizeReportType = (value) => {
    if (value === undefined || value === null || value === "") return null;
    return reportTypeMap[String(value)] || String(value);
};

const formatColumnLabel = (key) => {
    return String(key).replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();
};

const formatCellValue = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    return value;
};

const SavedReports = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();

    const roleParam = params?.role || null;
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");

    const [openPdf, setOpenPdf] = useState(false);
    const [currentType, setCurrentType] = useState(null);

    const {
        machineWiseReport: { data: machineData = [], summary: machineSummary = null } = {},
        stateDistrictWiseReport: { data: stateDistrictData = [], summary: stateDistrictSummary = null } = {},
        machineWiseDispenseRefill: {
            data: machineWiseDispenseRefillData = [],
            summary: machineWiseDispenseRefillSummary = null
        } = {},
        avgConsumptionReport: avgConsumptionData = [],
        dispenseReport: { data: dispenseData = [], summary: dispenseSummary = null } = {},

        machineWiseLoading = false,
        stateDistrictWiseLoading = false,
        avgConsumptionLoading = false,
        machineWiseDispenseRefillLoading = false,
        dispenseReportLoading = false,

        savedReports = [],
        savedReportsLoading = false,
        selectedSavedReport = null,
        viewSavedReportLoading = false
    } = useSelector((state) => state.reports);

    const filters = selectedSavedReport?.filters || defaultFilters;
    const includeColumns = filters?.includeColumns || {};

    /* =========================
       INITIAL LOAD
    ========================= */
    useEffect(() => {
        if (token) {
            dispatch(fetchSavedReports({ token, role: roleParam }));
        }
    }, [dispatch, token, roleParam]);

    /* =========================
       DIALOG HANDLERS
    ========================= */
    const handleClosePdf = () => {
        setOpenPdf(false);
        setCurrentType(null);
        dispatch(clearSelectedSavedReport());
    };

    const handleView = async (row) => {
        try {
            const result = await dispatch(viewSavedReport({ token, id: row.id })).unwrap();

            const normalizedType = normalizeReportType(
                result?.reportType || row?.report_type || row?.reportType
            );

            setCurrentType(normalizedType);
            setOpenPdf(true);
        } catch (error) {
            console.error("View report failed:", error);
        }
    };

    const handleEdit = async (row) => {
        try {
            const data = await dispatch(viewSavedReport({ token, id: row.id })).unwrap();

            const normalizedType = normalizeReportType(
                data?.reportType || row?.report_type || row?.reportType
            );

            navigate(`/reports/${normalizedType}/edit/${row.id}`);
        } catch (error) {
            console.error("Edit report failed:", error);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this report?")) {
            dispatch(deleteSavedReport({ token, id }));
        }
    };

    /* =========================
       FETCH REPORT DATA FOR VIEW
    ========================= */
    useEffect(() => {
        if (!openPdf || !selectedSavedReport?.filters || !currentType || !token) return;

        const payload = {
            token,
            ...selectedSavedReport.filters
        };

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
    }, [openPdf, selectedSavedReport, currentType, token, dispatch]);

    /* =========================
       EXPORT PDF
    ========================= */
    const exportToPdf = async () => {
        const element = document.getElementById("pdf-content");
        if (!element) return;

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            scrollY: -window.scrollY
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

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(`${selectedSavedReport?.reportName || "report"}.pdf`);
    };

    /* =========================
       DATAGRID COLUMNS
    ========================= */
    const columns = [
        {
            field: "srNo",
            headerName: "Sr No",
            width: 80,
            sortable: false,
            filterable: false,
            renderCell: (params) => params.api.getRowIndexRelativeToVisibleRows(params.id) + 1
        },
        {
            field: "report_name",
            headerName: "Report Name",
            flex: 1,
            valueGetter: (params) => params.row.report_name || params.row.reportName || "-"
        },
        {
            field: "owner_name",
            headerName: "Owner",
            flex: 1,
            valueGetter: (params) => params.row.owner_name || params.row.ownerName || "-"
        },
        {
            field: "created_at",
            headerName: "Created On",
            flex: 1,
            valueGetter: (params) => {
                const value = params.row.created_at || params.row.createdAt;
                return value ? new Date(value).toLocaleDateString() : "-";
            }
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            sortable: false,
            filterable: false,
            renderCell: ({ row }) => (
                <>
                    <IconButton title="View" onClick={() => handleView(row)}>
                        <VisibilityOutlined />
                    </IconButton>

                    {(roleParam !== "user") && (
                        <IconButton title="Edit" onClick={() => handleEdit(row)}>
                            <EditOutlined />
                        </IconButton>
                    )}

                    {(role === "superadmin" || role === "admin") && (
                        <>
                            <IconButton title="Delete" onClick={() => handleDelete(row.id)}>
                                <DeleteOutlined />
                            </IconButton>
                        </>
                    )}
                </>
            )
        }
    ];

    /* =========================
       PDF DATA / SUMMARY / TITLE
    ========================= */
    const { pdfData, pdfSummary, reportTitle } = useMemo(() => {
        if (currentType === "machine_wise_dispense") {
            return {
                pdfData: machineData,
                pdfSummary: machineSummary,
                reportTitle: reportTitleMap.machine_wise_dispense
            };
        }

        if (currentType === "state_district_wise_dispense") {
            return {
                pdfData: stateDistrictData,
                pdfSummary: stateDistrictSummary,
                reportTitle: reportTitleMap.state_district_wise_dispense
            };
        }

        if (currentType === "avg_consumption_comparison") {
            return {
                pdfData: avgConsumptionData,
                pdfSummary: null,
                reportTitle: reportTitleMap.avg_consumption_comparison
            };
        }

        if (currentType === "machine_wise_dispense_refill") {
            return {
                pdfData: machineWiseDispenseRefillData,
                pdfSummary: machineWiseDispenseRefillSummary,
                reportTitle: reportTitleMap.machine_wise_dispense_refill
            };
        }

        if (currentType === "dispense_report") {
            return {
                pdfData: dispenseData,
                pdfSummary: dispenseSummary,
                reportTitle: reportTitleMap.dispense_report
            };
        }

        return {
            pdfData: [],
            pdfSummary: null,
            reportTitle: ""
        };
    }, [
        currentType,
        machineData,
        machineSummary,
        stateDistrictData,
        stateDistrictSummary,
        avgConsumptionData,
        machineWiseDispenseRefillData,
        machineWiseDispenseRefillSummary,
        dispenseData,
        dispenseSummary
    ]);

    const isReportLoading =
        viewSavedReportLoading ||
        (currentType === "machine_wise_dispense" && machineWiseLoading) ||
        (currentType === "state_district_wise_dispense" && stateDistrictWiseLoading) ||
        (currentType === "avg_consumption_comparison" && avgConsumptionLoading) ||
        (currentType === "machine_wise_dispense_refill" && machineWiseDispenseRefillLoading) ||
        (currentType === "dispense_report" && dispenseReportLoading);

    const headerTitle =
        !roleParam
            ? "My Reports"
            : roleParam === "user"
                ? "Users Report"
                : roleParam === "admin"
                    ? "Admins Report"
                    : roleParam === "superadmin"
                        ? "Superadmin Reports"
                        : "Saved Reports";

    return (
        <>
            <Box m="20px">
                <Header title={headerTitle} subtitle="View, edit or delete reports" />

                <Box height="70vh">
                    {savedReportsLoading ? (
                        <CircularProgress />
                    ) : (
                        <DataGrid
                            rows={savedReports || []}
                            columns={columns}
                            getRowId={(row) => row.id}
                            pageSizeOptions={[10, 25]}
                            sx={{
                                border: "none",
                                "& .MuiDataGrid-columnHeaders": {
                                    backgroundColor: colors.greenAccent[700],
                                    color: "#fff"
                                },
                                "& .MuiDataGrid-virtualScroller": {
                                    backgroundColor: colors.primary[400]
                                },
                                "& .MuiDataGrid-footerContainer": {
                                    backgroundColor: colors.primary[500]
                                }
                            }}
                            localeText={{
                                noRowsLabel: "No saved reports found"
                            }}
                        />
                    )}
                </Box>
            </Box>

            <Dialog open={openPdf} onClose={handleClosePdf} maxWidth="lg" fullWidth>
                <Box display="flex" justifyContent="space-between" p={2}>
                    <Typography variant="h6">
                        {selectedSavedReport?.reportName || "Report Preview"}
                    </Typography>

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
                    {isReportLoading ? (
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

                            <Typography variant="body2" mb={2}>
                                <b>Period:</b> {filters?.startDate} to {filters?.endDate}
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
                                                        {formatColumnLabel(col)}
                                                    </th>
                                                ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {pdfData?.length > 0 ? (
                                            pdfData.map((row, index) => (
                                                <tr
                                                    key={index}
                                                    style={{
                                                        backgroundColor: index % 2 === 0 ? "#ffffff" : "#f7f7f7"
                                                    }}
                                                >
                                                    <td style={tdStyle}>{index + 1}</td>

                                                    {Object.keys(includeColumns)
                                                        .filter((k) => includeColumns[k])
                                                        .map((col) => (
                                                            <td key={col} style={tdStyle}>
                                                                {formatCellValue(row?.[col])}
                                                            </td>
                                                        ))}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={Object.keys(includeColumns).filter((k) => includeColumns[k]).length + 1}
                                                    style={{
                                                        textAlign: "center",
                                                        padding: "16px",
                                                        color: "#666"
                                                    }}
                                                >
                                                    No data found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </Box>

                            {pdfSummary && Object.keys(pdfSummary).length > 0 && (
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
                                                fontSize: "13px"
                                            }}
                                        >
                                            <Typography sx={{ fontWeight: 500 }}>
                                                {formatColumnLabel(k)}
                                            </Typography>
                                            <Typography sx={{ marginLeft: "20px" }}>
                                                {formatCellValue(v)}
                                            </Typography>
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