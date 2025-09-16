import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from "@mui/material";
import { Header } from "../../components";
import { Formik } from "formik";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, updateUser } from "../../store/registerSlice"; // Import async thunks
import { showNotification } from "../../store/notificationSlice"; // Import the notification action
import NotificationModal from "../notificationModal"; // Notification Modal for alerts

const UserForm = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userDetails } = useSelector((state) => state.user);

  const [initialValues, setInitialValues] = useState({
    name: "",
    mobileNo: "",
    emailId: "",
    role: "",
  });

  // Fetch the user details for editing if the username is provided in URL
  useEffect(() => {
    if (username && userDetails.length > 0) {
      const userToEdit = userDetails.find((user) => user.username === username);
      if (userToEdit) {
        setInitialValues({
          name: userToEdit.name,
          mobileNo: userToEdit.mobileNo,
          emailId: userToEdit.emailId,
          role: userToEdit.role,
        });
      }
    }
  }, [username, userDetails]);

  // Yup validation schema
  const checkoutSchema = yup.object().shape({
    name: yup.string().required("required"),
    mobileNo: yup.string().matches(/^\d{10}$/, "Mobile number must be exactly 10 digits").required("required"),
    emailId: yup.string().email("Invalid email format").required("required"),
    role: yup.string().required("required"),
  });

  // Handle form submit (for both create and edit operations)
  const handleFormSubmit = (values, actions) => {
    if (username) {
      dispatch(updateUser({ username, userData: values }))
        .unwrap()
        .then(() => {
          dispatch(
            showNotification({
              message: "User updated successfully!",
              type: "success",
            })
          );
          actions.resetForm({ values: initialValues });
          navigate("/team"); 
        })
        .catch((error) => {
          dispatch(
            showNotification({ message: "Error updating user.", type: "error" })
          );
        });
    } else {
      dispatch(registerUser(values))
        .unwrap()
        .then(() => {
          dispatch(
            showNotification({
              message: "User created successfully!",
              type: "success",
            })
          );
          actions.resetForm({ values: initialValues });
        })
        .catch((error) => {
          dispatch(
            showNotification({ message: "Error creating user.", type: "error" })
          );
        });
    }
  };

  return (
    <Box m="20px">
      <Header
        title="USER MANAGEMENT"
        subtitle={username ? `Edit User: ${username}` : "Create a New User"}
      />

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
                  gridColumn: "span 4",
                },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Full Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.name}
                name="name"
                error={touched.name && errors.name}
                helperText={touched.name && errors.name}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Mobile Number"
                onBlur={handleBlur}
                onChange={(e) => {
                  // Allow only numeric values by stripping out any non-numeric characters
                  const numericValue = e.target.value.replace(/\D/g, ''); // Replace non-numeric characters with empty string
                  handleChange({
                    target: {
                      name: e.target.name,
                      value: numericValue, // Set the new numeric-only value
                    },
                  });
                }}
                value={values.mobileNo}
                name="mobileNo"
                error={touched.mobileNo && errors.mobileNo}
                helperText={touched.mobileNo && errors.mobileNo}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+91</InputAdornment>, // Fixed country code
                }}
                inputProps={{
                  maxLength: 10, // Ensure that the input doesn't exceed 10 digits
                  pattern: "[0-9]*", // Allow only numeric input
                }}
                
              />
              <TextField
                fullWidth
                variant="filled"
                type="email"
                label="Email Address"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.emailId}
                name="emailId"
                error={touched.emailId && errors.emailId}
                helperText={touched.emailId && errors.emailId}
              />
              <FormControl fullWidth variant="filled">
                <InputLabel>Role</InputLabel>
                <Select
                  label="Role"
                  value={values.role}
                  name="role"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={touched.role && errors.role}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                 
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="end"
              mt="20px"
            >
              <Button type="submit" color="secondary" variant="contained">
                Save
              </Button>
            </Box>
          </form>
        )}
      </Formik>

      {/* Notification Modal */}
      <NotificationModal />
    </Box>
  );
};

export default UserForm;
