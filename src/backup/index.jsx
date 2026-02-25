/* eslint-disable react/prop-types */
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { tokens } from "../../../theme";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
import { MenuOutlined } from "@mui/icons-material";
import logo from "../../../assets/images/logo.png";
import Item from "./Item";
import { ToggledContext } from "../../../App";
import { useDispatch, useSelector } from "react-redux";
import { fetchSideMenus } from "../../../store/sidemenuSlice";

const SideBar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { toggled, setToggled } = useContext(ToggledContext);
  const [collapsed, setCollapsed] = useState(false);

  const dispatch = useDispatch();
  const { menus, loading } = useSelector((state) => state.sidemenu);

  useEffect(() => {
    dispatch(fetchSideMenus());
  }, [dispatch]);

  return (
    <Sidebar
      backgroundColor={colors.primary[400]}
      rootStyles={{ border: 0, height: "100%" }}
      collapsed={collapsed}
      toggled={toggled}
      onBackdropClick={() => setToggled(false)}
      breakPoint="md"
    >
      {/* LOGO */}
      <Menu>
        <MenuItem
          rootStyles={{
            margin: "10px 0 20px 0",
            color: colors.gray[100],
            backgroundColor: "transparent",
            paddingLeft: "20px"
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            {!collapsed && (
              <img
                src={logo}
                alt="Logo"
                style={{ maxWidth: "130px" }}
              />
            )}
            <IconButton onClick={() => setCollapsed(!collapsed)}>
              <MenuOutlined />
            </IconButton>
          </Box>
        </MenuItem>
      </Menu>

      <Box mb={5}>
        {menus.map((menu) => {

          // 1️⃣ Single Menu
          if (!menu.children || menu.children.length === 0) {
            return (
              <Menu key={menu.id}>
                <Item
                  title={menu.name}
                  path={menu.url}
                  icon={menu.icon && <i className={menu.icon} />}
                />
              </Menu>
            );
          }

          // 2️⃣ Section Menu (Data, Admin, Masters, Reports)
          return (
            <Box key={menu.id}>
              {!collapsed && (
                <Typography
                  variant="h6"
                  sx={{
                    m: "15px 0 5px 20px",
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    opacity: 0.7
                  }}
                >
                  {menu.name}
                </Typography>
              )}

              <Menu>
                {menu.children.map((child) => (
                  <Item
                    key={child.id}
                    title={child.name}
                    path={child.url}
                    icon={child.icon && <i className={child.icon} />}
                  />
                ))}
              </Menu>
            </Box>
          );
        })}
      </Box>

    </Sidebar>
  );
};

export default SideBar;
