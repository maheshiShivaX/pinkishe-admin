import { Typography } from "@mui/material";
import { styled } from "@mui/system";

export const HeadNumberTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: "42px", // default fallback

  [theme.breakpoints.up("sm")]: {
    fontSize: "42px",
  },
  [theme.breakpoints.up("md")]: {
    fontSize: "56px",
  },
  [theme.breakpoints.up("lg")]: {
    fontSize: "70px",
  },
}));



export const TextGreenTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    fontSize: "10px", // Default for very small screens
  
    [theme.breakpoints.up("sm")]: {
      fontSize: "16px",
    },
    [theme.breakpoints.up("md")]: {
      fontSize: "16px",
    },
    [theme.breakpoints.up("lg")]: {
      fontSize: "16px",
    },
  }));