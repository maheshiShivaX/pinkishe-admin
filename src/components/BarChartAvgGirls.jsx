/* eslint-disable react/prop-types */
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
import { useTheme } from "@mui/material";
import {
    Box,
    Typography,
    CircularProgress,
} from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllConsumptionPerGirl } from "../store/dashboardSlice";

const BarChartAvgGirls = ({ isDashboard = false }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();

    const token = useSelector((state) => state.auth.token);
    const { perGirlConsumption, loadingGirlStats, errorGirlStats } =
        useSelector((state) => state.dashboard || {});

    useEffect(() => {
        if (token) {
            dispatch(fetchAllConsumptionPerGirl({ token }));
        }
    }, [dispatch, token]);

    const {
        avgConsumptionTillNow = "0",
        avgConsumptionThisMonth = "0",
        avgConsumptionLastMonth = "0",
        avgConsumptionThisQuarter = "0",
    } = perGirlConsumption || {};

    const data = [
        { label: "Average Till Now", value: parseFloat(avgConsumptionTillNow) },
        { label: "Average This Month", value: parseFloat(avgConsumptionThisMonth) },
        { label: "Average Last Month", value: parseFloat(avgConsumptionLastMonth) },
        { label: "Average This Quarter", value: parseFloat(avgConsumptionThisQuarter) },
    ];

    const rawMax = Math.max(...data.map((d) => d.value || 0));
    const roundedMax = Math.ceil(rawMax / 10) * 10 || 1;
    const tickStep = Math.ceil(roundedMax / 4 / 10) * 10 || 1;
    const tickValues = Array.from(
        { length: Math.floor(roundedMax / tickStep) + 1 },
        (_, i) => i * tickStep
    );

    const barColors = {
        "Average Till Now": "#ff6b6b",
        "Average This Month": "#4dabf7",
        "Average Last Month": "#63e6be",
        "Average This Quarter": "#f59f00",
    };

    return (
        <Box position="relative" height="300px" px={3} pb={2}>
            <Box height="30vh">
                {loadingGirlStats ? (
                    <CircularProgress sx={{ display: "block", mx: "auto" }} />
                ) : errorGirlStats ? (
                    <Typography variant="body2" color="error" textAlign="center">
                        {errorGirlStats}
                    </Typography>
                ) : (
                    <ResponsiveBar
                        data={data}
                        keys={["value"]}
                        indexBy="label"
                        margin={{ top: 20, right: 30, bottom: 100, left: 60 }}
                        padding={0.5}
                        valueScale={{ type: "linear" }}
                        indexScale={{ type: "band", round: true }}
                        colors={({ indexValue }) => barColors[indexValue] || "#ccc"}
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
                        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            tickSize: 0,
                            tickPadding: 5,
                            tickRotation: -25,
                            legend: isDashboard ? undefined : "",
                            legendPosition: "middle",
                            legendOffset: 40,
                        }}
                        axisLeft={{
                            tickSize: 5,
                            tickPadding: 3,
                            tickRotation: 0,
                            legend: isDashboard ? undefined : "Pads per Girl",
                            legendPosition: "middle",
                            legendOffset: -40,
                            tickValues: tickValues,
                        }}
                        enableLabel={false}
                        legends={[]}
                        role="application"
                        barAriaLabel={(e) =>
                            `${e.id}: ${e.formattedValue} in ${e.indexValue}`
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
                                {value}
                            </strong>
                        )}
                    />
                )}
            </Box>
        </Box>
    );
};

export default BarChartAvgGirls;
