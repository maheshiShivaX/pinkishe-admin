// src/components/LineChart.jsx
import React, { useEffect, useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import { useTheme, Box, MenuItem, Select, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { tokens } from "../theme";
import { fetchPeriodWiseConsumptionData } from "../store/dashboardSlice";
import { fetchSchoolData } from "../store/schoolSlice";

const LineChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token); // adjust if token is stored elsewhere
  const periodWiseConsumption = useSelector(
    (state) => state.dashboard.periodWiseConsumption
  );

  const schoolData = useSelector((state) => state.school);

  // Selected period type
  const [periodType, setPeriodType] = useState("month");

  // Selected state
  const [selectedState, setSelectedState] = useState("state");

  // Selected district
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const schoolArray = Array.isArray(schoolData) ? schoolData : schoolData?.data || [];

  // Unique states
  const uniqueStates = [...new Set(schoolArray.map(item => item.state))];

  // Unique District
  const uniqueDistrict = [...new Set(schoolArray.map(item => item.schoolDistrict))];

  const loading = useSelector((state) => state.dashboard.loadingPeriodWise);
  const error = useSelector((state) => state.dashboard.errorPeriodWise);


  // Filter districts based on selected state
  const filteredDistricts =
    selectedState !== "state"
      ? [...new Set(
        schoolArray
          .filter((item) => item.state === selectedState)
          .map((item) => item.schoolDistrict)
      )]
      : [];

  // Dropdown options
  const periodOptions = [
    { value: "month", label: "Monthly" },
    { value: "week", label: "Weekly" },
    { value: "quarter", label: "Quarterly" },
    { value: "year", label: "Yearly" },
  ];

  // Build options with default
  const stateOptions = [
    { label: "National Level", value: "state" }, // default option
    ...uniqueStates.map((stateName) => ({
      label: stateName,
      value: stateName
    }))
  ];

  // Build district options
  const districtOptions = filteredDistricts.map((district) => ({
    label: district,
    value: district,
  }));

  // Fetch data on mount & periodType change
  // useEffect(() => {
  //   if (token) {
  //     dispatch(fetchPeriodWiseConsumptionData({ token, periodType, state }));
  //   }
  // }, [dispatch, token, periodType]);

  // Fetch data on mount & periodType, selectedState, selectedDistrict change
  useEffect(() => {
    if (token) {
      // Pass district only if selected and state is selected
      const districtParam = selectedDistrict && selectedState !== "state" ? selectedDistrict : undefined;
      const stateParam = selectedState !== "state" ? selectedState : undefined;

      dispatch(
        fetchPeriodWiseConsumptionData({
          token,
          periodType,
          state: stateParam,
          district: districtParam,
        })
      );
    }
  }, [dispatch, token, periodType, selectedState, selectedDistrict]);

  // Fetch data on SchoolData
  useEffect(() => {
    dispatch(fetchSchoolData());
  }, [dispatch]);

  // Prepare data for nivo line chart
  const chartData = [
    {
      id: "Pads",
      color: colors.greenAccent[500],
      data: periodWiseConsumption,
    },
  ];

  // Dropdown change handler
  const handlePeriodChange = (event) => {
    setPeriodType(event.target.value);
  };

  const handleStateChange = (event) => {
    setSelectedState(event.target.value);
    setSelectedDistrict(""); // reset district on state change
  };

  const handleDistrictChange = (event) => setSelectedDistrict(event.target.value);

  return (
    <Box position="relative" height="250px" mt="-20px" px={3} pb={2}>
      {/* Dropdown at top right */}
      <Box
        position="absolute"
        top={-50}
        right={16}
        zIndex={1}
        bgcolor={colors.primary[400]}
        borderRadius="8px"
        px={1.5}
        py={0.5}
      >
        {/* State Select */}
        <Select
          size="small"
          value={selectedState}
          onChange={(e) => {
            e.stopPropagation();
            handleStateChange(e);
          }}
          onClick={(e) => e.stopPropagation()}
          sx={{
            color: colors.gray[100],
            "& .MuiSvgIcon-root": { color: colors.gray[100] },
            minWidth: 130,
            marginRight:2
          }}
        >
          {stateOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>

        {/* District Select */}
        <Select
          size="small"
          value={selectedDistrict}
          onChange={(e) => {
            e.stopPropagation();
            handleDistrictChange(e);
          }}
          onClick={(e) => e.stopPropagation()}
          disabled={selectedState === "state"} // disable if national level selected
          displayEmpty
          sx={{
            color: selectedState === "state" ? colors.gray[500] : colors.gray[100],
            "& .MuiSvgIcon-root": {
              color: selectedState === "state" ? colors.gray[500] : colors.gray[100],
            },
            minWidth: 130,
            marginRight:2
          }}
        >
          <MenuItem value="">
            <em>District</em>
          </MenuItem>
          {districtOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        <Select
          size="small"
          value={periodType}
          onChange={(event) => {
            event.stopPropagation(); // Prevent outer Box click
            handlePeriodChange(event);
          }}
          onClick={(event) => event.stopPropagation()} // Prevent click bubbling
          sx={{
            color: colors.gray[100],
            "& .MuiSvgIcon-root": { color: colors.gray[100] },
            "& .MuiSelect-select": { paddingRight: "24px !important" },
            minWidth: 110,
          }}
        >
          {periodOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Show loading or error */}
      {loading ? (
        <Typography
          variant="body2"
          color={colors.gray[100]}
          textAlign="center"
          mt={10}
        >
          Loading...
        </Typography>
      ) : error ? (
        <Typography variant="body2" color="error" textAlign="center" mt={10}>
          {error}
        </Typography>
      ) : (
        <ResponsiveLine
          tooltip={({ point }) => (
            <Box
              sx={{
                background: "#333",
                color: "#fff",
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: "12px",
              }}
            >
              <div>
                <strong>{point.data.xFormatted}</strong>
              </div>
              <div>Value: {Math.round(point.data.yFormatted)}</div>
            </Box>
          )}
          data={chartData}
          theme={{
            axis: {
              domain: { line: { stroke: colors.gray[100] } },
              legend: { text: { fill: colors.greenAccent[500] } },
              ticks: {
                line: { stroke: colors.gray[100], strokeWidth: 1 },
                text: { fill: colors.gray[100] },
              },
            },
            legends: { text: { fill: colors.gray[100] } },
          }}
          colors={{ datum: "color" }}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: "auto",
            max: "auto",
            stacked: true,
            reverse: false,
          }}
          yFormat=" >-.2f"
          curve="linear"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            orient: "bottom",
            tickSize: 0,
            tickPadding: 10,
            tickRotation: -30,
            legend: "Period",

            legendOffset: 36,
            legendPosition: "middle",
          }}
          axisLeft={{
            orient: "left",
            tickValues: 5,
            tickSize: 3,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Pads Consumed",
            legendOffset: -40,
            legendPosition: "middle",
          }}
          enableGridX={false}
          enableGridY={false}
          pointSize={8}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          pointLabelYOffset={-12}
          useMesh={true}
          legends={[
            {
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: "left-to-right",
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: "circle",
              symbolBorderColor: "rgba(0, 0, 0, .5)",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemBackground: "rgba(0, 0, 0, .03)",
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
        />
      )}
    </Box>
  );
};

export default LineChart;
