import {
  Box,
  Button,
  Typography,
  useTheme,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  useMediaQuery,
} from "@mui/material";
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import {
  fetchRefillingHistory,
  fetchRefillingHistoryExportData,
} from "../../store/dispenseSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

const getDateRange = (option) => {
  const now = dayjs();

  switch (option) {
    case "Today":
      return { start: now.startOf("day"), end: now.endOf("day") };

    case "Yesterday":
      return {
        start: now.subtract(1, "day").startOf("day"),
        end: now.subtract(1, "day").endOf("day"),
      };

    case "Last 7 Days":
      return {
        start: now.subtract(6, "day").startOf("day"),
        end: now.endOf("day"),
      };

    case "Last Calendar Week":
      return {
        start: now.startOf("week").subtract(1, "week"),
        end: now.startOf("week").subtract(1, "day").endOf("day"),
      };

    case "Last 30 Days":
      return {
        start: now.subtract(29, "day").startOf("day"),
        end: now.endOf("day"),
      };

    case "Last Calendar Month":
      return {
        start: now.subtract(1, "month").startOf("month"),
        end: now.subtract(1, "month").endOf("month"),
      };

    case "Last 90 Days":
      return {
        start: now.subtract(89, "day").startOf("day"),
        end: now.endOf("day"),
      };

    case "Last Calendar Quarter": {
      const quarter = Math.floor(now.month() / 3);
      const startQuarter = dayjs(new Date(now.year(), quarter * 3 - 3, 1));
      const endQuarter = startQuarter.add(2, "month").endOf("month");
      return { start: startQuarter.startOf("month"), end: endQuarter };
    }

    default:
      return { start: null, end: null };
  }
};

const RefillingHistory = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateError, setDateError] = useState("");
  const [presetRange, setPresetRange] = useState("");

  const [filterModel, setFilterModel] = useState({
    items: [
      {
        id: 1,
        field: "machineId",
        operator: "equals",
        value: "",
      },
    ],
    logicOperator: "and",
  });

  const [debouncedFilter, setDebouncedFilter] = useState(filterModel);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    refillingDetails,
    refillingLoading,
    refillingError,
    exportRefillingLoading,
  } = useSelector((state) => state.dispense);

  const token = localStorage.getItem("authToken");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilter(filterModel);
    }, 300);

    return () => clearTimeout(handler);
  }, [filterModel]);

  useEffect(() => {
    if (!token) return;

    const filters = (debouncedFilter.items || [])
      .filter(
        (item) =>
          item?.value !== undefined &&
          item?.value !== null &&
          item?.value !== ""
      )
      .map((item) => ({
        field: item.field,
        operator: item.operator || "equals",
        value: item.value,
      }));

    dispatch(
      fetchRefillingHistory({
        token,
        page: page + 1,
        pageSize,
        startDate,
        endDate,
        filters,
      })
    );
  }, [dispatch, token, page, pageSize, startDate, endDate, debouncedFilter]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDateForAPI = (date) => {
    if (!date) return null;
    return dayjs(date).format("YYYY-MM-DD");
  };

  const handleExport = async () => {
    if (!token) return;

    try {
      const filters = (debouncedFilter.items || [])
        .filter(
          (item) =>
            item?.value !== undefined &&
            item?.value !== null &&
            item?.value !== ""
        )
        .map((item) => ({
          field: item.field,
          operator: item.operator || "equals",
          value: item.value,
        }));

      const resultAction = await dispatch(
        fetchRefillingHistoryExportData({
          token,
          startDate: formatDateForAPI(startDate),
          endDate: formatDateForAPI(endDate),
          filters,
        })
      );

      if (fetchRefillingHistoryExportData.fulfilled.match(resultAction)) {
        const rows = resultAction.payload.data || [];

        const headers = [
          "Refill ID",
          "Machine ID",
          "Date",
          "Remaining Stock",
          "School Name",
          "State",
          "District",
          "Block",
          "School Spoc",
          "NGO Spoc",
          "Status Indicator",
        ];

        const csvRows = [
          headers.join(","),
          ...rows.map((row) =>
            [
              row.id,
              row.machineId,
              formatDate(row.createdAt),
              row.stock,
              row.school?.schoolName || "",
              row.school?.state || "",
              row.school?.schoolDistrict || "",
              row.school?.schoolBlock || "",
              row.school?.schoolSpocName || "",
              row.school?.ngoSpocName || "",
              row.statusIndicator || "",
            ]
              .map((val) => `"${val ?? ""}"`)
              .join(",")
          ),
        ];

        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvRows.join("\n")], {
          type: "text/csv;charset=utf-8;",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "RefillHistoryData.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const columns = [
    { field: "id", headerName: "Refill ID", flex: 1 },

    {
      field: "machineId",
      headerName: "Machine ID",
      flex: 1,
      renderCell: (params) => (
        <Typography
          color="secondary"
          sx={{ cursor: "pointer", fontWeight: "bold" }}
          onClick={() =>
            navigate(`/dispenseHistoryMachine/${params.row?.machineId}`)
          }
        >
          {params.value}
        </Typography>
      ),
    },

    { field: "createdAt", headerName: "Date", flex: 1.3 },
    { field: "stock", headerName: "Remaining Stock", flex: 1 },

    {
      field: "schoolName",
      headerName: "School Name",
      flex: 1.3,
      valueGetter: (params) => params.row?.school?.schoolName || "",
    },
    {
      field: "schoolState",
      headerName: "State",
      flex: 1,
      valueGetter: (params) => params.row?.school?.state || "",
    },
    {
      field: "schoolDistrict",
      headerName: "District",
      flex: 1.2,
      valueGetter: (params) => params.row?.school?.schoolDistrict || "",
    },
    {
      field: "schoolBlock",
      headerName: "Block",
      flex: 1,
      valueGetter: (params) => params.row?.school?.schoolBlock || "",
    },
    {
      field: "schoolSpocName",
      headerName: "School Spoc",
      flex: 1.3,
      valueGetter: (params) => params.row?.school?.schoolSpocName || "",
    },
    {
      field: "ngoSpocName",
      headerName: "NGO Spoc",
      flex: 1.3,
      valueGetter: (params) => params.row?.school?.ngoSpocName || "",
    },
    {
      field: "statusIndicator",
      headerName: "Status Indicator",
      filterable: false,
      sortable: false,
      flex: 1,
      renderCell: () => (
        <Box display="flex" justifyContent="center" width="100%">
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "green",
              display: "inline-block",
            }}
          />
        </Box>
      ),
    },
  ];

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <Button
          color="secondary"
          onClick={handleExport}
          disabled={exportRefillingLoading}
          startIcon={<FileDownloadOutlinedIcon />}
          sx={{ fontSize: "0.6964285714285714rem" }}
        >
          {exportRefillingLoading ? "Exporting..." : "Export"}
        </Button>
      </GridToolbarContainer>
    );
  };

  const rows = (refillingDetails?.data || []).map((item) => ({
    ...item,
    id: item.id,
    createdAt: formatDate(item.createdAt),
  }));

  const handleClearDateRange = () => {
    setStartDate(null);
    setEndDate(null);
    setDateError("");
    setPresetRange("");
    setPage(0);
  };

  const validateDateRange = (start, end) => {
    if (start && end && dayjs(end).isBefore(dayjs(start))) {
      setDateError("End date cannot be earlier than start date.");
    } else {
      setDateError("");
    }
  };

  if (refillingError) {
    return <Typography color="error">Error: {refillingError}</Typography>;
  }

  return (
    <Box m="20px">
      {exportRefillingLoading && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 13000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              background: "#ffffff00",
              p: 3,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <CircularProgress color="secondary" />
            <Typography>Exporting data, please wait…</Typography>
          </Box>
        </Box>
      )}

      <Header
        title="Refilling History"
        subtitle="List of Refilling History for All Vending Machines"
      />

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box display="flex" flexWrap="wrap" gap="20px" mb="20px" alignItems="center">
          <Box display="flex" gap="20px" flexWrap="wrap">
            <DatePicker
              label="Start Date"
              value={startDate ? dayjs(startDate) : null}
              maxDate={dayjs()}
              onChange={(newValue) => {
                const date = newValue ? newValue.toDate() : null;
                setStartDate(date);
                setPresetRange("");
                setPage(0);
                validateDateRange(date, endDate);
              }}
              sx={{ width: 170 }}
            />

            <DatePicker
              label="End Date"
              value={endDate ? dayjs(endDate) : null}
              minDate={startDate ? dayjs(startDate) : null}
              maxDate={
                startDate
                  ? dayjs(startDate).add(3, "month").isBefore(dayjs())
                    ? dayjs(startDate).add(3, "month")
                    : dayjs()
                  : dayjs()
              }
              onChange={(newValue) => {
                const date = newValue ? newValue.toDate() : null;
                setEndDate(date);
                setPresetRange("");
                setPage(0);
                validateDateRange(startDate, date);
              }}
              sx={{ width: 170 }}
            />

            <FormControl sx={{ width: 220, mt: isMobile ? 2 : 0 }}>
              <InputLabel
                sx={{
                  color: "text.primary",
                  "&.Mui-focused": { color: "text.primary" },
                  "&.MuiInputLabel-shrink": { color: "text.primary" },
                }}
              >
                Quick Ranges
              </InputLabel>

              <Select
                value={presetRange}
                label="Quick Ranges"
                onChange={(e) => {
                  const value = e.target.value;
                  setPresetRange(value);
                  const { start, end } = getDateRange(value);
                  setStartDate(start?.toDate() || null);
                  setEndDate(end?.toDate() || null);
                  setDateError("");
                  setPage(0);
                }}
                sx={{
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "text.primary",
                  },
                }}
              >
                <MenuItem value="Today">Today</MenuItem>
                <MenuItem value="Yesterday">Yesterday</MenuItem>
                <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
                <MenuItem value="Last Calendar Week">Last Calendar Week</MenuItem>
                <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
                <MenuItem value="Last Calendar Month">Last Calendar Month</MenuItem>
                <MenuItem value="Last 90 Days">Last 90 Days</MenuItem>
                <MenuItem value="Last Calendar Quarter">Last Calendar Quarter</MenuItem>
              </Select>
            </FormControl>

            <Button variant="outlined" color="secondary" onClick={handleClearDateRange}>
              Clear Filter
            </Button>
          </Box>
        </Box>
      </LocalizationProvider>

      {dateError && (
        <Typography color="error" mb={2}>
          {dateError}
        </Typography>
      )}

      <Box
        height="70vh"
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
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.gray[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={refillingDetails?.total || 0}
          loading={refillingLoading}
          slots={{ toolbar: CustomToolbar }}
          paginationMode="server"
          filterMode="server"
          sortingMode="server"
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={({ page, pageSize }) => {
            setPage(page);
            setPageSize(pageSize);
          }}
          pageSizeOptions={[100, 500, 1000]}
          filterModel={filterModel}
          onFilterModelChange={(newModel) => {
            setFilterModel(newModel);
            setPage(0);
          }}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default RefillingHistory;