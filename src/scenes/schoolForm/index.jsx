import React from "react";
import {
  Box,
  Button,
  TextField,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Header } from "../../components";
import { Formik } from "formik";
import * as yup from "yup";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { addSchoolData, updateSchoolData } from "../../store/schoolSlice";
import { getGeoLocation } from "../../store/geolocationSlice";
import { showNotification } from "../../store/notificationSlice";
import NotificationModal from "../notificationModal";
import { fetchNgoSpoc } from "../../store/ngoSpocSlice";

const SchoolForm = () => {
  const { id } = useParams();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const dispatch = useDispatch();
  const location = useLocation();
  const { schoolData } = location.state || {};

  const navigate = useNavigate();

  const {
    ngoSpocNames = [],
    loadingNgoSpocNames,
    errorNgoSpocNames,
  } = useSelector((state) => state.ngoSpoc || {});
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (token) {
      dispatch(fetchNgoSpoc(token)); // Fetch NGO Spoc Names
    }
  }, [dispatch, token]);

  const ngoSpocs = ngoSpocNames.filter((spoc) => spoc.spocType === "ngoSpoc");
  const schoolSpocs = ngoSpocNames.filter(
    (spoc) => spoc.spocType === "schoolSpoc"
  );
  const ngoCoordinators = ngoSpocNames.filter(
    (spoc) => spoc.spocType === "ngoCoordinator"
  );

  const [initialValues, setInitialValues] = useState({
    schoolName: "",
    schoolAddress: "",
    schoolBlock: "",
    schoolDistrict: "",
    state: "",
    pinCode: "",
    geoLocation: "",
    numberOfGirls: "",
    schoolSpocName: "",
    schoolSpocMobileNo:"",
    ngoSpocName: "",
    ngoSpocName2: "",
    ngoCoordinatorName: "",
    ngoSpocMobileNo: "",
    ngoSpocMobileNo2: "",
    ngoCoordinatorMobileNo: "",
  });

  useEffect(() => {
    if (schoolData) {
      setInitialValues({
        schoolName: schoolData.schoolName,
        schoolAddress: schoolData.schoolAddress,
        schoolBlock: schoolData.schoolBlock,
        schoolDistrict: schoolData.schoolDistrict,
        state: schoolData.state,
        pinCode: schoolData.pinCode,
        geoLocation: schoolData.geoLocation,
        numberOfGirls: schoolData.numberOfGirls,
        schoolSpocName: schoolData.schoolSpocName,
        ngoSpocName: schoolData.ngoSpocName,
        ngoSpocName2: schoolData.ngoSpocName2 || "",
        ngoCoordinatorName: schoolData.ngoCoordinatorName || "",
        ngoSpocMobileNo: schoolData.ngoSpocMobileNo || "",
        ngoSpocMobileNo2: schoolData.ngoSpocMobileNo2 || "",
        ngoCoordinatorMobileNo: schoolData.ngoCoordinatorMobileNo || "",
        schoolSpocMobileNo: schoolData.schoolSpocMobileNo || "",
      });
    }
  }, [schoolData]);

  const checkoutSchema = yup.object().shape({
    schoolName: yup.string().required("School Name is required"),
    schoolAddress: yup.string().required("School Address is required"),
    schoolBlock: yup.string().required("School Block is required"),
    schoolDistrict: yup.string().required("School District is required"),
    state: yup.string().required("State is required"),
    pinCode: yup
      .number()
      .required("Pin Code is required")
      .positive("Must be a positive number")
      .integer("Must be an integer")
      .max(999999, "Pin Code must not exceed 6 digits"),

    geoLocation: yup.string().required("Geo Location is required"),
    numberOfGirls: yup
      .number()
      .required("Number of girls is required")
      .positive("Must be a positive number")
      .integer("Must be an integer"),
    schoolSpocName: yup.string().required("School SPOC Name is required"),
    ngoSpocName: yup.string().required("NGO SPOC Name is required"),
    ngoSpocName2: yup.string().required("NGO SPOC Name is required"),
    ngoCoordinatorName: yup
      .string()
      .required("NGO Coordinator Name is required"),
  });

  const { loading, error, successMessage } = useSelector(
    (state) => state.school
  );

  const {
    data: geoLocationData,
    loading: geoLocationloading,
    error: geoLocationError,
  } = useSelector((state) => state.geolocation);

  useEffect(() => {
    dispatch(getGeoLocation());
  }, [dispatch]);

  const [districtOptions, setDistrictOptions] = useState([]);
  const [blockOptions, setBlockOptions] = useState([]);

  const handleStateChange = (stateValue) => {
    const filteredDistricts = geoLocationData.filter(
      (item) => item.state === stateValue
    );

    setDistrictOptions([
      ...new Set(filteredDistricts.map((item) => item.district)),
    ]);
    setBlockOptions([]);
  };

  const handleDistrictChange = (districtValue, state) => {
    const filteredBlocks = geoLocationData.filter(
      (item) => item.state === state && item.district === districtValue
    );

    setBlockOptions([...new Set(filteredBlocks.map((item) => item.block))]);
  };

  const handleFormSubmit = (values, actions) => {
    if (id) {
      dispatch(updateSchoolData({ id, schoolData: values }))
        .unwrap()
        .then(() => {
          dispatch(
            showNotification({
              message: "School updated successfully!",
              type: "success",
            })
          );
          actions.resetForm({ values: initialValues });
          navigate("/schools");
        })
        .catch((error) => {
          dispatch(
            showNotification({
              message: "Error updating schools.",
              type: "error",
            })
          );
        });
    } else {
      dispatch(addSchoolData(values))
        .unwrap()
        .then(() => {
          dispatch(
            showNotification({
              message: "School added successfully!",
              type: "success",
            })
          );
          actions.resetForm({ values: initialValues });
        })
        .catch((error) => {
          dispatch(
            showNotification({
              message: "Error while adding School.",
              type: "error",
            })
          );
        });
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE SCHOOL" subtitle="Create a New School Profile" />

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
          setFieldValue,
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
                label="School Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.schoolName}
                name="schoolName"
                error={touched.schoolName && errors.schoolName}
                helperText={touched.schoolName && errors.schoolName}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="School Address"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.schoolAddress}
                name="schoolAddress"
                error={touched.schoolAddress && errors.schoolAddress}
                helperText={touched.schoolAddress && errors.schoolAddress}
                sx={{ gridColumn: "span 4" }}
              />

              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 4" }}
              >
                <InputLabel>State</InputLabel>
                <Select
                  label="State"
                  value={values.state}
                  onBlur={handleBlur}
                  onChange={(e) => {
                    handleChange(e);
                    handleStateChange(e.target.value); // Filter district based on state
                  }}
                  name="state"
                  error={touched.state && errors.state}
                >
                  {geoLocationData &&
                    [...new Set(geoLocationData.map((item) => item.state))].map(
                      (state, index) => (
                        <MenuItem key={index} value={state}>
                          {state}
                        </MenuItem>
                      )
                    )}
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 4" }}
              >
                <InputLabel>District</InputLabel>
                <Select
                  label="District"
                  value={values.schoolDistrict}
                  onBlur={handleBlur}
                  onChange={(e) => {
                    handleChange(e);
                    handleDistrictChange(e.target.value, values.state); // Filter block based on district
                  }}
                  name="schoolDistrict"
                  disabled={!values.state} // Disable if state is not selected
                  error={touched.schoolDistrict && errors.schoolDistrict}
                >
                  {districtOptions &&
                    districtOptions.map((district, index) => (
                      <MenuItem key={index} value={district}>
                        {district}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 4" }}
              >
                <InputLabel>Block</InputLabel>
                <Select
                  label="Block"
                  value={values.schoolBlock}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  name="schoolBlock"
                  disabled={!values.state || !values.schoolDistrict} // Disable if state or district is not selected
                  error={touched.schoolBlock && errors.schoolBlock}
                >
                  {blockOptions &&
                    blockOptions.map((block, index) => (
                      <MenuItem key={index} value={block}>
                        {block}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Pin Code"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.pinCode}
                name="pinCode"
                error={touched.pinCode && errors.pinCode}
                helperText={touched.pinCode && errors.pinCode}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Geo Location"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.geoLocation}
                name="geoLocation"
                error={touched.geoLocation && errors.geoLocation}
                helperText={touched.geoLocation && errors.geoLocation}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Number of Girls (in Menstruating Age)"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.numberOfGirls}
                name="numberOfGirls"
                error={touched.numberOfGirls && errors.numberOfGirls}
                helperText={touched.numberOfGirls && errors.numberOfGirls}
                sx={{ gridColumn: "span 4" }}
              />
              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 4" }}
              >
                <InputLabel>School SPOC</InputLabel>
                <Select
                  label="School SPOC"
                  value={values.schoolSpocName}
                  onBlur={handleBlur}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    handleChange(e);
                    const selectedSpoc = schoolSpocs.find(
                      (spoc) => spoc.spocName === selectedName
                    );
                    setFieldValue(
                      "schoolSpocMobileNo",
                      selectedSpoc?.spocMobileNo || ""
                    );
                  }}
                  name="schoolSpocName"
                  error={
                    touched.schoolSpocName && Boolean(errors.schoolSpocName)
                  }
                >
                  {schoolSpocs.map((spoc) => (
                    <MenuItem key={spoc.id} value={spoc.spocName}>
                      {spoc.spocName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>



              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 4" }}
              >
                <InputLabel>NGO SPOC 1</InputLabel>
                <Select
                  label="NGO SPOC 1"
                  value={values.ngoSpocName}
                  onBlur={handleBlur}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    handleChange(e);
                    const selectedSpoc = ngoSpocs.find(
                      (spoc) => spoc.spocName === selectedName
                    );
                    setFieldValue(
                      "ngoSpocMobileNo",
                      selectedSpoc?.spocMobileNo || ""
                    );
                  }}
                  name="ngoSpocName"
                  error={touched.ngoSpocName && Boolean(errors.ngoSpocName)}
                >
                  {ngoSpocs.map((spoc) => (
                    <MenuItem key={spoc.id} value={spoc.spocName}>
                      {spoc.spocName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 4" }}
              >
                <InputLabel>NGO SPOC 2</InputLabel>
                <Select
                  label="NGO SPOC 2"
                  value={values.ngoSpocName2}
                  onBlur={handleBlur}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    handleChange(e);
                    const selectedSpoc = ngoSpocs.find(
                      (spoc) => spoc.spocName === selectedName
                    );
                    setFieldValue(
                      "ngoSpocMobileNo2",
                      selectedSpoc?.spocMobileNo || ""
                    );
                  }}
                  name="ngoSpocName2"
                  error={touched.ngoSpocName2 && Boolean(errors.ngoSpocName2)}
                >
                  {ngoSpocs.map((spoc) => (
                    <MenuItem key={spoc.id} value={spoc.spocName}>
                      {spoc.spocName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 4" }}
              >
                <InputLabel>NGO Coordinator</InputLabel>
                <Select
                  label="NGO Coordinator"
                  value={values.ngoCoordinatorName}
                  onBlur={handleBlur}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    handleChange(e);
                    const selectedSpoc = ngoCoordinators.find(
                      (spoc) => spoc.spocName === selectedName
                    );
                    setFieldValue(
                      "ngoCoordinatorMobileNo",
                      selectedSpoc?.spocMobileNo || ""
                    );
                  }}
                  name="ngoCoordinatorName"
                  error={
                    touched.ngoCoordinatorName &&
                    Boolean(errors.ngoCoordinatorName)
                  }
                >
                  {ngoCoordinators.map((spoc) => (
                    <MenuItem key={spoc.id} value={spoc.spocName}>
                      {spoc.spocName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                {loading ? "Creating..." : "Save"}
              </Button>
            </Box>
          </form>
        )}
      </Formik>

      <NotificationModal />
    </Box>
  );
};

export default SchoolForm;
