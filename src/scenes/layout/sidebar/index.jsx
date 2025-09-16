/* eslint-disable react/prop-types */
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { useContext, useState, useEffect } from "react";
import { tokens } from "../../../theme";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
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

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { toggled, setToggled } = useContext(ToggledContext);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userRole, setUserRole] = useState(null);

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
