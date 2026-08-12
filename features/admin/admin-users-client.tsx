"use client";

import { useEffect, useMemo, useState } from "react";
import type { Role } from "@/features/admin/users";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Chip,
  Paper,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserPlus,
  faPlus,
  faTimes,
  faShieldAlt,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { userActions, type UserRole } from "@/features/admin/users";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`users-tabpanel-${index}`}
      aria-labelledby={`users-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const AdminUsersClient = () => {
  const USERS_PAGE_SIZE = 10;
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info",
  );
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [tabValue, setTabValue] = useState(0);

  // User creation state
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);

  // Role creation state
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [creatingRole, setCreatingRole] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);

  // Role list state
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const {
    data: rows = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: userActions.list,
  });

  const loadRoles = async () => {
    setLoadingRoles(true);
    try {
      const roleList = await userActions.listRoles();
      setRoles(roleList);
    } catch {
      // Handle error silently
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const updateRole = async (id: string, role: UserRole, roleIds?: number[]) => {
    try {
      await userActions.updateRole(id, role, roleIds);
      setMessageType("success");
      setMessage("Role updated successfully");
      await refetch();
    } catch {
      setMessageType("error");
      setMessage("Failed to update role");
    }
  };

  const handleCreateUser = async () => {
    if (
      !newUserName.trim() ||
      !newUserEmail.trim() ||
      !newUserPassword.trim()
    ) {
      setMessageType("error");
      setMessage("Name, email, and password are required.");
      return;
    }

    try {
      setCreatingUser(true);
      await userActions.createUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword,
        role: newUserRole || undefined,
      });
      setMessageType("success");
      setMessage("User created successfully.");
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("");
      setOpenUserDialog(false);
      await refetch();
    } catch (error) {
      const err = error as Error;
      setMessageType("error");
      setMessage(err?.message || "Failed to create user.");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleCreateRole = async () => {
    if (!roleName.trim()) {
      setMessageType("error");
      setMessage("Role name is required.");
      return;
    }

    try {
      setCreatingRole(true);
      await userActions.createRole({
        name: roleName.trim(),
        description: roleDescription.trim() || undefined,
      });
      setMessageType("success");
      setMessage("Role created successfully.");
      setRoleName("");
      setRoleDescription("");
      setOpenRoleDialog(false);
      await loadRoles();
    } catch (error) {
      const err = error as Error;
      setMessageType("error");
      setMessage(err?.message || "Failed to create role.");
    } finally {
      setCreatingRole(false);
    }
  };

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const query = searchQuery.toLowerCase();
    return rows.filter((row) => row.full_name?.toLowerCase().includes(query));
  }, [rows, searchQuery]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredRows.length / USERS_PAGE_SIZE)),
    [filteredRows.length],
  );

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * USERS_PAGE_SIZE;
    return filteredRows.slice(start, start + USERS_PAGE_SIZE);
  }, [filteredRows, page]);

  const roleOptions = useMemo(() => {
    const unique = new Set<UserRole>();
    rows.forEach((row) => {
      unique.add(row.role);
    });
    paginatedRows.forEach((row) => {
      unique.add(row.role);
    });
    return Array.from(unique);
  }, [rows, paginatedRows]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const formatRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: "Super Admin",
      admin: "Administrator",
      staff: "Staff",
      sales_manager: "Sales Manager",
      operations_manager: "Operations Manager",
      accountant: "Accountant",
      store_person: "Store Person",
      customer_service: "Customer Service",
    };
    return (
      labels[role] ||
      role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  const getRoleColor = (role: string) => {
    const colors: Record<
      string,
      | "default"
      | "primary"
      | "info"
      | "secondary"
      | "success"
      | "warning"
      | "error"
    > = {
      super_admin: "error",
      admin: "primary",
      staff: "default",
      sales_manager: "success",
      operations_manager: "warning",
      accountant: "secondary",
      store_person: "info",
      customer_service: "default",
    };
    return colors[role] || "default";
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Stack spacing={3}>
      {message && (
        <Alert
          severity={messageType}
          onClose={() => setMessage("")}
          sx={{ borderRadius: 1.5 }}
        >
          {message}
        </Alert>
      )}

      {/* Tabs */}
      <Paper
        sx={{
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
          bgcolor: "background.paper",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: 2,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.875rem",
              py: 2,
            },
          }}
        >
          <Tab
            icon={<FontAwesomeIcon icon={faUsers} size="sm" />}
            iconPosition="start"
            label={"Users"}
          />
          <Tab
            icon={<FontAwesomeIcon icon={faShieldAlt} size="sm" />}
            iconPosition="start"
            label={"Roles"}
          />
        </Tabs>

        {/* Users Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 2, pb: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Typography variant="h6" fontWeight={600}>
                {/* Search */}
                <TextField
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  sx={{
                    mb: 3,
                    maxWidth: 400,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <FontAwesomeIcon
                        icon={faSearch}
                        style={{ marginRight: 12, color: "#999" }}
                      />
                    ),
                  }}
                />
              </Typography>
              <Button
                variant="contained"
                startIcon={<FontAwesomeIcon icon={faUserPlus} size="sm" />}
                onClick={() => setOpenUserDialog(true)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  bgcolor: "#171512",
                  "&:hover": { bgcolor: "#2d2a26" },
                }}
              >
                Add User
              </Button>
            </Stack>

            {isLoading ? (
              <Box sx={{ py: 8, textAlign: "center" }}>
                <CircularProgress size={32} sx={{ color: "#171512" }} />
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  Loading users...
                </Typography>
              </Box>
            ) : isError ? (
              <Typography
                color="error.main"
                sx={{ py: 4, textAlign: "center" }}
              >
                Failed to load users.
              </Typography>
            ) : filteredRows.length === 0 ? (
              <Box sx={{ py: 8, textAlign: "center" }}>
                <Typography color="text.secondary" variant="body1">
                  {searchQuery
                    ? "No users match your search."
                    : "No users found."}
                </Typography>
              </Box>
            ) : (
              <>
                {/* User Cards Grid - Matches Screenshot */}
                <Grid container spacing={2}>
                  {paginatedRows.map((row) => (
                    <Grid size={{ xs: 12, md: 6, lg: 4 }} key={row.id}>
                      <Card
                        sx={{
                          border: "1px solid #e9e2d8",
                          boxShadow: "none",
                          borderRadius: 2,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: "#171512",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                          >
                            <Box>
                              <Typography
                                fontWeight={600}
                                sx={{ color: "#171512", fontSize: "0.95rem" }}
                              >
                                {row.full_name}
                              </Typography>
                            </Box>
                            <Chip
                              label={formatRoleLabel(row.role)}
                              color={getRoleColor(row.role)}
                              size="small"
                              sx={{
                                fontSize: "0.6rem",
                                fontWeight: 500,
                                mt: 0.5,
                              }}
                            />
                          </Stack>

                          <Divider sx={{ my: 1.5 }} />

                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.65rem" }}
                            ></Typography>
                            <TextField
                              size="small"
                              select
                              value={row.role}
                              onChange={(event) =>
                                updateRole(
                                  row.id,
                                  event.target.value as UserRole,
                                  row.roleIds,
                                )
                              }
                              sx={{
                                minWidth: 150,
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 1.5,
                                  fontSize: "0.75rem",
                                },
                              }}
                            >
                              {roleOptions.map((role) => (
                                <MenuItem key={role} value={role}>
                                  {formatRoleLabel(role)}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {filteredRows.length > USERS_PAGE_SIZE && (
                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    sx={{ mt: 3 }}
                  >
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_, value) => setPage(value)}
                      color="primary"
                    />
                  </Stack>
                )}
              </>
            )}
          </Box>
        </TabPanel>

        {/* Roles Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 2, pb: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Typography variant="h6" fontWeight={600}></Typography>
              <Button
                variant="contained"
                startIcon={<FontAwesomeIcon icon={faPlus} size="sm" />}
                onClick={() => setOpenRoleDialog(true)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  bgcolor: "#171512",
                  "&:hover": { bgcolor: "#2d2a26" },
                }}
              >
                Add Role
              </Button>
            </Stack>

            {loadingRoles ? (
              <Box sx={{ py: 8, textAlign: "center" }}>
                <CircularProgress size={32} sx={{ color: "#171512" }} />
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  Loading roles...
                </Typography>
              </Box>
            ) : roles.length === 0 ? (
              <Box sx={{ py: 8, textAlign: "center" }}>
                <Typography color="text.secondary" variant="body1">
                  No roles found.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {roles.map((role) => (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={role.id}>
                    <Card
                      sx={{
                        border: "1px solid #e9e2d8",
                        boxShadow: "none",
                        borderRadius: 2,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "#171512",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <Box>
                            <Typography
                              fontWeight={600}
                              sx={{ color: "#171512", fontSize: "0.95rem" }}
                            >
                              {formatRoleLabel(role.name)}
                            </Typography>
                            {role.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: "0.8rem", mt: 0.3 }}
                              >
                                {role.description}
                              </Typography>
                            )}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontSize: "0.65rem",
                                mt: 1,
                                display: "block",
                              }}
                            >
                              {role.permissions?.length || 0} permissions
                            </Typography>
                          </Box>
                          <Chip
                            label={role.users_count || 0}
                            size="small"
                            sx={{ fontSize: "0.6rem", fontWeight: 500 }}
                          />
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* Add User Dialog */}
      <Dialog
        open={openUserDialog}
        onClose={() => setOpenUserDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={600}>
              Add New User
            </Typography>
            <IconButton size="small" onClick={() => setOpenUserDialog(false)}>
              <FontAwesomeIcon icon={faTimes} size="sm" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Full Name *"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Email *"
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Password *"
              type="password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              fullWidth
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Role (optional)</InputLabel>
              <Select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                label="Role (optional)"
              >
                <MenuItem value="">No role</MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.name}>
                    {formatRoleLabel(role.name)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenUserDialog(false)}
            sx={{ textTransform: "none", color: "#666" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateUser}
            disabled={creatingUser}
            sx={{
              textTransform: "none",
              bgcolor: "#171512",
              "&:hover": { bgcolor: "#2d2a26" },
            }}
          >
            {creatingUser ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "Create User"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Role Dialog */}
      <Dialog
        open={openRoleDialog}
        onClose={() => setOpenRoleDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={600}>
              Add New Role
            </Typography>
            <IconButton size="small" onClick={() => setOpenRoleDialog(false)}>
              <FontAwesomeIcon icon={faTimes} size="sm" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Role Name *"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g., Sales Manager"
            />
            <TextField
              label="Description (optional)"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              fullWidth
              size="small"
              multiline
              minRows={2}
              placeholder="Describe the role's responsibilities..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenRoleDialog(false)}
            sx={{ textTransform: "none", color: "#666" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateRole}
            disabled={creatingRole}
            sx={{
              textTransform: "none",
              bgcolor: "#171512",
              "&:hover": { bgcolor: "#2d2a26" },
            }}
          >
            {creatingRole ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "Create Role"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
