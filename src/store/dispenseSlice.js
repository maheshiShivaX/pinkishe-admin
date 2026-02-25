import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import config from '../config';



const initialState = {
  dispenseDetails: [],
  loading: false,
  error: null,

  machineDispenseDetails: [],
  machineLoading: false,
  machineError: null,

  refillingDetails: [],        // New state for refilling history
  refillingLoading: false,     // Loading state for refilling
  refillingError: null,

  exportDispenseDetails: [],   // ✅ state for export API
  exportLoading: false,        // ✅ loading state for export
  exportError: null, // Error state for refilling

  exportRefillingDetails: [],        // New state for refilling history
  exportRefillingLoading: false,     // Loading state for refilling
  exportRefillingError: null,
};

export const fetchDispenseHistory = createAsyncThunk(
  "dispense/fetchDispenseHistory",
  async ({ token, page = 1, pageSize = 10, startDate, endDate, filters } = {}) => {
    let url = `${config.apiUrl}/api/getDispenseHistory?page=${page}&pageSize=${pageSize}&`;

    // Date filters only if provided
    if (startDate) {
      const d = new Date(startDate);
      url += `startDate=${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}&`;
    }
    if (endDate) {
      const d = new Date(endDate);
      url += `endDate=${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}&`;
    }

    // Filters
    if (filters?.length) {
      url += `filters=${encodeURIComponent(JSON.stringify(filters))}&`;
    }

    url = url.replace(/&$/, "");

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    return {
      data: data.data || [],
      total: data.total || 0,
    };
  }
);


// Thunk fetchDispenseHistory with startDate, endDate, and filters
export const getDispenseHistoryExportData = createAsyncThunk(
  'dispense/getDispenseHistoryExportData',
  async ({ token, startDate, endDate, filters }) => {
    let url = `${config.apiUrl}/api/getDispenseHistoryExportData`;

    // ✅ Build query params
    const queryParams = [];
    if (startDate) queryParams.push(`startDate=${startDate}`);
    if (endDate) queryParams.push(`endDate=${endDate}`);
    if (filters?.length) {
      queryParams.push(`filters=${encodeURIComponent(JSON.stringify(filters))}`);
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join("&")}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch export data');
    }

    return {
      data: data.data,
      total: data.total,
    };
  }
);

// Thunk to fetch dispense history for a specific machine
export const fetchDispenseHistoryForMachineId = createAsyncThunk(
  'dispense/fetchDispenseHistoryForMachineId',
  async ({ machineId, token }) => {
    const response = await fetch(`${config.apiUrl}/api/getDispenseHistoryForMachine/${machineId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch data for this machine');
    }
    return data.data; // Return data for the specific machine
  }
);

// Thunk to fetch refilling history from API
// export const fetchRefillingHistory = createAsyncThunk(
//   'dispense/fetchRefillingHistory',
//   async ({token, page, pageSize, startDate, endDate, filters}) => {
//     const response = await fetch(
//       `${config.apiUrl}/api/getRefillingHistory?page=${page}&pageSize=${pageSize}`,
//       {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       }
//     );
//     const data = await response.json();
//     if (!response.ok) {
//       throw new Error(data.message || 'Failed to fetch refilling history');
//     }
//     return {
//       data: data.data,
//       total: data.total,
//     };
//   }
// );

// Thunk to fetch refilling history from API
export const fetchRefillingHistory = createAsyncThunk(
  'dispense/fetchRefillingHistory',
  async ({ token, page, pageSize, startDate, endDate, filters } = {}) => {
    let url = `${config.apiUrl}/api/getRefillingHistory?`;

    // Pagination
    if (page !== undefined) url += `page=${page}&`;
    if (pageSize !== undefined) url += `pageSize=${pageSize}&`;

    // Date filters
    if (startDate) {
      const d = new Date(startDate);
      url += `startDate=${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}&`;
    }

    if (endDate) {
      const d = new Date(endDate);
      url += `endDate=${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}&`;
    }

    // Additional filters
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          url += `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}&`;
        }
      });
    }

    // Trim trailing "&" or "?"
    url = url.replace(/[&?]$/, "");

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch refilling history');
    }

    return {
      data: data.data,
      total: data.total,
    };
  }
);

// Thunk fetchDispenseHistory with startdate and end date
export const fetchRefillingHistoryExportData = createAsyncThunk(
  'dispense/getRefillingHistoryExportData',
  async ({ token, startDate, endDate, filters }) => {
    let url = `${config.apiUrl}/api/getRefillingHistoryExportData`;

    // Add startDate & endDate params if provided
    const queryParams = [];
    if (startDate) queryParams.push(`startDate=${startDate}`);
    if (endDate) queryParams.push(`endDate=${endDate}`);
    if (filters?.length) {
      queryParams.push(`filters=${encodeURIComponent(JSON.stringify(filters))}`);
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join("&")}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch export data');
    }

    return {
      data: data.data,   // full export data
      total: data.total, // total count if API provides
    };
  }
);


// Create the slice
const dispenseSlice = createSlice({
  name: 'dispense',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handling the fetchDispenseHistory actions
      .addCase(fetchDispenseHistory.pending, (state) => {
        state.loading = false;
      })
      .addCase(fetchDispenseHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.dispenseDetails = action.payload;
      })
      .addCase(fetchDispenseHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })


      // ✅ Handling the getDispenseHistoryExportData actions
      .addCase(getDispenseHistoryExportData.pending, (state) => {
        state.exportLoading = true;   // ✅ FIX
        state.exportError = null;
      })
      .addCase(getDispenseHistoryExportData.fulfilled, (state, action) => {
        state.exportLoading = false;
        // Store export data separately so it doesn't overwrite main list
        state.exportDispenseDetails = action.payload;
      })
      .addCase(getDispenseHistoryExportData.rejected, (state, action) => {
        state.exportLoading = false;
        state.exportError = action.error.message;
      })


      // Handling the fetchDispenseHistoryForMachineId actions
      .addCase(fetchDispenseHistoryForMachineId.pending, (state) => {
        state.machineLoading = true;
      })
      .addCase(fetchDispenseHistoryForMachineId.fulfilled, (state, action) => {
        state.machineLoading = false;
        state.machineDispenseDetails = action.payload; // Store the data for the specific machine
      })
      .addCase(fetchDispenseHistoryForMachineId.rejected, (state, action) => {
        state.machineLoading = false;
        state.machineError = action.error.message;
      })


      // ✅ Fetch refilling history
      .addCase(fetchRefillingHistory.pending, (state) => {
        state.refillingLoading = true;
      })
      .addCase(fetchRefillingHistory.fulfilled, (state, action) => {
        state.refillingLoading = false;
        state.refillingDetails = action.payload;
      })
      .addCase(fetchRefillingHistory.rejected, (state, action) => {
        state.refillingLoading = false;
        state.refillingError = action.error.message;
      })

      // ✅ Handling the fetchRefillingHistoryExportData actions
      .addCase(fetchRefillingHistoryExportData.pending, (state) => {
        state.exportRefillingLoading = false;
      })
      .addCase(fetchRefillingHistoryExportData.fulfilled, (state, action) => {
        state.exportRefillingLoading = false;
        // Store export data separately so it doesn't overwrite main list
        state.exportRefillingDetails = action.payload;
      })
      .addCase(fetchRefillingHistoryExportData.rejected, (state, action) => {
        state.exportRefillingLoading = false;
        state.exportRefillingError = action.error.message;
      });

  },
});

export default dispenseSlice.reducer;
