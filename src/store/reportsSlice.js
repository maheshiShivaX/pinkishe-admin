import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import config from "../config";

/* =========================
   INITIAL STATE
========================= */
const initialState = {
    /* -------- Machine Wise -------- */
    machineWiseReport: {
        data: [],
        summary: null,
    },
    machineWiseLoading: false,
    machineWiseError: null,

    /* -------- State / District Wise -------- */
    stateDistrictWiseReport: {
        data: [],
        summary: null,
    },
    stateDistrictWiseLoading: false,
    stateDistrictWiseError: null,

    /* -------- Avg Consumption -------- */
    avgConsumptionReport: [],
    avgConsumptionLoading: false,
    avgConsumptionError: null,

    /* ✅ FIXED STRUCTURE */
    machineWiseDispenseRefill: {
        data: [],
        summary: null,
    },
    machineWiseDispenseRefillLoading: false,
    machineWiseDispenseRefillError: null,

    savedReports: [],
    savedReportsLoading: false,
    savedReportsError: null,

    saveReportLoading: false,
    saveReportError: null,

    deleteReportLoading: false,
    deleteReportError: null,

    selectedSavedReport: null,
    viewSavedReportLoading: false,
    viewSavedReportError: null,

    dispenseReport: {
        data: [],
        summary: null,
    },
    dispenseReportLoading: false,
    dispenseReportError: null,


    /* -------- Last Activity Report -------- */
    lastActivityReport: {
        data: [],
    },
    lastActivityLoading: false,
    lastActivityError: null,

};

/* =========================
   MACHINE WISE REPORT
========================= */
export const fetchMachineWiseReport = createAsyncThunk(
    "reports/fetchMachineWiseReport",
    async (
        { token, states = [], districts = [], startDate, endDate, dispenseType = "all" },
        { rejectWithValue }
    ) => {
        try {
            const response = await fetch(
                `${config.apiUrl}/api/reports/machine-wise`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        states,
                        districts,
                        startDate,
                        endDate,
                        dispenseType,
                    }),
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            return data; // ✅ { data, summary }
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/* =========================
   STATE / DISTRICT WISE REPORT
========================= */
export const fetchStateDistrictWiseReport = createAsyncThunk(
    "reports/fetchStateDistrictWiseReport",
    async (
        { token, states = [], districts = [], startDate, endDate, dispenseType = "all" },
        { rejectWithValue }
    ) => {
        try {
            const response = await fetch(
                `${config.apiUrl}/api/reports/state-district-wise`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ states, districts, startDate, endDate, dispenseType }),
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data; // ✅ IMPORTANT
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/* =========================
   AVG CONSUMPTION COMPARISON
========================= */
export const fetchAvgConsumptionReport = createAsyncThunk(
    "reports/fetchAvgConsumptionReport",
    async (
        {
            token,
            states = [],
            districts = [],
            startDate,
            endDate,
            dispenseType = "all",
            minRange,
            maxRange,
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await fetch(
                `${config.apiUrl}/api/reports/avgconsumption-comparison-report`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        states,
                        districts,
                        startDate,
                        endDate,
                        dispenseType,
                        minRange,
                        maxRange,
                    }),
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data.data || [];
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


/* =========================
   MACHINE WISE DISPENSE & REFILL
========================= */
export const fetchMachineWiseDispenseRefill = createAsyncThunk(
    "reports/fetchMachineWiseDispenseRefill",
    async (
        { token, states = [], districts = [], startDate, endDate, dispenseType = "all" },
        { rejectWithValue }
    ) => {
        try {
            const response = await fetch(
                `${config.apiUrl}/api/reports/machine-wise-dispense-refill`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        states,
                        districts,
                        startDate,
                        endDate,
                        dispenseType,
                    }),
                }
            );

            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            /* ✅ IMPORTANT */
            return result; // { data, summary }
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/* =========================
   SAVE REPORT
========================= */
export const saveReport = createAsyncThunk(
    "reports/saveReport",
    async (
        { token, reportType, reportName, description, filters, summary },
        { rejectWithValue }
    ) => {
        try {
            const response = await fetch(
                `${config.apiUrl}/api/reports/save`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        reportType,
                        reportName,
                        description,
                        filters,
                        summary,
                    }),
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchSavedReports = createAsyncThunk(
    "reports/fetchSavedReports",
    async ({ token, type }, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${config.apiUrl}/api/reports/getReports?type=${type}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteSavedReport = createAsyncThunk(
    "reports/deleteSavedReport",
    async ({ token, id }, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${config.apiUrl}/api/reports/deleteSavedReport/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            return id; // deleted id
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const viewSavedReport = createAsyncThunk(
    "reports/viewSavedReport",
    async ({ token, id }, { rejectWithValue }) => {
        try {
            const res = await fetch(
                `${config.apiUrl}/api/reports/viewSavedReport/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            return data.data; // { reportType, filters, reportName }
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const updateSavedReport = createAsyncThunk(
    "reports/updateSavedReport",
    async ({ token, id, reportName, description, filters }, { rejectWithValue }) => {
        try {
            const res = await fetch(
                `${config.apiUrl}/api/reports/updateSavedReport/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        reportName,
                        description,
                        filters,
                    }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            return data.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/* =========================
DISPENSE REPORT
========================= */
export const fetchDispenseReport = createAsyncThunk(
    "reports/fetchDispenseReport",
    async (
        {
            token,
            level = "national",
            startDate,
            endDate,
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await fetch(
                `${config.apiUrl}/api/reports/dispense-report`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        level,
                        startDate,
                        endDate,
                    }),
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            return data; // { status, level, data, summary }
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/* =========================
   LAST ACTIVITY REPORT
========================= */
export const fetchLastActivityReport = createAsyncThunk(
    "reports/fetchLastActivityReport",
    async ({ token }, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${config.apiUrl}/api/reports/lastActivityReport`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            return data.data || [];
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/* =========================
   SLICE
========================= */
const reportsSlice = createSlice({
    name: "reports",
    initialState,
    reducers: {
        clearReports: (state) => {
            state.machineWiseReport = [];
            state.machineWiseDispenseRefill = [];
            state.stateDistrictWiseReport = [];
            state.avgConsumptionReport = [];
            state.machineWiseError = null;
            state.stateDistrictWiseError = null;
            state.avgConsumptionError = null;
        },

        // ✅ ADD THIS
        clearSelectedSavedReport: (state) => {
            state.selectedSavedReport = null;
            state.viewSavedReportError = null;
            state.viewSavedReportLoading = false;
        },

        clearMachineWiseReport: (state) => {
            state.machineWiseReport = { data: [], summary: null };
            state.machineWiseLoading = false;
            state.machineWiseError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            /* -------- Machine Wise -------- */
            .addCase(fetchMachineWiseReport.pending, (state) => {
                state.machineWiseLoading = true;
            })
            .addCase(fetchMachineWiseReport.fulfilled, (state, action) => {
                state.machineWiseLoading = false;
                state.machineWiseReport.data = action.payload.data || [];
                state.machineWiseReport.summary = action.payload.summary || null;
            })
            .addCase(fetchMachineWiseReport.rejected, (state, action) => {
                state.machineWiseLoading = false;
                state.machineWiseError = action.payload;
            })

            /* -------- State / District Wise -------- */
            .addCase(fetchStateDistrictWiseReport.pending, (state) => {
                state.stateDistrictWiseLoading = true;
            })
            .addCase(fetchStateDistrictWiseReport.fulfilled, (state, action) => {
                state.stateDistrictWiseLoading = false;
                state.stateDistrictWiseReport = action.payload;
            })
            .addCase(fetchStateDistrictWiseReport.rejected, (state, action) => {
                state.stateDistrictWiseLoading = false;
                state.stateDistrictWiseError = action.payload;
            })

            /* -------- Avg Consumption -------- */
            .addCase(fetchAvgConsumptionReport.pending, (state) => {
                state.avgConsumptionLoading = true;
            })
            .addCase(fetchAvgConsumptionReport.fulfilled, (state, action) => {
                state.avgConsumptionLoading = false;
                state.avgConsumptionReport = action.payload;
            })
            .addCase(fetchAvgConsumptionReport.rejected, (state, action) => {
                state.avgConsumptionLoading = false;
                state.avgConsumptionError = action.payload;
            })

            /* -------- fetchMachineWiseDispenseRefill-------- */
            .addCase(fetchMachineWiseDispenseRefill.pending, (state) => {
                state.machineWiseDispenseRefillLoading = true;
            })
            .addCase(fetchMachineWiseDispenseRefill.fulfilled, (state, action) => {
                state.machineWiseDispenseRefillLoading = false;
                state.machineWiseDispenseRefill.data = action.payload.data || [];
                state.machineWiseDispenseRefill.summary = action.payload.summary || null;
            })
            .addCase(fetchMachineWiseDispenseRefill.rejected, (state, action) => {
                state.machineWiseDispenseRefillLoading = false;
                state.machineWiseDispenseRefillError = action.payload;
            })

            /* -------- Save Report -------- */
            .addCase(saveReport.pending, (state) => {
                state.saveReportLoading = true;
            })
            .addCase(saveReport.fulfilled, (state) => {
                state.saveReportLoading = false;
            })
            .addCase(saveReport.rejected, (state, action) => {
                state.saveReportLoading = false;
                state.saveReportError = action.payload;
            })

            /* -------- Saved Reports -------- */
            .addCase(fetchSavedReports.pending, (state) => {
                state.savedReportsLoading = true;
            })
            .addCase(fetchSavedReports.fulfilled, (state, action) => {
                state.savedReportsLoading = false;
                state.savedReports = action.payload;
            })
            .addCase(fetchSavedReports.rejected, (state, action) => {
                state.savedReportsLoading = false;
                state.savedReportsError = action.payload;
            })

            .addCase(deleteSavedReport.pending, (state) => {
                state.deleteReportLoading = true;
            })
            .addCase(deleteSavedReport.fulfilled, (state, action) => {
                state.deleteReportLoading = false;
                state.savedReports = state.savedReports.filter(
                    (r) => r.id !== action.payload
                );
            })
            .addCase(deleteSavedReport.rejected, (state, action) => {
                state.deleteReportLoading = false;
                state.deleteReportError = action.payload;
            })

            .addCase(viewSavedReport.pending, (state) => {
                state.viewSavedReportLoading = true;
            })

            .addCase(viewSavedReport.fulfilled, (state, action) => {
                state.viewSavedReportLoading = false;
                state.selectedSavedReport = action.payload;
            })

            .addCase(viewSavedReport.rejected, (state, action) => {
                state.viewSavedReportLoading = false;
                state.viewSavedReportError = action.payload;
            })

            .addCase(updateSavedReport.fulfilled, (state, action) => {
                state.savedReports = state.savedReports.map((r) =>
                    r.id === action.payload.id ? action.payload : r
                );
            })

            /* -------- Last Activity Report -------- */
            .addCase(fetchLastActivityReport.pending, (state) => {
                state.lastActivityLoading = true;
                state.lastActivityError = null;
            })
            .addCase(fetchLastActivityReport.fulfilled, (state, action) => {
                state.lastActivityLoading = false;
                state.lastActivityReport.data = action.payload;
            })
            .addCase(fetchLastActivityReport.rejected, (state, action) => {
                state.lastActivityLoading = false;
                state.lastActivityError = action.payload;
            })

            .addCase(fetchDispenseReport.pending, (state) => {
                state.dispenseReportLoading = true;
            })
            .addCase(fetchDispenseReport.fulfilled, (state, action) => {
                state.dispenseReportLoading = false;
                state.dispenseReport.data = action.payload.data || [];
                state.dispenseReport.summary = action.payload.summary || null;
            })
            .addCase(fetchDispenseReport.rejected, (state, action) => {
                state.dispenseReportLoading = false;
                state.dispenseReportError = action.payload;
            });
    },
});

export const { clearReports, clearSelectedSavedReport, clearMachineWiseReport } = reportsSlice.actions;
export default reportsSlice.reducer;
