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
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
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
  faChevronDown,
  faSave,
  faFilter,
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
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // Dynamic styles
  const getBorderColor = () =>
    isDarkMode ? "rgba(255,255,255,0.15)" : "#e9e2d8";
  const getTextColor = () => (isDarkMode ? "#ffffff" : "#171512");
  const getSecondaryTextColor = () =>
    isDarkMode ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)";
  const getCardBackground = () => (isDarkMode ? "#1e1e1e" : "background.paper");
  const getHoverBackgroundColor = () =>
    isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)";
  const getInputBackground = () =>
    isDarkMode ? "rgba(255,255,255,0.08)" : "#ffffff";
  const getDialogBackground = () => (isDarkMode ? "#1e1e1e" : "#ffffff");
  const getListItemHover = () =>
    isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const getPermissionText = () =>
    isDarkMode ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.87)";
  const getPermissionDescription = () =>
    isDarkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const getAccordionBackground = () =>
    isDarkMode ? "rgba(255,255,255,0.03)" : "#faf8f6";

  const USERS_PAGE_SIZE = 10;
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info",
  );
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [tabValue, setTabValue] = useState(0);

  // Permission search state
  const [permissionSearch, setPermissionSearch] = useState("");
  const [permissionSearchRoleId, setPermissionSearchRoleId] = useState<
    number | null
  >(null);

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
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [editingRolePermissions, setEditingRolePermissions] = useState<
    Map<number, string[]>
  >(new Map());
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
  const [expandedRoleId, setExpandedRoleId] = useState<number | null>(null);

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
      const permMap = new Map<number, string[]>();
      roleList.forEach((role) => {
        permMap.set(role.id, [...(role.permissions || [])]);
      });
      setEditingRolePermissions(permMap);
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

  // Filter permissions based on search
  const getFilteredPermissions = (roleId: number) => {
    if (!permissionSearch.trim()) return permissions;

    const searchLower = permissionSearch.toLowerCase();
    return permissions.filter(
      (p) =>
        p.key.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower)),
    );
  };

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
      const permissionIds = permissions
        .filter((p) => permissionKeys.includes(p.key))
        .map((p) => p.id);

      await userActions.updateRolePermissions(roleId, permissionIds);
      setMessage("Role permissions updated successfully");
      setMessageType("success");
      await loadRoles();

      setExpandedRoleId(null);
      setEditingRoleId(null);
      setPermissionSearch("");
      setPermissionSearchRoleId(null);

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

  const togglePermissionInAccordion = (
    roleId: number,
    permissionKey: string,
  ) => {
    setEditingRolePermissions((prev) => {
      const newMap = new Map(prev);
      const currentPerms = newMap.get(roleId) || [];
      const updatedPerms = currentPerms.includes(permissionKey)
        ? currentPerms.filter((p) => p !== permissionKey)
        : [...currentPerms, permissionKey];
      newMap.set(roleId, updatedPerms);
      return newMap;
    });
  };

  const hasPermissionsChanged = (roleId: number): boolean => {
    const originalRole = roles.find((r) => r.id === roleId);
    const currentPerms = editingRolePermissions.get(roleId) || [];
    const originalPerms = originalRole?.permissions || [];

    if (originalPerms.length !== currentPerms.length) return true;
    return (
      originalPerms.some((p) => !currentPerms.includes(p)) ||
      currentPerms.some((p) => !originalPerms.includes(p))
    );
  };

  const handleSaveRolePermissionsFromAccordion = async (roleId: number) => {
    const permissionsToSave = editingRolePermissions.get(roleId) || [];
    await updateRolePermissions(roleId, permissionsToSave);
  };

  const handleSelectAllForRole = (roleId: number) => {
    const filtered = getFilteredPermissions(roleId);
    const allPermissionKeys = filtered.map((p) => p.key);
    setEditingRolePermissions((prev) => {
      const newMap = new Map(prev);
      const currentPerms = newMap.get(roleId) || [];
      const merged = [...new Set([...currentPerms, ...allPermissionKeys])];
      newMap.set(roleId, merged);
      return newMap;
    });
  };

  const handleDeselectAllForRole = (roleId: number) => {
    const filtered = getFilteredPermissions(roleId);
    const filteredKeys = filtered.map((p) => p.key);
    setEditingRolePermissions((prev) => {
      const newMap = new Map(prev);
      const currentPerms = newMap.get(roleId) || [];
      const updated = currentPerms.filter((p) => !filteredKeys.includes(p));
      newMap.set(roleId, updated);
      return newMap;
    });
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

      <Paper
        sx={{
          border: "1px solid",
          borderColor: getBorderColor(),
          boxShadow: "none",
          bgcolor: getCardBackground(),
          transition: "all 0.3s ease",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: getBorderColor(),
            px: 2,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.875rem",
              py: 2,
              color: getSecondaryTextColor(),
              "&.Mui-selected": {
                color: getTextColor(),
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: isDarkMode ? "#ffffff" : "#171512",
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
                    bgcolor: getInputBackground(),
                    color: getTextColor(),
                  },
                  "& .MuiInputBase-input": {
                    color: getTextColor(),
                  },
                  "& .MuiInputLabel-root": {
                    color: getSecondaryTextColor(),
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <FontAwesomeIcon
                      icon={faSearch}
                      style={{
                        marginRight: 12,
                        color: isDarkMode ? "rgba(255,255,255,0.5)" : "#999",
                      }}
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
                  bgcolor: isDarkMode ? "#ffffff" : "#171512",
                  color: isDarkMode ? "#171512" : "#ffffff",
                  "&:hover": {
                    bgcolor: isDarkMode ? "rgba(255,255,255,0.9)" : "#2d2a26",
                  },
                }}
              >
                Add User
              </Button>
            </Stack>

            {isLoading ? (
              <Box sx={{ py: 8, textAlign: "center" }}>
                <CircularProgress
                  size={32}
                  sx={{ color: isDarkMode ? "#ffffff" : "#171512" }}
                />
                <Typography color={getSecondaryTextColor()} sx={{ mt: 2 }}>
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
                <Typography color={getSecondaryTextColor()} variant="body1">
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
                          border: `1px solid ${getBorderColor()}`,
                          boxShadow: "none",
                          borderRadius: 2,
                          bgcolor: getCardBackground(),
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: getTextColor(),
                            boxShadow: isDarkMode
                              ? "0 4px 12px rgba(0,0,0,0.4)"
                              : "0 4px 12px rgba(0,0,0,0.05)",
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
                                sx={{
                                  color: getTextColor(),
                                  fontSize: "0.95rem",
                                }}
                              >
                                {row.full_name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: getSecondaryTextColor(),
                                  fontSize: "0.7rem",
                                  display: "block",
                                }}
                              >
                                {row.email}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleEditUser(row)}
                              sx={{
                                color: getSecondaryTextColor(),
                                "&:hover": {
                                  color: getTextColor(),
                                  bgcolor: getHoverBackgroundColor(),
                                },
                              }}
                            >
                              <FontAwesomeIcon icon={faEdit} size="sm" />
                            </IconButton>
                          </Stack>

                          <Divider
                            sx={{ borderColor: getBorderColor(), my: 1.5 }}
                          />

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
                                        color: isDarkMode
                                          ? "#ffffff"
                                          : undefined,
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
                                    color: getSecondaryTextColor(),
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
                      sx={{
                        "& .MuiPaginationItem-root": {
                          color: getTextColor(),
                        },
                        "& .Mui-selected": {
                          bgcolor: isDarkMode
                            ? "rgba(255,255,255,0.15)"
                            : "action.selected",
                        },
                      }}
                    />
                  </Stack>
                )}
              </>
            )}
          </Box>
        </TabPanel>

        {/* Roles Tab - with Permission Search */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 2, pb: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Typography variant="h6" fontWeight={600} color={getTextColor()}>
                Roles & Permissions
              </Typography>
              <Button
                variant="contained"
                startIcon={<FontAwesomeIcon icon={faPlus} size="sm" />}
                onClick={() => setOpenRoleDialog(true)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  bgcolor: isDarkMode ? "#ffffff" : "#171512",
                  color: isDarkMode ? "#171512" : "#ffffff",
                  "&:hover": {
                    bgcolor: isDarkMode ? "rgba(255,255,255,0.9)" : "#2d2a26",
                  },
                }}
              >
                Add Role
              </Button>
            </Stack>

            {loadingRoles ? (
              <Box sx={{ py: 8, textAlign: "center" }}>
                <CircularProgress
                  size={32}
                  sx={{ color: isDarkMode ? "#ffffff" : "#171512" }}
                />
                <Typography color={getSecondaryTextColor()} sx={{ mt: 2 }}>
                  Loading roles...
                </Typography>
              </Box>
            ) : roles.length === 0 ? (
              <Box sx={{ py: 8, textAlign: "center" }}>
                <Typography color={getSecondaryTextColor()} variant="body1">
                  No roles found.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {roles.map((role) => {
                  const currentPerms =
                    editingRolePermissions.get(role.id) || [];
                  const hasChanges = hasPermissionsChanged(role.id);
                  const isExpanded = expandedRoleId === role.id;
                  const filteredPerms = getFilteredPermissions(role.id);
                  const hasFilteredResults = filteredPerms.length > 0;

                  return (
                    <Accordion
                      key={role.id}
                      expanded={isExpanded}
                      onChange={() =>
                        setExpandedRoleId(isExpanded ? null : role.id)
                      }
                      sx={{
                        border: `1px solid ${getBorderColor()}`,
                        borderRadius: 1,
                        boxShadow: "none",
                        bgcolor: getCardBackground(),
                        "&:hover": {
                          bgcolor: getHoverBackgroundColor(),
                        },
                        "&.Mui-expanded": {
                          bgcolor: getAccordionBackground(),
                        },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={
                          <FontAwesomeIcon icon={faChevronDown} size="sm" />
                        }
                        sx={{
                          "& .MuiAccordionSummary-content": {
                            alignItems: "center",
                          },
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ width: "100%", pr: 2 }}
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight={600}
                              color={getTextColor()}
                            >
                              {formatRoleLabel(role.name)}
                            </Typography>
                            {role.description && (
                              <Typography
                                variant="caption"
                                color={getSecondaryTextColor()}
                              >
                                {role.description}
                              </Typography>
                            )}
                            <Chip
                              label={`${currentPerms.length} permissions`}
                              size="small"
                              sx={{
                                fontSize: "0.6rem",
                                bgcolor: isDarkMode
                                  ? "rgba(255,255,255,0.1)"
                                  : "#f0ebe3",
                                color: getTextColor(),
                              }}
                            />
                          </Stack>
                          {hasChanges && (
                            <Chip
                              label="Unsaved changes"
                              size="small"
                              color="warning"
                              sx={{ fontSize: "0.6rem" }}
                            />
                          )}
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0 }}>
                        <Stack spacing={2}>
                          {/* Permission Search */}
                          {isExpanded && (
                            <TextField
                              placeholder="Search permissions..."
                              value={permissionSearch}
                              onChange={(e) => {
                                setPermissionSearch(e.target.value);
                                setPermissionSearchRoleId(role.id);
                              }}
                              size="small"
                              fullWidth
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 1,
                                  bgcolor: getInputBackground(),
                                  color: getTextColor(),
                                },
                                "& .MuiInputBase-input": {
                                  color: getTextColor(),
                                },
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <FontAwesomeIcon
                                      icon={faSearch}
                                      style={{
                                        color: isDarkMode
                                          ? "rgba(255,255,255,0.5)"
                                          : "#999",
                                        fontSize: 14,
                                      }}
                                    />
                                  </InputAdornment>
                                ),
                                endAdornment: permissionSearch && (
                                  <InputAdornment position="end">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setPermissionSearch("");
                                        setPermissionSearchRoleId(null);
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        icon={faTimes}
                                        size="sm"
                                      />
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}

                          {/* Select/Deselect All Controls */}
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                            flexWrap="wrap"
                            sx={{
                              p: 1.5,
                              bgcolor: isDarkMode
                                ? "rgba(255,255,255,0.06)"
                                : "#f8f6f2",
                              borderRadius: 1,
                              border: `1px solid ${getBorderColor()}`,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 500,
                                color: getSecondaryTextColor(),
                              }}
                            >
                              Permissions:
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={
                                <FontAwesomeIcon
                                  icon={faCheckDouble}
                                  size="sm"
                                />
                              }
                              onClick={() => handleSelectAllForRole(role.id)}
                              disabled={
                                !hasFilteredResults ||
                                filteredPerms.every((p) =>
                                  currentPerms.includes(p.key),
                                )
                              }
                              sx={{
                                textTransform: "none",
                                borderRadius: 1,
                                fontSize: "0.7rem",
                                borderColor: getBorderColor(),
                                color: getTextColor(),
                                "&:hover": {
                                  borderColor: getTextColor(),
                                  bgcolor: getHoverBackgroundColor(),
                                },
                              }}
                            >
                              Select All{" "}
                              {permissionSearch && `(${filteredPerms.length})`}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={
                                <FontAwesomeIcon
                                  icon={faTimesCircle}
                                  size="sm"
                                />
                              }
                              onClick={() => handleDeselectAllForRole(role.id)}
                              disabled={
                                !hasFilteredResults ||
                                !filteredPerms.some((p) =>
                                  currentPerms.includes(p.key),
                                )
                              }
                              sx={{
                                textTransform: "none",
                                borderRadius: 1,
                                fontSize: "0.7rem",
                                color: "error.main",
                                borderColor: "error.main",
                                "&:hover": {
                                  borderColor: "error.dark",
                                  bgcolor: isDarkMode
                                    ? "rgba(244,67,54,0.15)"
                                    : "error.light",
                                },
                              }}
                            >
                              Deselect All{" "}
                              {permissionSearch && `(${filteredPerms.length})`}
                            </Button>
                            <Chip
                              label={`${currentPerms.length} selected`}
                              size="small"
                              color={
                                currentPerms.length > 0 ? "primary" : "default"
                              }
                              sx={{
                                fontSize: "0.6rem",
                                ml: "auto",
                                bgcolor:
                                  isDarkMode && currentPerms.length > 0
                                    ? "rgba(25,118,210,0.2)"
                                    : undefined,
                                color:
                                  isDarkMode && currentPerms.length > 0
                                    ? "#90caf9"
                                    : undefined,
                              }}
                            />
                            {permissionSearch && (
                              <Chip
                                label={`${filteredPerms.length} results`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: "0.6rem",
                                  borderColor: getBorderColor(),
                                  color: getSecondaryTextColor(),
                                }}
                              />
                            )}
                          </Stack>

                          {/* Permissions List */}
                          <List
                            dense
                            sx={{
                              maxHeight: 300,
                              overflow: "auto",
                              bgcolor: isDarkMode
                                ? "rgba(255,255,255,0.03)"
                                : "transparent",
                              borderRadius: 1,
                              border: isDarkMode
                                ? `1px solid ${getBorderColor()}`
                                : "none",
                            }}
                          >
                            {hasFilteredResults ? (
                              filteredPerms.map((permission) => (
                                <ListItem
                                  key={permission.id}
                                  dense
                                  onClick={() =>
                                    togglePermissionInAccordion(
                                      role.id,
                                      permission.key,
                                    )
                                  }
                                  sx={{
                                    cursor: "pointer",
                                    borderRadius: 0.5,
                                    "&:hover": {
                                      bgcolor: getListItemHover(),
                                    },
                                    color: getTextColor(),
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 40 }}>
                                    <Checkbox
                                      edge="start"
                                      checked={currentPerms.includes(
                                        permission.key,
                                      )}
                                      tabIndex={-1}
                                      disableRipple
                                      sx={{
                                        color: isDarkMode
                                          ? "rgba(255,255,255,0.5)"
                                          : undefined,
                                        "&.Mui-checked": {
                                          color: isDarkMode
                                            ? "#90caf9"
                                            : undefined,
                                        },
                                      }}
                                    />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      <Box component="span">
                                        {permission.key.replace(/_/g, " ")}
                                        {permissionSearch && (
                                          <Chip
                                            label="Match"
                                            size="small"
                                            sx={{
                                              ml: 1,
                                              fontSize: "0.5rem",
                                              height: 16,
                                              bgcolor: isDarkMode
                                                ? "rgba(255,255,255,0.1)"
                                                : "#f0ebe3",
                                              color: getSecondaryTextColor(),
                                            }}
                                          />
                                        )}
                                      </Box>
                                    }
                                    secondary={permission.description}
                                    primaryTypographyProps={{
                                      fontSize: "0.85rem",
                                      color: getPermissionText(),
                                      fontWeight: 500,
                                    }}
                                    secondaryTypographyProps={{
                                      fontSize: "0.7rem",
                                      color: getPermissionDescription(),
                                    }}
                                  />
                                </ListItem>
                              ))
                            ) : (
                              <Box sx={{ py: 4, textAlign: "center" }}>
                                <Typography
                                  color={getSecondaryTextColor()}
                                  variant="body2"
                                >
                                  No permissions match your search.
                                </Typography>
                              </Box>
                            )}
                          </List>

                          {/* Save Button */}
                          {hasChanges && (
                            <Button
                              variant="contained"
                              startIcon={
                                <FontAwesomeIcon icon={faSave} size="sm" />
                              }
                              onClick={() =>
                                handleSaveRolePermissionsFromAccordion(role.id)
                              }
                              disabled={savingPermissions}
                              sx={{
                                alignSelf: "flex-end",
                                textTransform: "none",
                                bgcolor: isDarkMode ? "#ffffff" : "#171512",
                                color: isDarkMode ? "#171512" : "#ffffff",
                                "&:hover": {
                                  bgcolor: isDarkMode
                                    ? "rgba(255,255,255,0.9)"
                                    : "#2d2a26",
                                },
                              }}
                            >
                              {savingPermissions ? "Saving..." : "Save Changes"}
                            </Button>
                          )}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Stack>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* Add User Dialog - unchanged */}
      <Dialog
        open={openUserDialog}
        onClose={() => setOpenUserDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: getDialogBackground(),
            border: `1px solid ${getBorderColor()}`,
          },
        }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={600} color={getTextColor()}>
              Add New User
            </Typography>
            <IconButton
              size="small"
              onClick={() => setOpenUserDialog(false)}
              sx={{ color: getSecondaryTextColor() }}
            >
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: getInputBackground(),
                  color: getTextColor(),
                },
                "& .MuiInputLabel-root": {
                  color: getSecondaryTextColor(),
                },
              }}
            />
            <TextField
              label="Email *"
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              fullWidth
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: getInputBackground(),
                  color: getTextColor(),
                },
                "& .MuiInputLabel-root": {
                  color: getSecondaryTextColor(),
                },
              }}
            />
            <TextField
              label="Password *"
              type="password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              fullWidth
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: getInputBackground(),
                  color: getTextColor(),
                },
                "& .MuiInputLabel-root": {
                  color: getSecondaryTextColor(),
                },
              }}
            />
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: getSecondaryTextColor() }}>
                Roles
              </InputLabel>
              <Select
                multiple
                value={newUserRoleIds}
                onChange={(e) => setNewUserRoleIds(e.target.value as number[])}
                label="Roles"
                sx={{
                  bgcolor: getInputBackground(),
                  color: getTextColor(),
                  "& .MuiSelect-select": {
                    color: getTextColor(),
                  },
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((roleId) => {
                      const role = roles.find((r) => r.id === roleId);
                      return role ? (
                        <Chip
                          key={roleId}
                          label={formatRoleLabel(role.name)}
                          size="small"
                          sx={{
                            color: isDarkMode ? "#ffffff" : undefined,
                            bgcolor: isDarkMode
                              ? "rgba(255,255,255,0.15)"
                              : undefined,
                          }}
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
            sx={{ textTransform: "none", color: getSecondaryTextColor() }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateUser}
            disabled={creatingUser}
            sx={{
              textTransform: "none",
              bgcolor: isDarkMode ? "#ffffff" : "#171512",
              color: isDarkMode ? "#171512" : "#ffffff",
              "&:hover": {
                bgcolor: isDarkMode ? "rgba(255,255,255,0.9)" : "#2d2a26",
              },
            }}
          >
            {creatingUser ? (
              <CircularProgress
                size={20}
                sx={{ color: isDarkMode ? "#171512" : "white" }}
              />
            ) : (
              "Create User"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Role Dialog - unchanged */}
      <Dialog
        open={openRoleDialog}
        onClose={() => setOpenRoleDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: getDialogBackground(),
            border: `1px solid ${getBorderColor()}`,
          },
        }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={600} color={getTextColor()}>
              Add New Role
            </Typography>
            <IconButton
              size="small"
              onClick={() => setOpenRoleDialog(false)}
              sx={{ color: getSecondaryTextColor() }}
            >
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: getInputBackground(),
                  color: getTextColor(),
                },
                "& .MuiInputLabel-root": {
                  color: getSecondaryTextColor(),
                },
              }}
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: getInputBackground(),
                  color: getTextColor(),
                },
                "& .MuiInputLabel-root": {
                  color: getSecondaryTextColor(),
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenRoleDialog(false)}
            sx={{ textTransform: "none", color: getSecondaryTextColor() }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateRole}
            disabled={creatingRole}
            sx={{
              textTransform: "none",
              bgcolor: isDarkMode ? "#ffffff" : "#171512",
              color: isDarkMode ? "#171512" : "#ffffff",
              "&:hover": {
                bgcolor: isDarkMode ? "rgba(255,255,255,0.9)" : "#2d2a26",
              },
            }}
          >
            {creatingRole ? (
              <CircularProgress
                size={20}
                sx={{ color: isDarkMode ? "#171512" : "white" }}
              />
            ) : (
              "Create Role"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Roles Dialog - unchanged */}
      <Dialog
        open={openUserEditDialog}
        onClose={() => setOpenUserEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: getDialogBackground(),
            border: `1px solid ${getBorderColor()}`,
          },
        }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={600} color={getTextColor()}>
              Edit User Roles
            </Typography>
            <IconButton
              size="small"
              onClick={() => setOpenUserEditDialog(false)}
              sx={{ color: getSecondaryTextColor() }}
            >
              <FontAwesomeIcon icon={faTimes} size="sm" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {editingUser && (
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color={getTextColor()}
              >
                {editingUser.full_name}
              </Typography>
            )}
            <Typography variant="caption" color={getSecondaryTextColor()}>
              Select roles for this user:
            </Typography>
            <List
              dense
              sx={{
                bgcolor: isDarkMode ? "rgba(255,255,255,0.03)" : "transparent",
                borderRadius: 1,
                border: isDarkMode ? `1px solid ${getBorderColor()}` : "none",
              }}
            >
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
                    borderRadius: 0.5,
                    "&:hover": {
                      bgcolor: getListItemHover(),
                    },
                    color: getTextColor(),
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Checkbox
                      edge="start"
                      checked={editingUserRoleIds.includes(role.id)}
                      tabIndex={-1}
                      disableRipple
                      sx={{
                        color: isDarkMode ? "rgba(255,255,255,0.5)" : undefined,
                        "&.Mui-checked": {
                          color: isDarkMode ? "#90caf9" : undefined,
                        },
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={formatRoleLabel(role.name)}
                    secondary={role.description}
                    primaryTypographyProps={{
                      fontSize: "0.85rem",
                      color: getPermissionText(),
                      fontWeight: 500,
                    }}
                    secondaryTypographyProps={{
                      fontSize: "0.7rem",
                      color: getPermissionDescription(),
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{ p: 2, borderTop: `1px solid ${getBorderColor()}` }}
        >
          <Button
            onClick={() => setOpenUserEditDialog(false)}
            sx={{
              textTransform: "none",
              color: getSecondaryTextColor(),
              "&:hover": {
                bgcolor: getHoverBackgroundColor(),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveUserRoles}
            disabled={savingUserRoles}
            sx={{
              textTransform: "none",
              bgcolor: isDarkMode ? "#ffffff" : "#171512",
              color: isDarkMode ? "#171512" : "#ffffff",
              "&:hover": {
                bgcolor: isDarkMode ? "rgba(255,255,255,0.9)" : "#2d2a26",
              },
            }}
          >
            {savingUserRoles ? (
              <CircularProgress
                size={20}
                sx={{ color: isDarkMode ? "#171512" : "white" }}
              />
            ) : (
              "Save Roles"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
