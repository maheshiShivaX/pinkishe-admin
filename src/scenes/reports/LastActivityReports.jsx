import {
    Box,
    CircularProgress,
    useTheme,
} from "@mui/material";
import { Header } from "../../components";
import { tokens } from "../../theme";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchLastActivityReport } from "../../store/reportsSlice";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

/* =========================
   LAST ACTIVITY REPORT
========================= */
const LastActivityReport = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();

    const token = localStorage.getItem("authToken");

    const {
        lastActivityReport: { data = [] } = {},
        lastActivityLoading,
    } = useSelector((state) => state.reports);

    /* =========================
       FETCH DATA
    ========================= */
    useEffect(() => {
        if (!token) return;
        dispatch(fetchLastActivityReport({ token }));
    }, [dispatch, token]);

    /* =========================
       TABLE COLUMNS
    ========================= */
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
            field: "schoolDisplay",
            headerName: "School Name",
            flex: 2.5,
            valueGetter: (params) => {
                const machineId = params.row?.machineId ?? "";
                const schoolName = params.row?.schoolName ?? "";
                return `${machineId}_${schoolName}`;
            },
        },
        {
            field: "lastDispenseDate",
            headerName: "Last Dispense Date",
            flex: 1.5,
            valueGetter: (params) =>
                params.value ? new Date(params.value).toLocaleString() : "-",
        },
        {
            field: "lastRefillDate",
            headerName: "Last Refill Date",
            flex: 1.5,
            valueGetter: (params) =>
                params.value ? new Date(params.value).toLocaleString() : "-",
        },
    ];

    return (
        <Box m="20px">
            <Header
                title="Last Activity Report"
                subtitle="Latest dispense and refill activity per machine"
            />

            <Box height="70vh" mt="20px">
                {lastActivityLoading ? (
                    <CircularProgress />
                ) : (
                    <DataGrid
                        rows={data.map((row, i) => ({
                            id: `${row.machineId}-${i}`,
                            ...row,
                        }))}
                        columns={columns}
                        slots={{ toolbar: GridToolbar }}   // ✅ DEFAULT TOOLBAR
                        pageSizeOptions={[10, 25, 50]}
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
                        }}
                    />
                )}
            </Box>
        </Box>
    );
};

export default LastActivityReport;
