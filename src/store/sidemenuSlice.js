import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import config from "../config";

/* =========================
   INITIAL STATE
========================= */
const initialState = {
  menus: [],
  loading: false,
  error: null,
};

/* =========================
   FETCH SIDEBAR MENUS
========================= */
export const fetchSideMenus = createAsyncThunk(
  "sidemenu/fetchSideMenus",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${config.apiUrl}/api/menu/list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Failed to load menus"
        );
      }

      const data = await response.json();
      return data.data; // backend returns { status, data }
    } catch (error) {
      return rejectWithValue(error.message || "Menu fetch failed");
    }
  }
);

/* =========================
   SLICE
========================= */
const sidemenuSlice = createSlice({
  name: "sidemenu",
  initialState,
  reducers: {
    resetMenuState: (state) => {
      state.menus = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSideMenus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSideMenus.fulfilled, (state, action) => {
        state.loading = false;
        state.menus = action.payload;
      })
      .addCase(fetchSideMenus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetMenuState } = sidemenuSlice.actions;
export default sidemenuSlice.reducer;
