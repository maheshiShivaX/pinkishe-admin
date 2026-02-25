import {
  Grid,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";
import { Header, LineChart } from "../../components";
import StatBox from "../../components/StatBox";
import {
  PersonAdd,
  Devices,
  ShoppingCart,
  LocationCity,
  BarChart,
  PieChart,
} from "@mui/icons-material";
import { tokens } from "../../theme";
import { useDispatch, useSelector } from "react-redux";
import { fetchDispenseHistory } from "../../store/dispenseSlice";
import { fetchVendingMachines } from "../../store/getVendingMachineSlice";
import {
  fetchBlockWiseSchoolCount,
  fetchDashboardData,
  fetchStateWisePadConsumption,
} from "../../store/dashboardSlice";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Bar from "../bar";
import Pie from "../pie";
import { HeadNumberTypography, TextGreenTypography } from "./index.style";
import BarAvgGirls from "../barAvgGirls";

function Dashboard({ }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isXlDevices = useMediaQuery("(min-width: 1260px)");
  const isMdDevices = useMediaQuery("(min-width: 724px)");
  const isXsDevices = useMediaQuery("(max-width: 436px)");

  const dispatch = useDispatch();
  const { dispenseDetails, loading, error } = useSelector(
    (state) => state.dispense
  );

  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  // useEffect(() => {
  //   if (token) {
  //     dispatch(fetchDispenseHistory(token));
  //   }
  // }, [dispatch, token]);

  useEffect(() => {
    if (token) {
      dispatch(
        fetchDispenseHistory({
          token,
          // page: 1,
          // pageSize: 20
        })
      );
    }
  }, [dispatch, token]);

  const { vendingMachines, loadingVendingMachines, errorVendingMachines } =
    useSelector((state) => state.getVendingMachine || {});
  useEffect(() => {
    if (token) {
      dispatch(fetchVendingMachines(token));
    }
  }, [dispatch, token]);

  function getOnlineOfflineCounts() {
    let onlineCount = 0;
    let offlineCount = 0;

    const now = new Date().getTime();

    vendingMachines.forEach((machine) => {
      // console.log(machine?.status)
      if (machine.status !== "active") return;

      const updatedAt = machine?.onlineStatusUpdatedAt;

      if (!updatedAt) {
        offlineCount++;
        return;
      }

      const lastUpdated = new Date(updatedAt).getTime();
      const diffInSeconds = (now - lastUpdated) / 1000;

      if (diffInSeconds <= 1800) { // 30 minutes
        onlineCount++;
      } else {
        offlineCount++;
      }
    });

    return { onlineCount, offlineCount };
  }

  const { onlineCount, offlineCount } = getOnlineOfflineCounts(vendingMachines);

  const {
    dashboardData,
    loadingDashboard,
    errorDashboard,
    stateWisePadConsumption,
    loadingStateWise,
    errorStateWise,
  } = useSelector((state) => state.dashboard || {});
  useEffect(() => {
    if (token) {
      dispatch(fetchDashboardData(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    dispatch(fetchBlockWiseSchoolCount(token));
  }, [dispatch, token]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    return date.toLocaleString("en-US", options);
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between">
        <Header title="DASHBOARD" />
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(6, 1fr)",
          xl: "repeat(12, 1fr)",
        }}
        gridAutoRows={{
          xs: "auto",
          sm: "auto",
          md: "300px",
        }}
        gap={2}
      >
        {/* Statistic Items */}
        <Box
          onClick={() => navigate("/machineStatus")}
          sx={{
            gridColumn: "span 6",
            bgcolor: colors.primary[400],
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "30px",
            borderRadius: "15px",
            cursor: "pointer", // 👈 Add this to show pointer on hover
            "&:hover": {
              opacity: 0.9, // 👈 Optional: subtle hover effect
            },
          }}
        >
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-start"
            marginBottom="20px"
          >
            <Devices
              sx={{
                color: colors.greenAccent[600],
                fontSize: "26px",
                marginRight: "8px",
              }}
            />
            <Typography variant="h5" color={colors.greenAccent[500]}>
              Machines Allocation Status
            </Typography>
          </Box>
          <Box
            width="100%"
            borderRadius={"10px"}
            bgcolor={colors.primary[500]}
            padding={"20px"}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              flexDirection={{ xs: "column", sm: "row" }} // 🔁 change flex direction based on screen size
              gap={2} // adds spacing between stacked items on small screens
            >
              <Box>
                <HeadNumberTypography color={colors.greenAccent[500]}>
                  {dashboardData?.machinesStatus?.total}
                </HeadNumberTypography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  Total Purchased
                </Typography>
              </Box>

              <Box>
                {[
                  {
                    label: "In Stores",
                    value: dashboardData?.machinesStatus?.inStore,
                  },
                  { label: "Demo", value: dashboardData?.machinesStatus?.demo },
                  {
                    label: "Decommissioned",
                    value: dashboardData?.machinesStatus?.decommissioned,
                  },
                  {
                    label: "Scrapped",
                    value: dashboardData?.machinesStatus?.scrapped,
                  },
                  {
                    label: "Installed",
                    value: dashboardData?.machinesStatus?.installed,
                  },
                ].map(({ label, value }) => (
                  <Box
                    key={label}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    marginTop="10px"
                  >
                    <Typography variant="h5" color={colors.greenAccent[500]}>
                      {label}:
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color={colors.gray[100]}
                      marginLeft="8px"
                    >
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* <Grid item xs={12} md={}></Grid> */}

        <Box
          onClick={() => navigate("/machineStatus")}
          sx={{
            gridColumn: {
              xs: "span 6",
              sm: "span 3",
              md: "span 3",
              xl: "span 3",
            },
            bgcolor: colors.primary[400],
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "30px",
            borderRadius: "15px",
            cursor: "pointer",
            "&:hover": {
              opacity: 0.9,
            },
          }}
        >
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-start"
            marginBottom="20px"
          >
            <Devices
              sx={{
                color: colors.greenAccent[600],
                fontSize: "26px",
                marginRight: "8px",
              }}
            />
            <Typography variant="h5" color={colors.greenAccent[500]}>
              Machines Operational Status
            </Typography>
          </Box>
          <Box
            width="100%"
            borderRadius={"10px"}
            bgcolor={colors.primary[500]}
            padding={"20px"}
          >
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                marginTop={"10px"}
              >
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  Active:
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color={colors.gray[100]}
                  sx={{ marginLeft: "auto" }} // This ensures the value is on the right
                >
                  {dashboardData?.machinesStatus?.active}
                </Typography>
              </Box>

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                marginTop={"10px"}
              >
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  Inactive:
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color={colors.gray[100]}
                  sx={{ marginLeft: "auto" }}
                >
                  {dashboardData?.machinesStatus?.inActive}
                </Typography>
              </Box>

              {/* Add Divider here to span full width */}
              <Divider
                sx={{
                  marginTop: "10px",
                  marginBottom: "10px",
                  backgroundColor: colors.gray[400],
                  width: "100%",
                }}
              />

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                marginTop={"10px"}
              >
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  Online:
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color={colors.gray[100]}
                  sx={{ marginLeft: "auto" }}
                >
                  {onlineCount}
                </Typography>
              </Box>

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                marginTop={"10px"}
              >
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  Offline:
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color={colors.gray[100]}
                  sx={{ marginLeft: "auto" }}
                >
                  {offlineCount}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          onClick={() => navigate("/machineStatus")}
          sx={{
            gridColumn: {
              xs: "span 6",
              sm: "span 3",
              md: "span 3",
              xl: "span 3",
            },
            bgcolor: colors.primary[400],
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "30px",
            borderRadius: "15px",
            cursor: "pointer", // 👈 Add this to show pointer on hover
            "&:hover": {
              opacity: 0.9, // 👈 Optional: subtle hover effect
            },
          }}
        >
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-start"
            marginBottom="20px"
          >
            <Devices
              sx={{
                color: colors.greenAccent[600],
                fontSize: "26px",
                marginRight: "8px",
              }}
            />
            <Typography variant="h5" color={colors.greenAccent[500]}>
              Machines Downtime Status
            </Typography>
          </Box>
          <Box
            width="100%"
            borderRadius={"10px"}
            bgcolor={colors.primary[500]}
            padding={"20px"}
          >
            <Box display="flex" justifyContent="space-between">
              <Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  marginTop={"10px"}
                >
                  <Typography variant="h5" color={colors.greenAccent[500]}>
                    Defective:
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={colors.gray[100]}
                    marginLeft="8px"
                  >
                    {dashboardData?.machinesStatus?.defective}
                  </Typography>
                </Box>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  marginTop={"10px"}
                >
                  <Typography variant="h5" color={colors.greenAccent[500]}>
                    Under Repair:
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={colors.gray[100]}
                    marginLeft="8px"
                  >
                    {dashboardData?.machinesStatus?.underRepair}
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  marginTop={"10px"}
                >
                  <Typography variant="h5" color={colors.greenAccent[500]}>
                    Inactive for other reasons:
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={colors.gray[100]}
                    marginLeft="8px"
                  >
                    {dashboardData?.machinesStatus?.inactiveReasons}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          onClick={() => navigate("/geoLocations")}
          sx={{
            gridColumn: "span 6",
            bgcolor: colors.primary[400],
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "30px",
            borderRadius: "15px",
            cursor: "pointer", // 👈 Add this to show pointer on hover
            "&:hover": {
              opacity: 0.9, // 👈 Optional: subtle hover effect
            },
          }}
        >
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-start"
            marginBottom="20px"
          >
            <LocationCity
              sx={{
                color: colors.greenAccent[600],
                fontSize: "26px",
                marginRight: "8px",
              }}
            />
            <Typography variant="h5" color={colors.greenAccent[500]}>
              Geographies Impacted Summary
            </Typography>
          </Box>
          <Box
            width="100%"
            borderRadius={"10px"}
            bgcolor={colors.primary[500]}
            padding={"20px"}
          >
            <Box display="flex" justifyContent="space-between">
              <Box>
                <HeadNumberTypography color={colors.greenAccent[500]}>
                  {dashboardData?.geoData?.states}
                </HeadNumberTypography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  Total States
                </Typography>
              </Box>
              <Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  marginTop={"10px"}
                >
                  <Typography variant="h5" color={colors.greenAccent[500]}>
                    Total Districts:
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={colors.gray[100]}
                    marginLeft="8px"
                  >
                    {dashboardData?.geoData?.districts}
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  marginTop={"10px"}
                >
                  <Typography variant="h5" color={colors.greenAccent[500]}>
                    Total Blocks:
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={colors.gray[100]}
                    marginLeft="8px"
                  >
                    {dashboardData?.geoData?.blocks}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          onClick={() => navigate("/schools")}
          sx={{
            gridColumn: "span 6",
            bgcolor: colors.primary[400],
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "30px",
            borderRadius: "15px",
            cursor: "pointer",
            "&:hover": {
              opacity: 0.9,
            },
          }}
        >
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-start"
            marginBottom="20px"
          >
            <Typography variant="h5" color={colors.greenAccent[500]}>
              State-Wise Data
            </Typography>
          </Box>

          <Box
            overflow="auto"
            width="100%"
            borderRadius="10px"
            bgcolor={colors.primary[500]}
            sx={{
              maxHeight: {
                xs: "300px", // Set scrollable height for mobile
                sm: "300px",
                md: "250px", // Adjust if needed
              },
            }}
          >
            {loading ? (
              <Typography>Loading transactions...</Typography>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <>
                {/* Header Row */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  borderBottom={`4px solid ${colors.primary[400]}`}
                  p="15px"
                  gap="5px"
                >
                  <Box flex={1}>
                    <Typography color={colors.gray[100]} fontWeight="600">
                      State
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography color={colors.gray[100]} fontWeight="600">
                      Districts
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography color={colors.gray[100]} fontWeight="600">
                      Blocks
                    </Typography>
                  </Box>
                  <Box flex={1} display="flex" justifyContent="center">
                    <Typography color={colors.gray[100]} fontWeight="600">
                      Schools
                    </Typography>
                  </Box>
                  <Box flex={1} display="flex" justifyContent="center">
                    <Typography color={colors.gray[100]} fontWeight="600">
                      Supported Beneficiaries
                    </Typography>
                  </Box>
                  <Box flex={1} display="flex" justifyContent="center">
                    <Typography color={colors.gray[100]} fontWeight="600">
                      Machines Installed
                    </Typography>
                  </Box>
                  <Box flex={1} display="flex" justifyContent="center">
                    <Typography color={colors.gray[100]} fontWeight="600">
                      Online
                    </Typography>
                  </Box>
                  <Box flex={1} display="flex" justifyContent="center">
                    <Typography color={colors.gray[100]} fontWeight="600">
                      Offline
                    </Typography>
                  </Box>
                </Box>

                {/* Data Rows */}
                {dashboardData?.stateWiseSummary.map(
                  (transaction, index) => (
                    <Box
                      key={`${transaction.id}-${index}`}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      borderBottom={`4px solid ${colors.primary[400]}`}
                      p="15px"
                    >
                      <Box flex={1}>
                        <Typography
                          color={colors.greenAccent[500]}
                          variant="h5"
                          fontWeight="600"
                        >
                          {transaction.state}
                        </Typography>
                      </Box>
                      <Box flex={1}>
                        <Typography
                          color={colors.greenAccent[500]}
                          variant="h5"
                          fontWeight="600"
                        >
                          {transaction.districtCount}
                        </Typography>
                      </Box>
                      <Box flex={1}>
                        <Typography
                          color={colors.greenAccent[500]}
                          variant="h5"
                          fontWeight="600"
                        >
                          {transaction.blockCount}
                        </Typography>
                      </Box>
                      <Box flex={1} display="flex" justifyContent="center">
                        <Typography color={colors.gray[100]}>
                          {transaction.schoolCount}
                        </Typography>
                      </Box>
                      <Box flex={1} display="flex" justifyContent="center">
                        <Typography color={colors.gray[100]}>
                          {transaction.totalBeneficiaries}
                        </Typography>
                      </Box>
                      <Box flex={1} display="flex" justifyContent="center">
                        <Box
                          bgcolor={colors.greenAccent[500]}
                          p="5px 10px"
                          borderRadius="4px"
                          color={colors.primary[500]}
                          fontWeight="bold"
                        >
                          {transaction.machineCount}
                        </Box>
                      </Box>
                      <Box flex={1} display="flex" justifyContent="center">
                        <Box
                          bgcolor={colors.greenAccent[500]}
                          p="5px 10px"
                          borderRadius="4px"
                          color={colors.primary[500]}
                          fontWeight="bold"
                        >
                          {transaction.activeMachineCount}
                        </Box>
                      </Box>
                      <Box flex={1} display="flex" justifyContent="center">
                        <Box
                          bgcolor={colors.greenAccent[500]}
                          p="5px 10px"
                          borderRadius="4px"
                          color={colors.primary[500]}
                          fontWeight="bold"
                        >
                          {transaction.inactiveMachineCount}
                        </Box>
                      </Box>
                    </Box>
                  )
                )}
              </>
            )}
          </Box>
        </Box>

        <Box
          onClick={() => navigate("/schools")}
          sx={{
            gridColumn: "span 6",
            bgcolor: colors.primary[400],
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "30px",
            borderRadius: "15px",
            cursor: "pointer",
            "&:hover": {
              opacity: 0.9,
            },
          }}
        >
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-start"
            marginBottom="20px"
          >
            <Typography variant="h5" color={colors.greenAccent[500]}>
              District-Wise Data
            </Typography>
          </Box>

          <Box
            overflow="auto"
            width="100%"
            borderRadius="10px"
            bgcolor={colors.primary[500]}
            sx={{
              maxHeight: {
                xs: "300px", // Set scrollable height for mobile
                sm: "300px",
                md: "250px", // Adjust if needed
              },
            }}
          >
            {loading ? (
              <Typography>Loading transactions...</Typography>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <>
                {/* Header Row */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  borderBottom={`4px solid ${colors.primary[400]}`}
                  p="15px"
                  gap="5px"
                >
                  <Box flex={1}>
                    <Typography color={colors.gray[100]} fontWeight="600">
                      District
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography color={colors.gray[100]} fontWeight="600">
                      State
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography color={colors.gray[100]} fontWeight="600">
                      Blocks
                    </Typography>
                  </Box>
                  <Box flex={1} display="flex" justifyContent="center">
                    <Typography color={colors.gray[100]} fontWeight="600">
                      Schools
                    </Typography>
                  </Box>
                  <Box flex={1} display="flex" justifyContent="center">
                    <Typography color={colors.gray[100]} fontWeight="600">
                      Supported Beneficiaries
                    </Typography>
                  </Box>
                  <Box flex={1} display="flex" justifyContent="center">
                    <Typography color={colors.gray[100]} fontWeight="600">
                      Machines Installed
                    </Typography>
                  </Box>
                  <Box flex={1} display="flex" justifyContent="center">
                    <Typography color={colors.gray[100]} fontWeight="600">
                      Online
                    </Typography>
                  </Box>
                  <Box flex={1} display="flex" justifyContent="center">
                    <Typography color={colors.gray[100]} fontWeight="600">
                      Offline
                    </Typography>
                  </Box>
                </Box>

                {/* Data Rows */}
                {dashboardData?.districtWiseSummary.map(
                  (transaction, index) => (
                    <Box
                      key={`${transaction.id}-${index}`}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      borderBottom={`4px solid ${colors.primary[400]}`}
                      p="15px"
                      gap="5px"
                    >
                      <Box flex={1}>
                        <Typography
                          color={colors.greenAccent[500]}
                          variant="h5"
                          fontWeight="600"
                        >
                          {transaction.schoolDistrict}
                        </Typography>
                      </Box>
                      <Box flex={1}>
                        <Typography
                          color={colors.greenAccent[500]}
                          variant="h5"
                          fontWeight="600"
                        >
                          {transaction.state}
                        </Typography>
                      </Box>
                      <Box flex={1}>
                        <Typography
                          color={colors.greenAccent[500]}
                          variant="h5"
                          fontWeight="600"
                        >
                          {transaction.blockCount}
                        </Typography>
                      </Box>
                      <Box flex={1} display="flex" justifyContent="center">
                        <Typography color={colors.gray[100]}>
                          {transaction.schoolCount}
                        </Typography>
                      </Box>
                      <Box flex={1} display="flex" justifyContent="center">
                        <Typography color={colors.gray[100]}>
                          {transaction.totalBeneficiaries}
                        </Typography>
                      </Box>
                      <Box flex={1} display="flex" justifyContent="center">
                        <Box
                          bgcolor={colors.greenAccent[500]}
                          p="5px 10px"
                          borderRadius="4px"
                          color={colors.primary[500]}
                          fontWeight="bold"
                        >
                          {transaction.machineCount}
                        </Box>
                      </Box>
                      <Box flex={1} display="flex" justifyContent="center">
                        <Box
                          bgcolor={colors.greenAccent[500]}
                          p="5px 10px"
                          borderRadius="4px"
                          color={colors.primary[500]}
                          fontWeight="bold"
                        >
                          {transaction.activeMachineCount}
                        </Box>
                      </Box>
                      <Box flex={1} display="flex" justifyContent="center">
                        <Box
                          bgcolor={colors.greenAccent[500]}
                          p="5px 10px"
                          borderRadius="4px"
                          color={colors.primary[500]}
                          fontWeight="bold"
                        >
                          {transaction.inactiveMachineCount}
                        </Box>
                      </Box>
                    </Box>
                  )
                )}
              </>
            )}
          </Box>
        </Box>

        <Box
          onClick={() => navigate("/schools")}
          sx={{
            gridColumn: "span 6",
            bgcolor: colors.primary[400],
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "30px",
            borderRadius: "15px",
            cursor: "pointer", // 👈 Add this to show pointer on hover
            "&:hover": {
              opacity: 0.9, // 👈 Optional: subtle hover effect
            },
          }}
        >
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-start"
            marginBottom="20px"
          >
            <PersonAdd
              sx={{
                color: colors.greenAccent[600],
                fontSize: "26px",
                marginRight: "8px",
              }}
            />
            <Typography variant="h5" color={colors.greenAccent[500]}>
              Targeted School Girls
            </Typography>
          </Box>
          <Box
            width="100%"
            borderRadius={"10px"}
            bgcolor={colors.primary[500]}
            padding={"20px"}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              flexDirection={{ xs: "column", sm: "row" }}
              gap={2}
            >
              <Box>
                <HeadNumberTypography color={colors.greenAccent[500]}>
                  {dashboardData?.impact?.totalImpact}
                </HeadNumberTypography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  Total Girls in Supported Schools
                </Typography>
              </Box>

              <Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  marginTop="10px"
                >
                  <Typography variant="h5" color={colors.greenAccent[500]}>
                    Average Girls Per School:
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={colors.gray[100]}
                    marginLeft="8px"
                  >
                    {dashboardData?.impact?.averageGirls}
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  marginTop="10px"
                >
                  <Typography variant="h5" color={colors.greenAccent[500]}>
                    Uttrakhand Average Girls Per School:
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={colors.gray[100]}
                    marginLeft="8px"
                  >
                    {dashboardData?.impact?.UttarakhandAverageGirls}
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  marginTop="10px"
                >
                  <Typography variant="h5" color={colors.greenAccent[500]}>
                    Telangana Average Girls Per School:
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={colors.gray[100]}
                    marginLeft="8px"
                  >
                    {dashboardData?.impact?.TelanganaAverageGirls}
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  marginTop="10px"
                >
                  <Typography variant="h5" color={colors.greenAccent[500]}>
                    Chhattisgarh Average Girls Per School:
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={colors.gray[100]}
                    marginLeft="8px"
                  >
                    {dashboardData?.impact?.ChhattisgarhAverageGirls}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          onClick={() => navigate("/schools")}
          sx={{
            gridColumn: "span 6",
            bgcolor: colors.primary[400],
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "30px",
            borderRadius: "15px",
            cursor: "pointer",
            "&:hover": {
              opacity: 0.9,
            },
          }}
        >
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-start"
            marginBottom="20px"
          >
            <Typography variant="h5" color={colors.greenAccent[500]}>
              Actual Impact Summary
            </Typography>
          </Box>

          <Box
            overflow="auto"
            width="100%"
            borderRadius="10px"
            bgcolor={colors.primary[500]}
            sx={{
              maxHeight: {
                xs: "300px", // Set scrollable height for mobile
                sm: "300px",
                md: "250px", // Adjust if needed
              },
            }}
          >
            {loading ? (
              <Typography>Loading transactions...</Typography>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <>
                {/* Header Row */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  borderBottom={`4px solid ${colors.primary[400]}`}
                  p="15px"
                  gap="5px"
                >
                  <Box flex={1}>
                    <Typography color={colors.gray[100]} fontWeight="600">
                      States
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography color={colors.gray[100]} fontWeight="600">
                      Pads Consumed(All Time)
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography color={colors.gray[100]} fontWeight="600">
                      Pads Consumed(Last Month)
                    </Typography>
                  </Box>
                  <Box flex={1} display="flex" justifyContent="center">
                    <Typography color={colors.gray[100]} fontWeight="600">
                      Average Consumption(All Time)
                    </Typography>
                  </Box>
                  <Box flex={1} display="flex" justifyContent="center">
                    <Typography color={colors.gray[100]} fontWeight="600">
                      Average Consumption(Last Month)
                    </Typography>
                  </Box>
                </Box>

                {/* Data Rows */}
                {dashboardData?.stateWiseConsumptionData.map(
                  (transaction, index) => (
                    <Box
                      key={`${transaction.id}-${index}`}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      borderBottom={`4px solid ${colors.primary[400]}`}
                      p="15px"
                      gap="5px"
                    >
                      <Box flex={1}>
                        <Typography
                          color={colors.greenAccent[500]}
                          variant="h5"
                          fontWeight="600"
                        >
                          {transaction.state}
                        </Typography>
                      </Box>
                      <Box flex={1}>
                        <Typography
                          color={colors.greenAccent[500]}
                          variant="h5"
                          fontWeight="600"
                        >
                          {transaction.padsConsumedAllTime}
                        </Typography>
                      </Box>
                      <Box flex={1} display="flex" justifyContent="center">
                        <Box
                          bgcolor={colors.greenAccent[500]}
                          p="5px 10px"
                          borderRadius="4px"
                          color={colors.primary[500]}
                          fontWeight="bold"
                        >
                          {transaction.padsConsumedLastMonth}
                        </Box>
                      </Box>
                      <Box flex={1} display="flex" justifyContent="center">
                        <Box
                          bgcolor={colors.greenAccent[500]}
                          p="5px 10px"
                          borderRadius="4px"
                          color={colors.primary[500]}
                          fontWeight="bold"
                        >
                          {transaction.avgConsumptionAllTime}
                        </Box>
                      </Box>
                      <Box flex={1} display="flex" justifyContent="center">
                        <Box
                          bgcolor={colors.greenAccent[500]}
                          p="5px 10px"
                          borderRadius="4px"
                          color={colors.primary[500]}
                          fontWeight="bold"
                        >
                          {transaction.avgConsumptionLastMonth}
                        </Box>
                      </Box>
                    </Box>
                  )
                )}
              </>
            )}
          </Box>
        </Box>

        <Box
          onClick={() => navigate("/dispenseHistory")}
          sx={{
            gridColumn: "span 6",
            bgcolor: colors.primary[400],
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "30px",
            borderRadius: "15px",
            cursor: "pointer", // 👈 Add this to show pointer on hover
            "&:hover": {
              opacity: 0.9, // 👈 Optional: subtle hover effect
            },
          }}
        >
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-start"
            marginBottom="20px"
          >
            <ShoppingCart
              sx={{
                color: colors.greenAccent[600],
                fontSize: "26px",
                marginRight: "8px",
              }}
            />
            <Typography variant="h5" color={colors.greenAccent[500]}>
              Pad dispensing summary
            </Typography>
          </Box>
          <Box
            width="100%"
            borderRadius={"10px"}
            bgcolor={colors.primary[500]}
            padding={"20px"}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              flexDirection={{ xs: "column", sm: "row" }}
              gap={2}
            >
              <Box>
                <HeadNumberTypography color={colors.greenAccent[500]}>
                  {dashboardData?.padsConsumes?.total}
                </HeadNumberTypography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  Total Consumed Till Date
                </Typography>
              </Box>

              <Box>
                {[
                  {
                    label: "Dispensed Today",
                    value: dashboardData?.padsConsumes?.today,
                  },
                  {
                    label: "Dispensed Yesterday",
                    value: dashboardData?.padsConsumes?.yesterday,
                  },
                  {
                    label: "Dispensed This Week",
                    value: dashboardData?.padsConsumes?.week,
                  },
                  {
                    label: "Dispensed This Month",
                    value: dashboardData?.padsConsumes?.month,
                  },
                  {
                    label: "Dispensed This Quarter",
                    value: dashboardData?.padsConsumes?.quarter,
                  },
                ].map(({ label, value }) => (
                  <Box
                    key={label}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    marginTop="10px"
                  >
                    <Typography variant="h5" color={colors.greenAccent[500]}>
                      {label}:
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color={colors.gray[100]}
                      marginLeft="8px"
                    >
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          onClick={() => navigate("/machineStatus")}
          sx={{
            gridColumn: "span 6",
            bgcolor: colors.primary[400],
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "30px",
            borderRadius: "15px",
            cursor: "pointer", // 👈 Add this to show pointer on hover
            "&:hover": {
              opacity: 0.9, // 👈 Optional: subtle hover effect
            },
          }}
        >
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-start"
            marginBottom="20px"
          >
            <Typography variant="h5" color={colors.greenAccent[500]}>
              Machines Status
            </Typography>
          </Box>
          <Box
            overflow="auto"
            width="100%"
            borderRadius={"10px"}
            bgcolor={colors.primary[500]}
            sx={{
              maxHeight: {
                xs: "300px", // Set scrollable height for mobile
                sm: "300px",
                md: "250px", // Adjust if needed
              },
            }}
          >
            {loadingVendingMachines ? (
              <Typography>Loading Machines...</Typography>
            ) : errorVendingMachines ? (
              <Typography color="error">{errorVendingMachines}</Typography>
            ) : (
              <>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  borderBottom={`4px solid ${colors.primary[400]}`}
                  p="15px"
                >
                  <Typography color={colors.gray[100]} fontWeight="600">
                    Machine ID
                  </Typography>
                  <Typography color={colors.gray[100]} fontWeight="600">
                    Status
                  </Typography>
                  <Typography color={colors.gray[100]} fontWeight="600">
                    Stock
                  </Typography>
                </Box>

                {vendingMachines.map((machine, index) => {
                  const remainingStock = machine?.remaingStock ?? 0;

                  let bgColor = "";
                  let fontColor = "";

                  if (remainingStock <= 15) {
                    bgColor = colors.redAccent[500];
                    fontColor = colors.redAccent[100];
                  } else if (remainingStock <= 30) {
                    bgColor = colors.yellowAccent?.[500] || "#ffe14c"; // fallback if yellowAccent not defined
                    fontColor = colors.yellowAccent?.[900] || "#332f0f";
                  } else {
                    bgColor = colors.greenAccent[500];
                    fontColor = colors.greenAccent[900];
                  }

                  return (
                    <Box
                      key={`${machine.dispenseId}-${index}`}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      borderBottom={`4px solid ${colors.primary[400]}`}
                      p="15px"
                    >
                      <Box>
                        <Typography
                          color={colors.greenAccent[500]}
                          variant="h5"
                          fontWeight="600"
                          width={"100px"}
                        >
                          {machine.machineId}
                        </Typography>
                      </Box>
                      <Typography color={colors.gray[100]}>
                        {machine.status.charAt(0).toUpperCase() +
                          machine.status.slice(1)}
                      </Typography>
                      <Box
                        bgcolor={bgColor}
                        color={fontColor}
                        p="5px 10px"
                        borderRadius="4px"
                        fontWeight="bold"
                      >
                        {remainingStock}
                      </Box>
                    </Box>
                  );
                })}
              </>
            )}
          </Box>
        </Box>

        <Box
          onClick={() => navigate("/dispenseHistory")}
          sx={{
            gridColumn: "span 6",
            bgcolor: colors.primary[400],
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "30px",
            borderRadius: "15px",
            cursor: "pointer", // 👈 Add this to show pointer on hover
            "&:hover": {
              opacity: 0.9, // 👈 Optional: subtle hover effect
            },
          }}
        >
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-start"
            marginBottom="20px"
          >
            <Typography variant="h5" color={colors.greenAccent[500]}>
              Recent Transactions
            </Typography>
          </Box>
          <Box
            overflow="auto"
            width="100%"
            borderRadius={"10px"}
            bgcolor={colors.primary[500]}
            sx={{
              maxHeight: {
                xs: "300px", // Set scrollable height for mobile
                sm: "300px",
                md: "250px", // Adjust if needed
              },
            }}
          >
            {loading ? (
              <Typography>Loading transactions...</Typography> // Show loading state
            ) : error ? (
              <Typography color="error">{error}</Typography> // Show error message
            ) : (
              <>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  borderBottom={`4px solid ${colors.primary[400]}`}
                  p="15px"
                >
                  <Typography color={colors.gray[100]} fontWeight="600">
                    Machine ID
                  </Typography>
                  <Typography color={colors.gray[100]} fontWeight="600">
                    Date
                  </Typography>
                  <Typography color={colors.gray[100]} fontWeight="600">
                    Items Dispensed
                  </Typography>
                </Box>

                {dispenseDetails?.data?.slice(0, 25).map((transaction, index) => (
                  <Box
                    key={`${transaction.id}-${index}`}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    borderBottom={`4px solid ${colors.primary[400]}`}
                    p="15px"
                  >
                    <Box>
                      <Typography
                        color={colors.greenAccent[500]}
                        variant="h5"
                        fontWeight="600"
                      >
                        {transaction.machineId}
                      </Typography>
                    </Box>
                    <Typography color={colors.gray[100]}>
                      {formatDate(transaction.createdAt)}
                    </Typography>
                    <Box
                      bgcolor={colors.greenAccent[500]}
                      p="5px 10px"
                      borderRadius="4px"
                      color={colors.primary[500]}
                      fontWeight="bold"
                    >
                      {transaction.itemsDispensed}
                    </Box>
                  </Box>
                ))}
              </>
            )}
          </Box>
        </Box>

        <Box
          onClick={() => navigate("/dispenseHistory")}
          sx={{
            gridColumn: "span 6",
            bgcolor: colors.primary[400],
            borderRadius: "15px",
            cursor: "pointer", // 👈 Add this to show pointer on hover
            "&:hover": {
              opacity: 0.9, // 👈 Optional: subtle hover effect
            },
          }}
        >
          <Box
            mt="25px"
            px="30px"
            display="flex"
            justifyContent="space-between"
          >
            <Box>
              <Header subtitle="Average Pad Consumption per girl" />
            </Box>
          </Box>
          <Box height="250px" mt="-20px">
            <BarAvgGirls />
          </Box>
        </Box>

        <Box
          onClick={() => navigate("/dispenseHistory")}
          sx={{
            gridColumn: "span 6",
            bgcolor: colors.primary[400],
            borderRadius: "15px",
            cursor: "pointer", // 👈 Add this to show pointer on hover
            "&:hover": {
              opacity: 0.9, // 👈 Optional: subtle hover effect
            },
          }}
        >
          <Box
            mt="25px"
            px="30px"
            display="flex"
            justifyContent="space-between"
          >
            <Box>
              <Header subtitle="Pads Consumption Geography Wise" />
            </Box>
          </Box>
          <Box height="250px" mt="-20px">
            <Bar />
          </Box>
        </Box>

        <Box
          onClick={() => navigate("/schools")}
          sx={{
            gridColumn: "span 6",
            bgcolor: colors.primary[400],
            borderRadius: "15px",
            cursor: "pointer", // 👈 Add this to show pointer on hover
            "&:hover": {
              opacity: 0.9, // 👈 Optional: subtle hover effect
            },
          }}
        >
          <Pie />
        </Box>

        <Box
          onClick={() => navigate("/dispenseHistory")}
          sx={{
            gridColumn: "span 6",
            bgcolor: colors.primary[400],
            borderRadius: "15px",
            cursor: "pointer", // 👈 Add this to show pointer on hover
            "&:hover": {
              opacity: 0.9, // 👈 Optional: subtle hover effect
            },
          }}
        >
          <Box
            mt="25px"
            px="30px"
            display="flex"
            justifyContent="space-between"
          >
            <Box>
              <Header subtitle="Last 1 Year Pads Consumption" />
            </Box>
          </Box>
          <Box height="250px" mt="-20px">
            <LineChart isDashboard={true} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
