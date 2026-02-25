import React, { useState } from "react";
import {
  useTheme,
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  CircularProgress,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import * as yup from "yup";
import { registerUser } from "../../store/registerSlice"; // Redux action for registration
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme"; // Assuming theme tokens are used for styling
import logo4 from "../../assets/images/4logo.png";

const initialValues = {
  name: "",
  // lastName: "",
  emailId: "",
  mobileNo: "",
};

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const validationSchema = yup.object().shape({
  name: yup.string().required("required"),
  // lastName: yup.string().required("required"),
  emailId: yup.string().email("invalid email").required("required"),
  mobileNo: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .required("required"),
});

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage } = useSelector((state) => state.auth); // Get loading, error, and successMessage
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const isSmallScreen = useMediaQuery("(max-width:900px)");
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleFormSubmit = (values, actions) => {
    dispatch(registerUser(values))
      .unwrap()
      .then(() => {
        actions.resetForm();
        navigate("/login"); // Navigate to login page after successful registration
      })
      .catch((error) => {
        actions.setSubmitting(false); // Stop the form submission spinner on error
      });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleNavigateToRegister = () => {
    navigate("/login"); // Navigate to the Register page
  };
  return (
    <Grid container sx={{ height: "100vh" }}>
      {/* Left part: Registration Form */}
      <Grid
        item
        xs={12}
        md={6}
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ backgroundColor: "#434957", padding: "20px" }}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          width="100%"
        >
          <Typography variant="h4" fontWeight="600" color="#e0e0e0" mb={2}>
            Create your account
          </Typography>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleFormSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit}>
                <Box
                  display="grid"
                  gap="30px"
                  gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                  sx={{
                    "& > div": {
                      gridColumn: isNonMobile ? undefined : "span 4",
                    },
                  }}
                >
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.name}
                    name="name"
                    error={touched.name && errors.name}
                    helperText={touched.name && errors.name}
                    sx={{
                      gridColumn: "span 4",
                    }}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.emailId}
                    name="emailId"
                    error={touched.emailId && errors.emailId}
                    helperText={touched.emailId && errors.emailId}
                    sx={{ gridColumn: "span 4" }}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Contact Number"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.mobileNo}
                    name="mobileNo"
                    error={touched.mobileNo && errors.mobileNo}
                    helperText={touched.mobileNo && errors.mobileNo}
                    sx={{ gridColumn: "span 4" }}
                  />

                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    disabled={loading}
                    sx={{
                      mt: 2,
                      backgroundColor: colors.greenAccent[500],
                      "&:hover": { backgroundColor: colors.greenAccent[700] },
                      color: "rgba(0, 0, 0, 0.87)",
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : "Register"}
                  </Button>

                </Box>
              </form>
            )}
          </Formik>

          <Typography
            variant="body2"
            color="textSecondary"
            textAlign="center"
            mt={2}
          >
            Already Registered?{" "}
            <span
              onClick={handleNavigateToRegister}
              style={{ color: "#4cceac", cursor: "pointer" }}
            >
              Login here
            </span>
          </Typography>

          {/* Snackbar to show success or error message */}
          {successMessage && (
            <Snackbar
              open={true}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
            >
              <Alert onClose={handleCloseSnackbar} severity="success">
                {successMessage}
              </Alert>
            </Snackbar>
          )}
          {error && (
            <Snackbar
              open={true}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
            >
              <Alert onClose={handleCloseSnackbar} severity="error">
                {error}
              </Alert>
            </Snackbar>
          )}
        </Box>
      </Grid>

      {/* Right part: "Welcome" screen */}
      {!isSmallScreen && (
        <Grid
          item
          md={6}
          sx={{ backgroundColor: "#141b2d" }}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <img
            src={logo4}
            alt="Pinkishe"
            style={{ width: "600px", height: "450px" }}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default RegisterForm;
