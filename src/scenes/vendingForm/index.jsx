import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Header } from "../../components";
import { Formik } from "formik";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { addVendingMaster, updateVendingMaster } from "../../store/vendingMasterSlice"; // Import the async thunk
import { showNotification } from "../../store/notificationSlice"; // Import the notification action
import NotificationModal from "../notificationModal";

const VendingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { vendingMachines } = useSelector((state) => state.getVendingMachine);

  const [initialValues, setInitialValues] = useState({
    machineId: "",
    gsmModuleImei: "",
    vendorName: "",
    simCardNumber: "",
    padCapacity: "",
    status: "",
  });

  useEffect(() => {
    if (id && vendingMachines.length > 0) {
      const machineToEdit = vendingMachines.find((machine) => machine.machineId === id);
      if (machineToEdit) {
        setInitialValues({
          machineId: machineToEdit.machineId,
          gsmModuleImei: machineToEdit.gsmModuleImei,
          vendorName: machineToEdit.vendorName,
          simCardNumber: machineToEdit.simCardNumber,
          padCapacity: machineToEdit.padCapacity,
          status: machineToEdit.status,
        });
      }
    }
  }, [id, vendingMachines]);

  const checkoutSchema = yup.object().shape({
    machineId: yup.string().required("required"),
    gsmModuleImei: yup.string().required("required"),
    vendorName: yup.string().required("required"),
    simCardNumber: yup.string().required("required"),
    padCapacity: yup.string().required("required"),
    status: yup.string().required("required"),
  });

  const handleFormSubmit = (values, actions) => {
    if (id) {
      dispatch(updateVendingMaster({ id, vendingMasterData: values }))
        .unwrap()
        .then(() => {
          dispatch(showNotification({ message: "Vending Machine updated successfully!", type: "success" }));
          actions.resetForm({ values: initialValues });
          navigate("/machineStatus");
        })
        .catch((error) => {
          dispatch(showNotification({ message: "Error updating Vending Machine.", type: "error" }));
        });
    } else {
      dispatch(addVendingMaster(values))
        .unwrap()
        .then(() => {
          dispatch(showNotification({ message: "Vending Machine created successfully!", type: "success" }));
          actions.resetForm({ values: initialValues });
        })
        .catch((error) => {
          dispatch(showNotification({ message: "Error creating Vending Machine.", type: "error" }));
        });
    }
  };

  return (
    <Box m="20px">
      <Header title="VENDING MACHINE MASTER" subtitle={id ? `Edit Vending Machine: ${id}` : "Create a New Vending Machine Master"} />

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
                label="Machine Id"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.machineId}
                name="machineId"
                error={touched.machineId && errors.machineId}
                helperText={touched.machineId && errors.machineId}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="GSM Module IMEI Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.gsmModuleImei}
                name="gsmModuleImei"
                error={touched.gsmModuleImei && errors.gsmModuleImei}
                helperText={touched.gsmModuleImei && errors.gsmModuleImei}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Vendor Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.vendorName}
                name="vendorName"
                error={touched.vendorName && errors.vendorName}
                helperText={touched.vendorName && errors.vendorName}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Sim Card Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.simCardNumber}
                name="simCardNumber"
                error={touched.simCardNumber && errors.simCardNumber}
                helperText={touched.simCardNumber && errors.simCardNumber}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Pad Capacity"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.padCapacity}
                name="padCapacity"
                error={touched.padCapacity && errors.padCapacity}
                helperText={touched.padCapacity && errors.padCapacity}
              />
              <FormControl fullWidth variant="filled">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={values.status}
                  name="status"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={touched.status && errors.status}
                >
                  <MenuItem value="inStore">In Store</MenuItem>
                  <MenuItem value="demo">Demo</MenuItem>
                  <MenuItem value="decommissioned">Decommissioned</MenuItem>
                  <MenuItem value="scrapped">Scrapped</MenuItem>

                  <MenuItem value="active">Active</MenuItem>
                  
                  <MenuItem value="defective">Defective</MenuItem>
                  <MenuItem value="underRepair">Under Repair</MenuItem>
                  <MenuItem value="inactiveReasons">Inactive For Other Reasons</MenuItem> 
                  
                </Select>
              </FormControl>
            </Box>

            <Box display="flex" alignItems="center" justifyContent="end" mt="20px">
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

export default VendingForm;
