import React from "react";
import { Box, Button, TextField, MenuItem, Select, InputLabel, FormControl, useMediaQuery, Snackbar, Alert } from "@mui/material";
import { Header } from "../../components";
import { Formik } from "formik";
import * as yup from "yup";
import { useDispatch, useSelector } from 'react-redux';
import { saveOrganisation } from "../../store/organisationSlice"; // Import the async thunk

const initialValues = {
  organisationName: "",
  organisationType: ""
};

const checkoutSchema = yup.object().shape({
  organisationName: yup.string().required("required"),
  organisationType: yup.string().required("required"),
});

const OrganisationForm = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector((state) => state.organisation); // Get loading, error, and successMessage

  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  const handleFormSubmit = (values, actions) => {
    dispatch(saveOrganisation(values))
      .unwrap()
      .then(() => {
        actions.resetForm({ values: initialValues });
      })
      .catch((error) => {
        // You could set an error message in the Redux store as well, but it's not strictly necessary
      });
  };

  // Function to close the Snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Determine if it's a success or error message
  const message = successMessage || error;
  const severity = successMessage ? 'success' : 'error';

  return (
    <Box m="20px">
      <Header title="ADD ORGANISATION" subtitle="Create a New Organisation" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
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
                label="Organisation Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.organisationName}
                name="organisationName"
                error={touched.organisationName && errors.organisationName}
                helperText={touched.organisationName && errors.organisationName}
                sx={{
                  gridColumn: "span 2",
                }}
              />
              
              {/* Organisation Type Dropdown */}
              <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 2" }}>
                <InputLabel>Organisation Type</InputLabel>
                <Select
                  label="Organisation Type"
                  value={values.organisationType}
                  name="organisationType"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={touched.organisationType && errors.organisationType}
                  sx={{ gridColumn: "span 2" }}
                >
                  <MenuItem value="school">School</MenuItem>
                  <MenuItem value="government">Government</MenuItem>
                  <MenuItem value="csrrganization">CSROrganization</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="end"
              mt="20px"
            >
              <Button type="submit" color="secondary" variant="contained" disabled={loading}>
                {loading ? 'Creating...' : 'Create New User'}
              </Button>
            </Box>
          </form>
        )}
      </Formik>

      {/* Snackbar to show success or error message */}
      {message && (
        <Snackbar
          open={true}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity={severity}>
            {message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default OrganisationForm;
