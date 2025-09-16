import React from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, useTheme } from "@mui/material";
import { CheckCircle, Error } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { closeNotification ,clearNotification} from "../../store/notificationSlice"; // Assuming you have a slice to handle modal state

const NotificationModal = () => {
  const theme = useTheme(); // Access the theme
  const dispatch = useDispatch();
  const { open, message, type } = useSelector((state) => state.notification);

  const handleClose = () => {
    dispatch(closeNotification()); // Close the modal
  };

  const handleExited = () => {
    dispatch(clearNotification());
  };

  return (
    <Dialog open={open} onClose={handleClose} onExited={handleExited} fullWidth>
      <DialogTitle>
        <Typography variant="h6" color={type === "success" ? "success.main" : "error.main"} align="center">
          {type === "success" ? "Success!" : "Error!"}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {type === "success" ? (
          <CheckCircle color="success" sx={{ fontSize: 50, marginBottom: theme.spacing(2) }} />
        ) : (
          <Error color="error" sx={{ fontSize: 50, marginBottom: theme.spacing(2) }} />
        )}
        <Typography variant="body1" color="textSecondary" align="center">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationModal;
