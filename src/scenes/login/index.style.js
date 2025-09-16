// src/pages/Login/Login.styles.js
import { styled } from "@mui/material/styles";
import { Box, Grid, TextField, Button, Typography } from "@mui/material";





export const OtpInputField = styled(TextField)(({ theme }) => ({
    "& .MuiInputBase-input": {
      textAlign: "center",
      [theme.breakpoints.down("sm")]: {
        width: "20px",
        height: "30px",
        fontSize: "16x",
      },
      [theme.breakpoints.up("sm")]: {
        width: "44px",
        height: "48px",
        fontSize: "18px",
      },
      [theme.breakpoints.up("md")]: {
        width: "40px",
        height: "44px",
        fontSize: "20px",
      },
    },
  }));

export const OTPBox = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

