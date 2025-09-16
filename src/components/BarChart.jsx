/* eslint-disable react/prop-types */
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
import { useTheme } from "@mui/material";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStateWisePadConsumption } from "../store/dashboardSlice";

const BarChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();

  const token = useSelector((state) => state.auth.token);
  const { stateWisePadConsumption, loadingStateWise, errorStateWise } =
    useSelector((state) => state.dashboard || {});

  const [periodType, setPeriodType] = useState("allTime");

  const periodOptions = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "thisWeek", label: "This Week" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "last90Days", label: "Last 90 Days" },
    { value: "lastQuarter", label: "Last Quarter" },
    { value: "allTime", label: "All Time" },
  ];

  useEffect(() => {
    if (token) {
      dispatch(fetchStateWisePadConsumption({ token, periodType }));
    }
  }, [dispatch, token, periodType]);

  const handlePeriodChange = (event) => {
    setPeriodType(event.target.value);
  };

  const data = Object.entries(stateWisePadConsumption || {})
    .map(([block, value]) => ({ block, value }))
    .slice(0, 10); // Top 10 entries

  const rawMax = Math.max(...data.map((d) => d.value || 0));
  const roundedMax = Math.ceil(rawMax / 10) * 10;
  const tickStep = Math.ceil(roundedMax / 4 / 10) * 10;
  const tickValues = Array.from(
    { length: Math.floor(roundedMax / tickStep) + 1 },
    (_, i) => i * tickStep
  );

  return (
    <Box position="relative" height="250px" mt="-20px" px={3} pb={2}>
      {/* Dropdown */}
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
        <Select
          size="small"
          value={periodType}
          onChange={handlePeriodChange}
          onClick={(event) => event.stopPropagation()} // Prevent click bubbling
          sx={{ minWidth: 120 }}
        >
          {periodOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Chart */}
      <Box height="30vh">
        {loadingStateWise ? (
          <CircularProgress sx={{ display: "block", mx: "auto" }} />
        ) : errorStateWise ? (
          <Typography variant="body2" color="error" textAlign="center">
            {errorStateWise}
          </Typography>
        ) : (
          <ResponsiveBar
            data={data}
            keys={["value"]}
            indexBy="block"
            margin={{ top: 0, right: 0, bottom: 120, left: 60 }}
            padding={0.7}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={{ scheme: "nivo" }}
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
            borderColor={{ from: "color", modifiers: [["darker", "1.6"]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 5,
              tickRotation: -30,
              legend: isDashboard ? undefined : "District",
              legendPosition: "middle",
              legendOffset: 40,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 3,
              tickRotation: 0,
              legend: isDashboard ? undefined : "Pads Consumed",
              legendPosition: "middle",
              legendOffset: -40,
              tickValues: tickValues,
            }}
            enableLabel={false}
            legends={[]}
            role="application"
            barAriaLabel={(e) =>
              `${e.id}: ${e.formattedValue} in block: ${e.indexValue}`
            }
            tooltip={({ value }) => (
              <strong
                style={{
                  color: "#fff",
                  background: "#333",
                  padding: "4px 8px",
                  borderRadius: 4,
                }}
              >
                Value: {value}
              </strong>
            )}
          />
        )}
      </Box>
    </Box>
  );
};

export default BarChart;
