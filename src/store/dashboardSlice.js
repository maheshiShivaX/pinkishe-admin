import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import config from '../config';

// Define the initial state
const initialState = {
  dashboardData: null,
  loadingDashboard: false,
  errorDashboard: null,

  stateWisePadConsumption: null,
  loadingStateWise: false,
  errorStateWise: null,

  blockWiseSchoolCount: null,
  loadingBlockWise: false,
  errorBlockWise: null,

  perGirlConsumption: null,
  loadingGirlStats: false,
  errorGirlStats: null,

  periodWiseConsumption: [],   // new state for line chart data
  loadingPeriodWise: false,
  errorPeriodWise: null,
};

// Thunk to fetch dashboard data from API
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (token) => {
    const response = await fetch(`${config.apiUrl}/api/getDashboardData`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch data');
    }
    return data.data; // Assuming the data is in the 'data' field of the response
  }
);

export const fetchStateWisePadConsumption = createAsyncThunk(
  'dashboard/fetchStateWisePadConsumption',
  async ({ token, periodType }) => {
    const response = await fetch(`${config.apiUrl}/api/getDistrictWisePadConsunption/${periodType}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch state-wise pad consumption');
    }
    return data.data;
  }
);

export const fetchAllConsumptionPerGirl = createAsyncThunk(
  'dashboard/fetchAllConsumptionPerGirl',
  async ({ token }) => {
    const response = await fetch(`${config.apiUrl}/api/getAllConsumptionPerGirl`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch state-wise pad consumption');
    }
    return data.data;
  }
);

// Thunk to fetch block-wise school count
export const fetchBlockWiseSchoolCount = createAsyncThunk(
  'dashboard/fetchBlockWiseSchoolCount',
  async (token) => {
    const response = await fetch(`${config.apiUrl}/api/getDistrictWiseSchoolCount`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch block-wise school count');
    }
    return data.data;
  }
);

//  thunk to fetch period-wise consumption data
export const fetchPeriodWiseConsumptionData = createAsyncThunk(
  'dashboard/fetchPeriodWiseConsumptionData',
  async ({ token, periodType, state, district }) => {
    let url = `${config.apiUrl}/api/getPeriodWiseConsumptionData/${periodType}`;

    if (state && state !== 'state') {
      url += `/${state}`;
      if (district) {
        url += `/${district}`;
      }
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error('Failed to fetch period-wise consumption data');
    }
    return data.data; // array of {x, y}
  }
);

// Create the slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loadingDashboard = true;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loadingDashboard = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loadingDashboard = false;
        state.errorDashboard = action.error.message;
      })

      // State-wise pad consumption
      .addCase(fetchStateWisePadConsumption.pending, (state) => {
        state.loadingStateWise = true;
      })
      .addCase(fetchStateWisePadConsumption.fulfilled, (state, action) => {
        state.loadingStateWise = false;
        state.stateWisePadConsumption = action.payload;
      })
      .addCase(fetchStateWisePadConsumption.rejected, (state, action) => {
        state.loadingStateWise = false;
        state.errorStateWise = action.error.message;
      })

      // fetchAllConsumptionPerGirl pad consumption
      .addCase(fetchAllConsumptionPerGirl.pending, (state) => {
        state.loadingGirlStats = true;
      })
      .addCase(fetchAllConsumptionPerGirl.fulfilled, (state, action) => {
        state.loadingGirlStats = false;
        state.perGirlConsumption = action.payload;
      })
      .addCase(fetchAllConsumptionPerGirl.rejected, (state, action) => {
        state.loadingGirlStats = false;
        state.errorGirlStats = action.error.message;
      })

      // Block-wise school count
      .addCase(fetchBlockWiseSchoolCount.pending, (state) => {
        state.loadingBlockWise = true;
      })
      .addCase(fetchBlockWiseSchoolCount.fulfilled, (state, action) => {
        state.loadingBlockWise = false;
        state.blockWiseSchoolCount = action.payload;
      })
      .addCase(fetchBlockWiseSchoolCount.rejected, (state, action) => {
        state.loadingBlockWise = false;
        state.errorBlockWise = action.error.message;
      })


      .addCase(fetchPeriodWiseConsumptionData.pending, (state) => {
        state.loadingPeriodWise = true;
        state.errorPeriodWise = null;
      })
      .addCase(fetchPeriodWiseConsumptionData.fulfilled, (state, action) => {
        state.loadingPeriodWise = false;
        // Clean data: convert y to number, fallback for x
        state.periodWiseConsumption = action.payload
          .filter((item) => item.x) // optional: remove empty x
          .map((item) => ({
            x: item.x || 'N/A',
            y: Number(item.y) || 0,
          }));
      })
      .addCase(fetchPeriodWiseConsumptionData.rejected, (state, action) => {
        state.loadingPeriodWise = false;
        state.errorPeriodWise = action.error.message;
      });
  },
});

export default dashboardSlice.reducer;
