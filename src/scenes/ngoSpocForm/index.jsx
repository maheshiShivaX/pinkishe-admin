// src/scenes/forms/NgoSpocForm.jsx
import React from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import {
  addNgoSpoc,
  fetchNgoSpoc,
  updateNgoSpoc,
} from "../../store/ngoSpocSlice";
import { showNotification } from "../../store/notificationSlice";
import { Header } from "../../components";
import NotificationModal from "../notificationModal";

const NgoSpocForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const token = localStorage.getItem("authToken");

  const navigate = useNavigate();
  const location = useLocation();
  const { ngoSpocNames } = location.state || {};

  const [initialValues, setInitialValues] = useState({
    spocName: "",
    spocType: "",
    spocMobileNo: "",
  });

  useEffect(() => {
    if (ngoSpocNames) {
      setInitialValues({
        spocName: ngoSpocNames.spocName,
        spocType: ngoSpocNames.spocType,
        spocMobileNo: ngoSpocNames.spocMobileNo,
      });
    }
  }, [ngoSpocNames]);

  const validationSchema = yup.object().shape({
    spocName: yup.string().required("Spoc Name is required"),
    spocType: yup.string().required("Spoc Type is required"),
    spocMobileNo: yup
      .string()
      .matches(/^\d{10}$/, "Mobile number must be exactly 10 digits")
      .required("Mobile Number is required"),
  });

  const handleFormSubmit = (values, actions) => {
    if (id) {
      dispatch(updateNgoSpoc({ id, spocData: values }))
        .unwrap()
        .then(() => {
          dispatch(
            showNotification({
              message: "Spoc updated successfully!",
              type: "success",
            })
          );
          actions.resetForm({ values: initialValues });
          navigate("/spocs");
        })
        .catch((error) => {
          dispatch(
            showNotification({
              message: "Error updating Spoc.",
              type: "error",
            })
          );
        });
    } else {
      dispatch(addNgoSpoc(values))
        .unwrap()
        .then(() => {
          dispatch(
            showNotification({
              message: `Spoc: ${values.spocName} has been added.`,
              type: "success",
            })
          );
          dispatch(fetchNgoSpoc(token));
          actions.resetForm({ values: initialValues });
        })
        .catch(() => {
          dispatch(
            showNotification({
              message: "Error adding Spoc.",
              type: "error",
            })
          );
        });
    }
  };

  return (
    <Box m="20px">
      <Header
        title={id ? "EDIT SPOC" : "SPOC REGISTRATION"}
        subtitle={id ? "Update Spoc Details" : "Register a New Spoc"}
      />
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
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
              sx={{ "& > div": { gridColumn: "span 4" } }}
            >
              <TextField
                label="Spoc Name"
                name="spocName"
                value={values.spocName}
                onBlur={handleBlur}
                onChange={handleChange}
                error={touched.spocName && !!errors.spocName}
                helperText={touched.spocName && errors.spocName}
                variant="filled"
                sx={{ gridColumn: "span 2" }}
              />

              <FormControl fullWidth variant="filled">
                <InputLabel>Spoc Type</InputLabel>
                <Select
                  label="Spoc Type"
                  name="spocType"
                  value={values.spocType}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={touched.spocType && !!errors.spocType}
                >
                  <MenuItem value="ngoSpoc">Ngo Spoc</MenuItem>
                  <MenuItem value="ngoCoordinator">Ngo Coordinator</MenuItem>
                  <MenuItem value="schoolSpoc">School Spoc</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Phone Number"
                name="spocMobileNo"
                value={values.spocMobileNo}
                onBlur={handleBlur}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: e.target.name,
                      value: e.target.value.replace(/\D/g, ""),
                    },
                  })
                }
                error={touched.spocMobileNo && !!errors.spocMobileNo}
                helperText={touched.spocMobileNo && errors.spocMobileNo}
                variant="filled"
                inputProps={{ maxLength: 10 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">+91</InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
              Save
              </Button>
            </Box>
          </form>
        )}
      </Formik>
      <NotificationModal />
    </Box>
  );
};

export default NgoSpocForm;
