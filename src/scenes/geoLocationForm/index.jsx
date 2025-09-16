import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import { Header } from "../../components";
import { Formik } from "formik";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { saveGeolocation, updateGeolocation } from "../../store/geolocationSlice";
import statesDistricts from "../../../src/data/stateDistricts";
import { showNotification } from "../../store/notificationSlice";
import NotificationModal from "../notificationModal";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

const checkoutSchema = yup.object().shape({
  state: yup.string().required("State is required"),
  district: yup.string().required("District is required"),
  block: yup.string().required("Block is required"),
});

const GeoLocationForm = () => {
  const { id } = useParams();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector(
    (state) => state.geolocation
  );
  const [districts, setDistricts] = useState([]);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const geoLocationData = location.state?.geoLocationData || {};

  const [initialValues, setInitialValues] = useState({
    state: geoLocationData.state || "",
    district: geoLocationData.district || "",
    block: geoLocationData.block || "",
  });

  useEffect(() => {
    // Update initial values and districts when geoLocationData changes
    if (id && geoLocationData) {
      setInitialValues({
        state: geoLocationData.state,
        district: geoLocationData.district,
        block: geoLocationData.block,
      });

      const selectedDistricts = statesDistricts[geoLocationData.state] || [];
      setDistricts(selectedDistricts);
    }
  }, [geoLocationData]);

 

  const handleFormSubmit = (values, actions) => {
    if (id) {
      // If there's an ID (for editing), update the geo-location
      dispatch(updateGeolocation({ id, geoLocationData: values }))
        .unwrap()
        .then(() => {
          dispatch(
            showNotification({
              message: "Geo Location updated successfully!",
              type: "success",
            })
          );
          actions.resetForm({ values: initialValues });
          navigate("/geoLocations");
        })
        .catch((error) => {
          dispatch(
            showNotification({
              message: "Error while updating Geo Location.",
              type: "error",
            })
          );
        });
    } else {
      // If no ID (for adding), save a new geo-location
      dispatch(saveGeolocation(values))
        .unwrap()
        .then(() => {
          dispatch(
            showNotification({
              message: "Geo Location added successfully!",
              type: "success",
            })
          );
          actions.resetForm({ values: initialValues });
        })
        .catch((error) => {
          dispatch(
            showNotification({
              message: "Error while adding Geo Location.",
              type: "error",
            })
          );
        });
    }
  };

  const handleStateChange = (event) => {
    const selectedState = event.target.value;
    const selectedDistricts = statesDistricts[selectedState] || [];
    setDistricts(selectedDistricts);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const message = successMessage || error;
  const severity = successMessage ? "success" : "error";

  return (
    <Box m="20px">
      <Header title="ADD GEOLOCATION" subtitle="Create a New Geolocation" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
        enableReinitialize
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
              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 2" }}
              >
                <InputLabel>State</InputLabel>
                <Select
                  label="State"
                  value={values.state}
                  name="state"
                  onBlur={handleBlur}
                  onChange={(event) => {
                    handleChange(event);
                    handleStateChange(event); // Update district options when state changes
                  }}
                  error={touched.state && errors.state}
                  sx={{ gridColumn: "span 2" }}
                >
                  {Object.keys(statesDistricts).map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* District Dropdown */}
              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 2" }}
              >
                <InputLabel>District</InputLabel>
                <Select
                  label="District"
                  value={values.district}
                  name="district"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={touched.district && errors.district}
                  disabled={!values.state}
                  sx={{ gridColumn: "span 2" }}
                >
                  {districts.map((district) => (
                    <MenuItem key={district} value={district}>
                      {district}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Block Input */}
              <TextField
                fullWidth
                variant="filled"
                label="Block"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.block}
                name="block"
                error={touched.block && errors.block}
                helperText={touched.block && errors.block}
                sx={{ gridColumn: "span 2" }}
              />
            </Box>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="end"
              mt="20px"
            >
              <Button
                type="submit"
                color="secondary"
                variant="contained"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </Box>
          </form>
        )}
      </Formik>
      <NotificationModal />
    </Box>
  );
};

export default GeoLocationForm;
