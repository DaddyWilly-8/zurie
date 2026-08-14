"use client";

import { useEffect, useMemo, useState } from "react";
import type { Role, Permission, AdminUserRow } from "@/features/admin/users";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
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
  List,
  ListItem,
  ListItemText,
  Checkbox,
  ListItemIcon,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserPlus,
  faPlus,
  faTimes,
  faShieldAlt,
  faSearch,
  faEdit,
  faCheckDouble,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { userActions } from "@/features/admin/users";

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
  const [newUserRoleIds, setNewUserRoleIds] = useState<number[]>([]);
  const [creatingUser, setCreatingUser] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);

  // Role creation state
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [creatingRole, setCreatingRole] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);

  // Role edit state
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingRolePermissions, setEditingRolePermissions] = useState<
    string[]
  >([]);
  const [openRoleEditDialog, setOpenRoleEditDialog] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);

  // User edit state
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [editingUserRoleIds, setEditingUserRoleIds] = useState<number[]>([]);
  const [openUserEditDialog, setOpenUserEditDialog] = useState(false);
  const [savingUserRoles, setSavingUserRoles] = useState(false);

  // Role list state
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
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
      return roleList;
    } catch (error) {
      const err = error as Error;
      console.error("Failed to load roles:", err);
      setMessage("Failed to load roles");
      setMessageType("error");
      return [];
    } finally {
      setLoadingRoles(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const permissionList = await userActions.listPermissions();
      setPermissions(permissionList);
      return permissionList;
    } catch (error) {
      const err = error as Error;
      console.error("Failed to load permissions:", err);
      setMessage("Failed to load permissions");
      setMessageType("error");
      return [];
    }
  };

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const updateUserRoles = async (id: string, roleIds: number[]) => {
    setSavingUserRoles(true);
    try {
      await userActions.updateUserRoles(id, roleIds);
      setMessage("User roles updated successfully");
      setMessageType("success");
      await refetch();
      return true;
    } catch (error) {
      const err = error as Error;
      setMessage(err?.message || "Failed to update user roles");
      setMessageType("error");
      return false;
    } finally {
      setSavingUserRoles(false);
    }
  };

  const updateRolePermissions = async (
    roleId: number,
    permissionKeys: string[],
  ) => {
    setSavingPermissions(true);
    try {
      // Find permission IDs for the selected keys
      const permissionIds = permissions
        .filter((p) => permissionKeys.includes(p.key))
        .map((p) => p.id);

      if (permissionIds.length === 0) {
        setMessage("No permissions selected. Clearing all permissions.");
        setMessageType("info");
      }

      await userActions.updateRolePermissions(roleId, permissionIds);
      setMessage("Role permissions updated successfully");
      setMessageType("success");
      await loadRoles();
      return true;
    } catch (error) {
      const err = error as Error;
      setMessage(err?.message || "Failed to update role permissions");
      setMessageType("error");
      return false;
    } finally {
      setSavingPermissions(false);
    }
  };

  const handleCreateUser = async () => {
    if (
      !newUserName.trim() ||
      !newUserEmail.trim() ||
      !newUserPassword.trim()
    ) {
      setMessage("Name, email, and password are required.");
      setMessageType("error");
      return;
    }

    setCreatingUser(true);
    try {
      const response = await userActions.createUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword,
      });

      if (newUserRoleIds.length > 0 && response?.data?.id) {
        const userId = String(response.data.id);
        await userActions.updateUserRoles(userId, newUserRoleIds);
      }

      setMessage("User created successfully.");
      setMessageType("success");
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRoleIds([]);
      setOpenUserDialog(false);
      await refetch();
    } catch (error) {
      const err = error as Error;
      setMessage(err?.message || "Failed to create user.");
      setMessageType("error");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleCreateRole = async () => {
    if (!roleName.trim()) {
      setMessage("Role name is required.");
      setMessageType("error");
      return;
    }

    setCreatingRole(true);
    try {
      await userActions.createRole({
        name: roleName.trim(),
        description: roleDescription.trim() || undefined,
      });
      setMessage("Role created successfully.");
      setMessageType("success");
      setRoleName("");
      setRoleDescription("");
      setOpenRoleDialog(false);
      await loadRoles();
    } catch (error) {
      const err = error as Error;
      setMessage(err?.message || "Failed to create role.");
      setMessageType("error");
    } finally {
      setCreatingRole(false);
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setEditingRolePermissions(role.permissions || []);
    setOpenRoleEditDialog(true);
  };

  const handleSaveRolePermissions = async () => {
    if (!editingRole) return;
    const success = await updateRolePermissions(
      editingRole.id,
      editingRolePermissions,
    );
    if (success) {
      setOpenRoleEditDialog(false);
      setEditingRole(null);
    }
  };

  const handleEditUser = (user: AdminUserRow) => {
    setEditingUser(user);
    setEditingUserRoleIds(user.roleIds || []);
    setOpenUserEditDialog(true);
  };

  const handleSaveUserRoles = async () => {
    if (!editingUser) return;
    const success = await updateUserRoles(editingUser.id, editingUserRoleIds);
    if (success) {
      setOpenUserEditDialog(false);
      setEditingUser(null);
    }
  };

  // Select/Deselect all permissions
  const handleSelectAllPermissions = () => {
    const allPermissionKeys = permissions.map((p) => p.key);
    setEditingRolePermissions(allPermissionKeys);
  };

  const handleDeselectAllPermissions = () => {
    setEditingRolePermissions([]);
  };

  // Toggle a single permission
  const togglePermission = (permissionKey: string) => {
    setEditingRolePermissions((prev) =>
      prev.includes(permissionKey)
        ? prev.filter((p) => p !== permissionKey)
        : [...prev, permissionKey],
    );
  };

  // Check if all permissions are selected
  const areAllPermissionsSelected = () => {
    return (
      permissions.length > 0 &&
      permissions.every((p) => editingRolePermissions.includes(p.key))
    );
  };

  // Check if any permissions are selected
  const areAnyPermissionsSelected = () => {
    return editingRolePermissions.length > 0;
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
            label={"Roles & Permissions"}
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
              <TextField
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                sx={{
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
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: "0.7rem", display: "block" }}
                              >
                                {row.email}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleEditUser(row)}
                              sx={{
                                color: "text.secondary",
                                "&:hover": { color: "primary.main" },
                              }}
                            >
                              <FontAwesomeIcon icon={faEdit} size="sm" />
                            </IconButton>
                          </Stack>

                          <Divider sx={{ my: 1.5 }} />

                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Stack
                              direction="row"
                              spacing={0.5}
                              flexWrap="wrap"
                            >
                              {row.roleIds && row.roleIds.length > 0 ? (
                                row.roleIds.map((roleId) => {
                                  const role = roles.find(
                                    (r) => r.id === roleId,
                                  );
                                  return role ? (
                                    <Chip
                                      key={roleId}
                                      label={formatRoleLabel(role.name)}
                                      color={getRoleColor(role.name)}
                                      size="small"
                                      sx={{
                                        fontSize: "0.55rem",
                                        fontWeight: 500,
                                      }}
                                    />
                                  ) : null;
                                })
                              ) : (
                                <Chip
                                  label="No roles"
                                  size="small"
                                  sx={{
                                    fontSize: "0.55rem",
                                    fontWeight: 500,
                                    color: "text.secondary",
                                  }}
                                />
                              )}
                            </Stack>
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
              <Typography variant="h6" fontWeight={600}>
                Roles & Permissions
              </Typography>
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
                          <Box sx={{ flex: 1 }}>
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
                          <Stack direction="row" spacing={0.5}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditRole(role)}
                              sx={{
                                color: "text.secondary",
                                "&:hover": { color: "primary.main" },
                              }}
                            >
                              <FontAwesomeIcon icon={faEdit} size="sm" />
                            </IconButton>
                          </Stack>
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
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={newUserRoleIds}
                onChange={(e) => setNewUserRoleIds(e.target.value as number[])}
                label="Roles"
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((roleId) => {
                      const role = roles.find((r) => r.id === roleId);
                      return role ? (
                        <Chip
                          key={roleId}
                          label={formatRoleLabel(role.name)}
                          size="small"
                        />
                      ) : null;
                    })}
                  </Box>
                )}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    <Checkbox checked={newUserRoleIds.indexOf(role.id) > -1} />
                    <ListItemText primary={formatRoleLabel(role.name)} />
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

      {/* Edit Role Permissions Dialog */}
      <Dialog
        open={openRoleEditDialog}
        onClose={() => setOpenRoleEditDialog(false)}
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
              Edit Role Permissions
            </Typography>
            <IconButton
              size="small"
              onClick={() => setOpenRoleEditDialog(false)}
            >
              <FontAwesomeIcon icon={faTimes} size="sm" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {editingRole && (
              <Typography variant="subtitle1" fontWeight={600}>
                {formatRoleLabel(editingRole.name)}
              </Typography>
            )}

            {/* Select All / Deselect All Controls */}
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{
                p: 1.5,
                bgcolor: "action.hover",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                Permissions:
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<FontAwesomeIcon icon={faCheckDouble} size="sm" />}
                onClick={handleSelectAllPermissions}
                disabled={areAllPermissionsSelected()}
                sx={{
                  textTransform: "none",
                  borderRadius: 1,
                  fontSize: "0.7rem",
                }}
              >
                Select All
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<FontAwesomeIcon icon={faTimesCircle} size="sm" />}
                onClick={handleDeselectAllPermissions}
                disabled={!areAnyPermissionsSelected()}
                sx={{
                  textTransform: "none",
                  borderRadius: 1,
                  fontSize: "0.7rem",
                  color: "error.main",
                  borderColor: "error.main",
                  "&:hover": {
                    borderColor: "error.dark",
                    bgcolor: "error.light",
                  },
                }}
              >
                Deselect All
              </Button>
              <Chip
                label={`${editingRolePermissions.length} selected`}
                size="small"
                color={
                  editingRolePermissions.length > 0 ? "primary" : "default"
                }
                sx={{ fontSize: "0.6rem", ml: "auto" }}
              />
            </Stack>

            <Typography variant="caption" color="text.secondary">
              Select permissions for this role:
            </Typography>

            <List dense sx={{ maxHeight: 400, overflow: "auto" }}>
              {permissions.map((permission) => (
                <ListItem
                  key={permission.id}
                  dense
                  onClick={() => togglePermission(permission.key)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={editingRolePermissions.includes(permission.key)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={permission.key.replace(/_/g, " ")}
                    secondary={permission.description}
                    primaryTypographyProps={{ fontSize: "0.85rem" }}
                    secondaryTypographyProps={{ fontSize: "0.7rem" }}
                  />
                </ListItem>
              ))}
            </List>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenRoleEditDialog(false)}
            sx={{ textTransform: "none", color: "#666" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveRolePermissions}
            disabled={savingPermissions}
            sx={{
              textTransform: "none",
              bgcolor: "#171512",
              "&:hover": { bgcolor: "#2d2a26" },
            }}
          >
            {savingPermissions ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "Save Permissions"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Roles Dialog */}
      <Dialog
        open={openUserEditDialog}
        onClose={() => setOpenUserEditDialog(false)}
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
              Edit User Roles
            </Typography>
            <IconButton
              size="small"
              onClick={() => setOpenUserEditDialog(false)}
            >
              <FontAwesomeIcon icon={faTimes} size="sm" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {editingUser && (
              <Typography variant="subtitle1" fontWeight={600}>
                {editingUser.full_name}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              Select roles for this user:
            </Typography>
            <List dense>
              {roles.map((role) => (
                <ListItem
                  key={role.id}
                  dense
                  onClick={() => {
                    setEditingUserRoleIds((prev) =>
                      prev.includes(role.id)
                        ? prev.filter((id) => id !== role.id)
                        : [...prev, role.id],
                    );
                  }}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={editingUserRoleIds.includes(role.id)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={formatRoleLabel(role.name)}
                    secondary={role.description}
                    primaryTypographyProps={{ fontSize: "0.85rem" }}
                    secondaryTypographyProps={{ fontSize: "0.7rem" }}
                  />
                </ListItem>
              ))}
            </List>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenUserEditDialog(false)}
            sx={{ textTransform: "none", color: "#666" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveUserRoles}
            disabled={savingUserRoles}
            sx={{
              textTransform: "none",
              bgcolor: "#171512",
              "&:hover": { bgcolor: "#2d2a26" },
            }}
          >
            {savingUserRoles ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "Save Roles"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
