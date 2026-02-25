import { Box, Tabs, Tab, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { tokens } from "../../theme";
import MachineWiseDispenseReport from "./MachineWiseDispenseReport";
import StateDistrictWiseDispense from "./StateDistrictWiseDispense";
import AvgConsumptionComparisonReport from "./AvgConsumptionComparisonReport";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { clearMachineWiseReport, clearSelectedSavedReport, viewSavedReport } from "../../store/reportsSlice";

const OrganisationalReports = () => {
    const { id: reportId } = useParams();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const token = localStorage.getItem("authToken");

    const [tab, setTab] = useState(0);
    const { selectedSavedReport } = useSelector((state) => state.reports);

    /* =========================
       EDIT vs NORMAL MODE
    ========================= */
    useEffect(() => {
        if (token && reportId) {
            dispatch(viewSavedReport({ token, id: reportId }));
        } else {
            dispatch(clearSelectedSavedReport());
            dispatch(clearMachineWiseReport());
            setTab(0);
        }
    }, [token, reportId, dispatch]);

    /* =========================
       EDIT MODE (NO TABS)
    ========================= */
    if (reportId && selectedSavedReport) {
        switch (selectedSavedReport.reportType) {
            case "machine_wise_dispense":
                return <MachineWiseDispenseReport />;

            case "state_district_wise_dispense":
                return <StateDistrictWiseDispense />;

            case "avg_consumption_comparison":
                return <AvgConsumptionComparisonReport />;

            default:
                return <MachineWiseDispenseReport />;
        }
    }

    /* =========================
       NORMAL MODE (WITH TABS)
    ========================= */
    return (
        <Box m="20px">
            <Box mt="20px" mb="20px">
                <Tabs
                    value={tab}
                    onChange={(e, newValue) => setTab(newValue)}
                    textColor="inherit"
                    indicatorColor="secondary"
                    sx={{
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "14px",
                            color: "#ccc",
                        },
                        "& .Mui-selected": {
                            color: colors.greenAccent[400],
                        },
                    }}
                >
                    <Tab label="Machine Wise Dispense & Utilization" />
                    <Tab label="State / District Wise Comparison" />
                    <Tab label="Average Consumption Report" />
                </Tabs>
            </Box>

            <Box>
                {tab === 0 && <MachineWiseDispenseReport />}
                {tab === 1 && <StateDistrictWiseDispense />}
                {tab === 2 && <AvgConsumptionComparisonReport />}
            </Box>
        </Box>
    );
};

export default OrganisationalReports;
