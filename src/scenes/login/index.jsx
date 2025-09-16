import React, { useState } from "react";
import {
  useTheme,
  TextField,
  Button,
  CircularProgress,
  Box,
  Typography,
  Grid,
  useMediaQuery,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, verifyOtp } from "../../store/loginAPI";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme"; // Assuming you have the theme tokens file
import logo from "../../assets/images/logo.png";
import logo43 from "../../assets/images/4logo.png";
import logo1 from "../../assets/images/1.png";
import logo2 from "../../assets/images/2.png";
import logo3 from "../../assets/images/3.png";
import logo4 from "../../assets/images/6.png";
import greenbg from "../../assets/images/greenbg.png";
import {OtpInputField} from './index.style'

const OTPInput = ({ value, onChange, error }) => {
  const handleChange = (e, index) => {
    const newValue = [...value];
    newValue[index] = e.target.value.slice(0, 1); // Allow only one character per field
    onChange(newValue);

    // Automatically move focus to the next field
    if (e.target.value !== "" && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && value[index] === "") {
      // Move focus to the previous field if the current is empty and backspace is pressed
      if (index > 0) {
        document.getElementById(`otp-input-${index - 1}`).focus();
      }
    }
  };

  return (
    <Box display="flex" justifyContent="space-between" mb={2}>
      {Array.from({ length: 6 }).map((_, index) => (
        <OtpInputField
          key={index}
          id={`otp-input-${index}`}
          value={value[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          type="tel"
          inputProps={{
            maxLength: 1,
            inputMode: "numeric",
            pattern: "[0-9]*",
            style: { textAlign: "center" },
          }}
          variant="outlined"
          sx={{
            backgroundColor: "#f0f0f0",
            marginRight: "10px",
            "& .MuiInputBase-root": { padding: "0px" },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: error ? "red" : "#ddd",
            },
            "&:focus .MuiOutlinedInput-notchedOutline": {
              borderColor: "#4caf50", // Green border on focus
            },
          }}
        />
      ))}
    </Box>
  );
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, otpSent } = useSelector((state) => state.auth);
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState(Array(6).fill("")); // Array to hold the 6 OTP digits
  const [step, setStep] = useState("mobile");
  const [sendOtpError, setSendOtpError] = useState("");

  // Media query for responsive design
  const isSmallScreen = useMediaQuery("(max-width:900px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleSendOtp = async () => {
    if (!mobileNumber) {
      alert("Please enter a mobile number.");
      return;
    }
    setSendOtpError("");
    try {
      const result = await dispatch(sendOtp(mobileNumber));
      if (sendOtp.fulfilled.match(result)) {
        setStep("otp");
      } else {
        setSendOtpError("Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setSendOtpError("An unexpected error occurred. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.join("") === "") {
      alert("Please enter OTP.");
      return;
    }
  
    try {
      await dispatch(verifyOtp({ mobileNumber, otp: otp.join("") })).unwrap();
      navigate("/"); // Success, go to home
    } catch (error) {
     
      setOtp(Array(6).fill("")); // Reset OTP
      setSendOtpError("Invalid OTP. Please try again.");
    }
  };
  

  const handleNavigateToRegister = () => {
    navigate("/register"); // Navigate to the Register page
  };

  return (
    <Grid container sx={{ height: "100vh" }}>
      {/* Left part: Login Form */}
      <Grid
        item
        xs={12}
        md={6}
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ backgroundColor: "rgba(242, 240, 240, 1)", padding: "20px" }}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          width="100%"
        >
          <img
            src={logo}
            alt="Pinkishe"
            style={{ width: "150px", marginBottom: "20px" }}
          />

          <Typography
            variant="h4"
            fontWeight="600"
            color="rgba(58, 58, 58, 1)"
            mb={2}
          >
            Sign in to Pinkishe Padtracker
          </Typography>

          {step === "mobile" ? (
            <Box
              sx={{
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <TextField
                label="Mobile Number"
                variant="filled"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                fullWidth
                mb={2}
                sx={{
                  backgroundColor: colors.primary[1000],
                  "& .MuiInputBase-root": { color: colors.gray[100] },
                  "& .MuiInputLabel-root": { color: colors.gray[100] },
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendOtp}
                disabled={loading}
                fullWidth
                sx={{
                  mt: 2,
                  background:
                    "linear-gradient(91.43deg, #36825D 5.61%, #003F21 92.85%)",
                  "&:hover": {
                    background:
                      "linear-gradient(91.43deg, #36825D 5.61%, #003F21 92.85%)",
                  },
                  color: "#FFFFFF",
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Send OTP"}
              </Button>

              {sendOtpError && (
                <Typography color="error" mt={2}>
                  {sendOtpError}
                </Typography>
              )}
            </Box>
          ) : (
            <Box>
              <OTPInput value={otp} onChange={setOtp} error={sendOtpError} />
              <Button
                variant="contained"
                color="primary"
                onClick={handleVerifyOtp}
                disabled={loading}
                fullWidth
                sx={{
                  mt: 2,
                  background:
                    "linear-gradient(91.43deg, #36825D 5.61%, #003F21 92.85%)",
                  "&:hover": {
                    background:
                      "linear-gradient(91.43deg, #36825D 5.61%, #003F21 92.85%)",
                  },
                  color: "#FFFFFF",
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Verify OTP"}
              </Button>

              {sendOtpError && (
                <Typography color="error" mt={2}>
                  {sendOtpError}
                </Typography>
              )}
            </Box>
          )}

          {otpSent && step === "otp" && (
            <Typography color="black" mt={2}>
              OTP has been sent to your mobile number. Please check and enter
              it.
            </Typography>
          )}
        </Box>
      </Grid>

      {/* Right part: "Hello friends" screen */}
      {!isSmallScreen && (
        <Grid
          item
          md={6}
          sx={{
            backgroundImage: `url(${greenbg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            height: "100vh", // Full height of the screen
          }}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            width="100%"
          >
            <Typography
              variant="h4"
              fontWeight="600"
              color="rgba(255, 255, 255, 1)"
              mb={2}
            >
              Welcome
            </Typography>
            <Typography
              variant="p"
              fontSize={"20px"}
              color="rgba(255, 255, 255, 1)"
              mb={2}
            >
              Enter your personal details and start journey with us.
            </Typography>
            <div
              style={{
                backgroundColor: "rgba(217, 217, 217, 1)",

                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                borderRadius: "15px",
                padding: "20px",
                gap: "20px", // space between rows
              }}
            >
              {/* First row of logos */}
              <div
                style={{
                  display: "flex",
                  gap: "20px", // space between images
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={logo1}
                  alt="Pinkishe"
                  style={{
                    width: "200px",
                    height: "150px",
                    objectFit: "contain",
                  }}
                />
                <img
                  src={logo2}
                  alt="Pinkishe"
                  style={{
                    width: "200px",
                    height: "150px",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* Second row of logos */}
              <div
                style={{
                  display: "flex",
                  gap: "20px", // space between images
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={logo3}
                  alt="Pinkishe"
                  style={{
                    width: "200px",
                    height: "150px",
                    objectFit: "contain",
                  }}
                />
                <img
                  src={logo4}
                  alt="Pinkishe"
                  style={{
                    width: "200px",
                    height: "150px",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default Login;
