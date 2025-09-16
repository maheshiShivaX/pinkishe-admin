import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { tokens, ColorModeContext } from "../../../theme";
import { useContext, useState } from "react";
import {
  DarkModeOutlined,
  LightModeOutlined,
  MenuOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import { ToggledContext } from "../../../App";
import { useNavigate } from "react-router-dom"; 

const Navbar = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const { toggled, setToggled } = useContext(ToggledContext);
  const isMdDevices = useMediaQuery("(max-width:768px)");
  const isXsDevices = useMediaQuery("(max-width:466px)");
  const colors = tokens(theme.palette.mode);

  // State for controlling the Menu
  const [anchorEl, setAnchorEl] = useState(null);

  const navigate = useNavigate();

  // Handle opening of the menu
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing of the menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  
  const handleLogout = () => {
    localStorage.removeItem("token"); 
    localStorage.removeItem("authToken"); 
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    navigate("/login"); 
    handleClose(); 
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
      <Box display="flex" alignItems="center" gap={2}>
        <IconButton
          sx={{ display: `${isMdDevices ? "flex" : "none"}` }}
          onClick={() => setToggled(!toggled)}
        >
          <MenuOutlined />
        </IconButton>
        <Box
          display="flex"
          alignItems="center"
          bgcolor={colors.primary[400]}
          borderRadius="3px"
          sx={{ display: `${isXsDevices ? "none" : "flex"}` }}
        />
      </Box>

      <Box>
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <LightModeOutlined />
          ) : (
            <DarkModeOutlined />
          )}
        </IconButton>

        <IconButton onClick={handleClick}>
          <PersonOutlined />
        </IconButton>

        {/* Menu for Profile and Logout */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          {/* <MenuItem onClick={handleClose}>Profile</MenuItem> */}
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Navbar;
