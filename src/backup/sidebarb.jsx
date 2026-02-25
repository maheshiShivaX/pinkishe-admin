/* eslint-disable react/prop-types */
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { useContext, useState, useEffect } from "react";
import { tokens } from "../../../theme";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineIcon from "@mui/icons-material/PieChartOutline";
import {
  AssignmentOutlined,
  BusinessOutlined,
  ContactsOutlined,
  DashboardOutlined,
  DevicesOutlined,
  MenuOutlined,
  PeopleAltOutlined,
  ReceiptOutlined,
} from "@mui/icons-material";
import logo from "../../../assets/images/logo.png";
import Item from "./Item";
import { ToggledContext } from "../../../App";
import { useDispatch, useSelector } from "react-redux";
import { fetchSideMenus } from "../../../store/sidemenuSlice";

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { toggled, setToggled } = useContext(ToggledContext);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [openOrgReports, setOpenOrgReports] = useState(false);
  const [openPesReports, setOpenPesReports] = useState(false);
  const [openSupAdReports, setOpenSupAdReports] = useState(false);

  const [userRole, setUserRole] = useState(null);

  const dispatch = useDispatch();
  const { menus, loading } = useSelector((state) => state.sidemenu);

  useEffect(() => {
    dispatch(fetchSideMenus());
  }, [dispatch]);

  useEffect(() => {
    // Read the user role from localStorage
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);
  return (
    <Sidebar
      backgroundColor={colors.primary[400]}
      rootStyles={{
        border: 0,
        height: "100%",
      }}
      collapsed={collapsed}
      onBackdropClick={() => setToggled(false)}
      toggled={toggled}
      breakPoint="md"
    >
      <Menu
        menuItemStyles={{
          button: { ":hover": { background: "transparent" } },
        }}
      >
        <MenuItem
          rootStyles={{
            margin: "10px 0 20px 0",
            color: colors.gray[100],
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {!collapsed && (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{ flex: 2, transition: ".3s ease" }}
              >
                <img
                  style={{
                    width: "100%",
                    height: "auto",
                    maxWidth: "130px",
                    maxHeight: "130px",
                  }}
                  src={logo}
                  alt="Pinkishe"
                />
              </Box>
            )}
            <IconButton onClick={() => setCollapsed(!collapsed)}>
              <MenuOutlined />
            </IconButton>
          </Box>
        </MenuItem>
      </Menu>

      <Box mb={5} pl={collapsed ? undefined : "5%"}>
        <Menu
          menuItemStyles={{
            button: {
              ":hover": {
                color: "#3da58a",
                background: "transparent",
                transition: ".4s ease",
              },
            },
          }}
        >
          <Item
            title="Dashboard"
            path="/"
            colors={colors}
            icon={<DashboardOutlined />}
          />
        </Menu>
        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{ m: "15px 0 5px 20px" }}
        >
          {!collapsed ? "Data" : " "}
        </Typography>{" "}
        <Menu
          menuItemStyles={{
            button: {
              ":hover": {
                color: "#3da58a",
                background: "transparent",
                transition: ".4s ease",
              },
            },
          }}
        >
          <Item
            title="Dispense History"
            path="/dispenseHistory"
            colors={colors}
            icon={<ContactsOutlined />}
          />
          <Item
            title="Machine Status"
            path="/machineStatus"
            colors={colors}
            icon={<ReceiptOutlined />}
          />
          <Item
            title="Refilling History"
            path="/refillingHistory"
            colors={colors}
            icon={<ContactsOutlined />}
          />
        </Menu>
        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{ m: "15px 0 5px 20px" }}
        >
          {!collapsed ? "Reports" : " "}
        </Typography>{" "}
        <Menu
          menuItemStyles={{
            button: {
              ":hover": {
                color: "#3da58a",
                background: "transparent",
                transition: ".4s ease",
              },
            },
          }}
        >
          {/* {userRole === "admin" && (
            <Item
              title="Organisational Reports"
              path="/reports"
              colors={colors}
              icon={<ContactsOutlined />}
            />
          )} */}

          {userRole === "admin" && (
            <>
              {/* PARENT MENU */}
              <Box
                onClick={() => setOpenOrgReports(!openOrgReports)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  pl: "27px",
                  py: "10px",
                  color: colors,
                  "&:hover": {
                    backgroundColor: colors.primary[400],
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap="17px">
                  <ContactsOutlined />
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#fff" }}>Organisational Reports</Typography>
                </Box>

                {openOrgReports ? (
                  <KeyboardArrowDownIcon
                    sx={{
                      transition: "0.3s",
                    }}
                  />
                ) : (
                  <KeyboardArrowRightIcon
                    sx={{
                      transition: "0.3s",
                    }}
                  />
                )}
              </Box>

              {/* CHILD MENU */}
              {openOrgReports && (
                <Box ml="15px">
                  <Item
                    title="Machine Wise Report"
                    path="/reports/machine_wise_dispense"
                    colors={colors}
                    icon={<BarChartOutlinedIcon fontSize="small" />}
                  />

                  <Item
                    title="State Wise Report"
                    path="/reports/state_district_wise_dispense"
                    colors={colors}
                    icon={<PieChartOutlineIcon fontSize="small" />}
                  />

                  <Item
                    title="Average Consumption Report"
                    path="/reports/avg_consumption_comparison"
                    colors={colors}
                    icon={<PieChartOutlineIcon fontSize="small" />}
                  />
                </Box>
              )}
            </>
          )}

          {(userRole === "admin" || userRole === "user") && (
            <>
              {/* PARENT MENU */}
              <Box
                onClick={() => setOpenPesReports(!openPesReports)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  pl: "27px",
                  py: "10px",
                  color: colors,
                  "&:hover": {
                    backgroundColor: colors.primary[400],
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap="17px">
                  <ContactsOutlined />
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#fff" }}>Personal Reports</Typography>
                </Box>

                {openPesReports ? (
                  <KeyboardArrowDownIcon
                    sx={{
                      transition: "0.3s",
                    }}
                  />
                ) : (
                  <KeyboardArrowRightIcon
                    sx={{
                      transition: "0.3s",
                    }}
                  />
                )}
              </Box>

              {/* CHILD MENU */}
              {openPesReports && (
                <Box ml="15px">
                  <Item
                    title="Machine Wise Report"
                    path="/reports/machine_wise_dispense"
                    colors={colors}
                    icon={<BarChartOutlinedIcon fontSize="small" />}
                  />

                  <Item
                    title="State Wise Report"
                    path="/reports/state_district_wise_dispense"
                    colors={colors}
                    icon={<PieChartOutlineIcon fontSize="small" />}
                  />

                  <Item
                    title="Average Consumption Report"
                    path="/reports/avg_consumption_comparison"
                    colors={colors}
                    icon={<PieChartOutlineIcon fontSize="small" />}
                  />
                </Box>
              )}
            </>
          )}

          {(userRole === "superadmin") && (
            <>
              {/* PARENT MENU */}
              <Box
                onClick={() => setOpenSupAdReports(!openSupAdReports)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  pl: "27px",
                  py: "10px",
                  color: colors,
                  "&:hover": {
                    backgroundColor: colors.primary[400],
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap="17px">
                  <ContactsOutlined />
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#fff" }}>Super Admin Reports</Typography>
                </Box>

                {openSupAdReports ? (
                  <KeyboardArrowDownIcon
                    sx={{
                      transition: "0.3s",
                    }}
                  />
                ) : (
                  <KeyboardArrowRightIcon
                    sx={{
                      transition: "0.3s",
                    }}
                  />
                )}
              </Box>

              {/* CHILD MENU */}
              {openSupAdReports && (
                <Box ml="15px">
                  <Item
                    title="Machine Wise Dispense and Refill"
                    path="/reports/machine_wise_dispense_refill"
                    colors={colors}
                    icon={<BarChartOutlinedIcon fontSize="small" />}
                  />

                  {/* <Item
                    title="State Wise Report"
                    path="/reports/state_district_wise_dispense"
                    colors={colors}
                    icon={<PieChartOutlineIcon fontSize="small" />}
                  />

                  <Item
                    title="Average Consumption Report"
                    path="/reports/avg_consumption_comparison"
                    colors={colors}
                    icon={<PieChartOutlineIcon fontSize="small" />}
                  /> */}
                </Box>
              )}
            </>
          )}

          {userRole === "admin" && (
            <Item
              title="Saved Reports"
              path="/saved-reports"
              colors={colors}
              icon={<ContactsOutlined />}
            />
          )}
          {userRole === "superadmin" && (
            <Item
              title="Super Admin Reports"
              path="/refillingHistory"
              colors={colors}
              icon={<ContactsOutlined />}
            />
          )}
        </Menu>
        {userRole === "admin" && (
          <>
            <Typography
              variant="h6"
              color={colors.gray[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              {!collapsed ? "Admin" : " "}
            </Typography>
            <Menu
              menuItemStyles={{
                button: {
                  ":hover": {
                    color: "#3da58a",
                    background: "transparent",
                    transition: ".4s ease",
                  },
                },
              }}
            >
              <Item
                title="Users"
                path="/team"
                colors={colors}
                icon={<PeopleAltOutlined />}
              />
              <Item
                title="Schools"
                path="/schools"
                colors={colors}
                icon={<PeopleAltOutlined />}
              />
              <Item
                title="Allocation Master"
                path="/allocateMachine"
                colors={colors}
                icon={<AssignmentOutlined />}
              />
              <Item
                title="Geo Locations"
                path="/geoLocations"
                colors={colors}
                icon={<ReceiptOutlined />}
              />
              <Item
                title="Spocs"
                path="/spocs"
                colors={colors}
                icon={<ReceiptOutlined />}
              />
              <Item
                title="Manual Pad Distribution"
                path="/manual-pad-distribute"
                colors={colors}
                icon={<ReceiptOutlined />}
              />
            </Menu>
          </>
        )}
        {userRole === "admin" && (
          <>
            <Typography
              variant="h6"
              color={colors.gray[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              {!collapsed ? "Masters" : " "}
            </Typography>
            <Menu
              menuItemStyles={{
                button: {
                  ":hover": {
                    color: "#3da58a",
                    background: "transparent",
                    transition: ".4s ease",
                  },
                },
              }}
            >
              <Item
                title="User Master"
                path="/userForm"
                colors={colors}
                icon={<PeopleAltOutlined />}
              />

              <Item
                title="School Master"
                path="/registerSchool"
                colors={colors}
                icon={<BusinessOutlined />}
              />

              <Item
                title="Vending Machine Master"
                path="/vendingMaster"
                icon={<DevicesOutlined />}
              />

              <Item
                title="Geo Master"
                path="/geoForm"
                colors={colors}
                icon={<BusinessOutlined />}
              />
              <Item
                title="Ngo Spoc Master"
                path="/ngo"
                colors={colors}
                icon={<PeopleAltOutlined />}
              />
            </Menu>
          </>
        )}
      </Box>
    </Sidebar>
  );
};

export default SideBar;
