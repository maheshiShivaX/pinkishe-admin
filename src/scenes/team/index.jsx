import {
  Box,
  Typography,
  useTheme,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { Header } from "../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useNavigate } from "react-router-dom";
import {
  AdminPanelSettingsOutlined,
  LockOpenOutlined,
  EditOutlined,
  DeleteOutlined,
  WarningAmber,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchUserDetails, deleteUser } from "../../store/userSlice"; // Added deleteUser action
import { showNotification } from "../../store/notificationSlice"; // Assuming notification actions are used
import NotificationModal from "../notificationModal";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userDetails, loading, error } = useSelector((state) => state.user);
  const token = localStorage.getItem("authToken");
  const loggedInUsername = localStorage.getItem("username"); // Retrieve logged-in username
  const roleId = Number(localStorage.getItem("roleId"));
  const role = localStorage.getItem("userRole"); // ✅ string

  useEffect(() => {
    if (token) {
      dispatch(fetchUserDetails(token));
    }
  }, [dispatch, token]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // State to store the selected user for deletion

  const confirmDelete = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  // Inside the confirmDelete function in Team.jsx:
  const handleDeleteConfirmed = () => {
    if (selectedUser?.username) {
      dispatch(deleteUser(selectedUser.username))
        .unwrap()
        .then(() => {
          dispatch(
            showNotification({
              message: "User deleted successfully!",
              type: "success",
            })
          );
          dispatch(fetchUserDetails(token)); // Refresh the user list after deletion
        })
        .catch(() => {
          dispatch(
            showNotification({
              message: "Failed to delete user.",
              type: "error",
            })
          );
        })
        .finally(() => {
          setOpenDialog(false);
          setSelectedUser(null);
        });
    }
  };

  const columns = [
    { field: "username", headerName: "Username" },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "mobileNo", headerName: "Mobile Number", flex: 1 },
    { field: "emailId", headerName: "Email", flex: 1 },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      renderCell: ({ row: { username, role } }) => {
        const assignedRole = role;
        if (assignedRole) {
          return (
            <Box
              width="120px"
              p={1}
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={1}
              bgcolor={
                assignedRole === "admin"
                  ? colors.greenAccent[600]
                  : colors.greenAccent[800]
              }
              borderRadius={1}
            >
              {assignedRole === "admin" && <AdminPanelSettingsOutlined />}
              {assignedRole === "superadmin" && <AdminPanelSettingsOutlined />}
              {assignedRole === "user" && <LockOpenOutlined />}
              <Typography textTransform="capitalize">{assignedRole}</Typography>
            </Box>
          );
        }
      },
    },
    {
      field: "edit",
      headerName: "",
      renderCell: (params) => (
        <IconButton onClick={() => navigate(`/users/edit/${params.id}`)}>
          <EditOutlined />
        </IconButton>
      ),
    },
    {
      field: "delete",
      headerName: "",
      renderCell: (params) => {
        const isCurrentUser = params.row.username === loggedInUsername;
        return (
          <IconButton
            onClick={() => confirmDelete(params.row)}
            disabled={isCurrentUser} // Disable if it is the logged-in user
          >
            <DeleteOutlined />
          </IconButton>
        );
      },
    },
  ];

  const filteredUsers = userDetails.filter((user) => {
    if (roleId === 1 || role?.toLowerCase() === "superadmin") {
      // superadmin → admin + user
      return user.role === "admin" || user.role === "user";
    }

    if (roleId === 2) {
      // admin → only user
      return user.role === "user";
    }

    // user → only self (optional) OR no users
    if (roleId === 3 || role?.toLowerCase() === "user") {
      return user.username === loggedInUsername; // ya return false;
    }

    return false;
  });

  const rows = filteredUsers.map((item) => ({
    ...item,
    id: item.username,
  }));

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box m="20px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="20px"
        flexWrap="wrap"
      >
        <Header title="USERS" subtitle="Assign Roles to Unassigned Users here" />
        <Button
          color="secondary"
          variant="contained"
          onClick={() => navigate(`/userForm`)}
        >
          Add User
        </Button>
      </Box>

      <NotificationModal />
      <Box
        mt="40px"
        height="75vh"
        maxWidth="100%"
        sx={{
          width: `${columns.length * 200}px`,
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            border: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.greenAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.greenAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-iconSeparator": {
            color: colors.primary[100],
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle>
          <Typography variant="h6" color="warning.main" align="center">
            Confirm Deletion
          </Typography>
        </DialogTitle>

        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <WarningAmber
            color="warning"
            sx={{ fontSize: 50, marginBottom: theme.spacing(2) }}
          />
          <DialogContentText align="center">
            Are you sure you want to delete user:{" "}
            <strong>{selectedUser?.username}</strong>? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            color="primary"
            variant="contained"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirmed}
            color="secondary"
            variant="contained"
            autoFocus
          >
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Team;
