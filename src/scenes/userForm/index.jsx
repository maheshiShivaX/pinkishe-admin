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
  InputAdornment,
} from "@mui/material";
import { Header } from "../../components";
import { Formik } from "formik";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, updateUser } from "../../store/registerSlice";
import { showNotification } from "../../store/notificationSlice";
import NotificationModal from "../notificationModal";
import { fetchRoles } from "../../store/roleSlice";

const UserForm = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userDetails } = useSelector((state) => state.user);
  const { roles, loading: rolesLoading } = useSelector((state) => state.role);

  const token = localStorage.getItem("token");
  const roleId = Number(localStorage.getItem("roleId")); // ✅ number
  const role = localStorage.getItem("userRole"); // ✅ string

  const [initialValues, setInitialValues] = useState({
    name: "",
    mobileNo: "",
    emailId: "",
    role: "",
  });

  // ✅ Fetch roles
  useEffect(() => {
    if (token) {
      dispatch(fetchRoles(token));
    }
  }, [dispatch, token]);

  // ✅ Edit mode prefill
  useEffect(() => {
    if (username && userDetails.length > 0) {
      const userToEdit = userDetails.find(
        (user) => user.username === username
      );

      if (userToEdit) {
        setInitialValues({
          name: userToEdit.name,
          mobileNo: userToEdit.mobileNo,
          emailId: userToEdit.emailId,
          role: userToEdit.role, // roleName expected
        });
      }
    }
  }, [username, userDetails]);

  // ✅ Validation
  const checkoutSchema = yup.object().shape({
    name: yup.string().required("required"),
    mobileNo: yup
      .string()
      .matches(/^\d{10}$/, "Mobile number must be exactly 10 digits")
      .required("required"),
    emailId: yup.string().email("Invalid email format").required("required"),
    role: yup.string().required("required"),
  });

  // ✅ Submit
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
          navigate("/team");
        })
        .catch(() => {
          dispatch(
            showNotification({
              message: "Error updating user.",
              type: "error",
            })
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
          actions.resetForm();
        })
        .catch(() => {
          dispatch(
            showNotification({
              message: "Error creating user.",
              type: "error",
            })
          );
        });
    }
  };

  // ✅ Role filtering based on logged-in role
  const filteredRoles = roles?.filter((r) => {
    if (roleId === 1 || role?.toLowerCase() === "superadmin") {
      // superadmin → admin + user
      return r.roleName === "admin" || r.roleName === "user";
    }

    if (roleId === 2 || role?.toLowerCase() === "admin") {
      // admin → only user
      return r.roleName === "user";
    }

    // user → no roles
    return false;
  });

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
        }) => {

          return (
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
                {/* Name */}
                <TextField
                  fullWidth
                  variant="filled"
                  label="Full Name"
                  name="name"
                  value={values.name}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                />

                {/* Mobile */}
                <TextField
                  fullWidth
                  variant="filled"
                  label="Mobile Number"
                  name="mobileNo"
                  value={values.mobileNo}
                  onBlur={handleBlur}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, "");
                    handleChange({
                      target: {
                        name: "mobileNo",
                        value: numericValue,
                      },
                    });
                  }}
                  error={touched.mobileNo && Boolean(errors.mobileNo)}
                  helperText={touched.mobileNo && errors.mobileNo}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">+91</InputAdornment>
                    ),
                  }}
                  inputProps={{
                    maxLength: 10,
                    pattern: "[0-9]*",
                  }}
                />

                {/* Email */}
                <TextField
                  fullWidth
                  variant="filled"
                  label="Email Address"
                  name="emailId"
                  value={values.emailId}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={touched.emailId && Boolean(errors.emailId)}
                  helperText={touched.emailId && errors.emailId}
                />

                {/* Role Select */}
                <FormControl fullWidth variant="filled">
                  <InputLabel>Role</InputLabel>

                  <Select
                    label="Role"
                    name="role"
                    value={values.role || ""}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={touched.role && Boolean(errors.role)}
                  >
                    {/* ✅ Always show current role first (for edit mode) */}
                    {values.role && (
                      <MenuItem value={values.role}>
                        {values.role.toUpperCase()}
                      </MenuItem>
                    )}

                    {/* ✅ Roles loading state */}
                    {rolesLoading && <MenuItem disabled>Loading...</MenuItem>}

                    {/* ✅ Allowed roles (avoid duplicate of current role) */}
                    {!rolesLoading &&
                      filteredRoles
                        ?.filter(
                          (r) =>
                            r.roleName?.toLowerCase() !==
                            values.role?.toLowerCase()
                        )
                        .map((role) => (
                          <MenuItem key={role.id} value={role.roleName}>
                            {role.displayName}
                          </MenuItem>
                        ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Submit */}
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
          );
        }}
      </Formik>

      <NotificationModal />
    </Box>
  );
};

export default UserForm;