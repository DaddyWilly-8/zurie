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
  useMediaQuery,
  Divider,
  FormHelperText,
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
  faEnvelope,
  faPhone,
  faCalendar,
  faUser,
  faExclamationCircle,
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
      {value === index && <Box sx={{ py: { xs: 1.5, md: 3 } }}>{children}</Box>}
    </div>
  );
}

// Validation error type
type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  roleName?: string;
  roleDescription?: string;
};

export const AdminUsersClient = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

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

  // User creation state
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRoleIds, setNewUserRoleIds] = useState<number[]>([]);
  const [creatingUser, setCreatingUser] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [userFormErrors, setUserFormErrors] = useState<FormErrors>({});

  // Role creation state
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [creatingRole, setCreatingRole] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [roleFormErrors, setRoleFormErrors] = useState<FormErrors>({});

  // Role edit state
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
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

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

  const getFilteredPermissions = () => {
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
      const originalRole = roles.find((r) => r.id === roleId);
      const originalPerms = originalRole?.permissions || [];

      const permissionsToAdd = permissionKeys.filter(
        (key) => !originalPerms.includes(key),
      );
      const permissionsToRemove = originalPerms.filter(
        (key) => !permissionKeys.includes(key),
      );

      const allPermissions = permissions;

      for (const permissionKey of permissionsToRemove) {
        const permission = allPermissions.find((p) => p.key === permissionKey);
        if (permission) {
          try {
            await userActions.removePermissionFromRole(roleId, permission.id);
          } catch (error) {
            console.warn(
              `Could not remove permission ${permissionKey}:`,
              error,
            );
          }
        }
      }

      const permissionIds = permissionsToAdd
        .map((key) => allPermissions.find((p) => p.key === key)?.id)
        .filter((id): id is number => id !== undefined);

      if (permissionIds.length > 0) {
        await userActions.updateRolePermissions(roleId, permissionIds);
      }

      setMessage(
        `Updated ${permissionsToAdd.length} permission(s) added, ${permissionsToRemove.length} removed.`,
      );
      setMessageType("success");
      await loadRoles();

      setExpandedRoleId(null);
      setPermissionSearch("");

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

  // Validation functions
  const validateUserForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!newUserName.trim()) {
      errors.name = "Full name is required";
      isValid = false;
    } else if (newUserName.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    if (!newUserEmail.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserEmail.trim())) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!newUserPassword.trim()) {
      errors.password = "Password is required";
      isValid = false;
    } else if (newUserPassword.trim().length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    setUserFormErrors(errors);
    return isValid;
  };

  const validateRoleForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!roleName.trim()) {
      errors.roleName = "Role name is required";
      isValid = false;
    } else if (roleName.trim().length < 2) {
      errors.roleName = "Role name must be at least 2 characters";
      isValid = false;
    }

    setRoleFormErrors(errors);
    return isValid;
  };

  const handleCreateUser = async () => {
    if (!validateUserForm()) return;

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
      setUserFormErrors({});
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
    if (!validateRoleForm()) return;

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
      setRoleFormErrors({});
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
    const roleNames = user.roleNames || [];
    const roleIds = roleNames
      .map((roleName: string) => {
        const role = roles.find((r) => r.name === roleName);
        return role?.id;
      })
      .filter((id): id is number => id !== undefined);
    setEditingUserRoleIds(roleIds);
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
    const filtered = getFilteredPermissions();
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
    const filtered = getFilteredPermissions();
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
    return rows.filter(
      (row: AdminUserRow) =>
        row.full_name?.toLowerCase().includes(query) ||
        row.name?.toLowerCase().includes(query) ||
        row.email?.toLowerCase().includes(query),
    );
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  const getChipBackground = () =>
    isDarkMode ? "rgba(255,255,255,0.1)" : "#f0ebe3";

  // Helper to clear form errors when user types
  const clearUserFieldError = (field: keyof FormErrors) => {
    if (userFormErrors[field]) {
      setUserFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const clearRoleFieldError = (field: keyof FormErrors) => {
    if (roleFormErrors[field]) {
      setRoleFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Stack spacing={{ xs: 2, md: 3 }}>
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
          overflow: "hidden",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{
            borderBottom: 1,
            borderColor: getBorderColor(),
            px: { xs: 1, md: 2 },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: { xs: "0.75rem", md: "0.875rem" },
              py: { xs: 1.5, md: 2 },
              px: { xs: 1.5, md: 3 },
              minHeight: { xs: 40, md: 48 },
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

        {/* Users Tab - with Accordion */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: { xs: 1.5, md: 2 }, pb: 2 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={{ xs: 2, sm: 0 }}
              sx={{ mb: 3 }}
            >
              <TextField
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                fullWidth={isMobile}
                sx={{
                  maxWidth: { xs: "100%", sm: 400 },
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
                    <InputAdornment position="start">
                      <FontAwesomeIcon
                        icon={faSearch}
                        style={{
                          color: isDarkMode ? "rgba(255,255,255,0.5)" : "#999",
                          fontSize: 14,
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                startIcon={<FontAwesomeIcon icon={faUserPlus} size="sm" />}
                onClick={() => setOpenUserDialog(true)}
                fullWidth={isMobile}
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
              <Stack spacing={2}>
                {paginatedRows.map((row) => {
                  const isExpanded = expandedUserId === row.id;

                  return (
                    <Accordion
                      key={row.id}
                      expanded={isExpanded}
                      onChange={() =>
                        setExpandedUserId(isExpanded ? null : row.id)
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
                          px: { xs: 1.5, md: 2 },
                          py: { xs: 0.5, md: 1 },
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ width: "100%", pr: 1 }}
                        >
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={{ xs: 0.5, sm: 2 }}
                            alignItems={{ xs: "flex-start", sm: "center" }}
                            sx={{ flex: 1, minWidth: 0 }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  bgcolor: isDarkMode
                                    ? "rgba(255,255,255,0.1)"
                                    : "#f0ebe3",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faUser}
                                  size="sm"
                                  style={{
                                    color: isDarkMode
                                      ? "rgba(255,255,255,0.6)"
                                      : "#666",
                                  }}
                                />
                              </Box>
                              <Typography
                                fontWeight={600}
                                color={getTextColor()}
                                sx={{
                                  fontSize: { xs: "0.9rem", md: "1rem" },
                                  wordBreak: "break-word",
                                }}
                              >
                                {row.full_name || row.name}
                              </Typography>
                            </Stack>
                            <Typography
                              variant="caption"
                              color={getSecondaryTextColor()}
                              sx={{
                                fontSize: { xs: "0.6rem", md: "0.7rem" },
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <FontAwesomeIcon icon={faEnvelope} size="xs" />
                              {row.email}
                            </Typography>
                          </Stack>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            flexShrink={0}
                          >
                            <Stack direction="row" spacing={0.5}>
                              {(row.roleNames || []).length > 0 ? (
                                (row.roleNames || [])
                                  .slice(0, 2)
                                  .map((roleName: string) => (
                                    <Chip
                                      key={roleName}
                                      label={formatRoleLabel(roleName)}
                                      color={getRoleColor(roleName)}
                                      size="small"
                                      sx={{
                                        fontSize: {
                                          xs: "0.45rem",
                                          sm: "0.55rem",
                                        },
                                        fontWeight: 500,
                                        color: isDarkMode
                                          ? "#ffffff"
                                          : undefined,
                                        height: { xs: 18, sm: 22 },
                                      }}
                                    />
                                  ))
                              ) : (
                                <Chip
                                  label="No roles"
                                  size="small"
                                  sx={{
                                    fontSize: "0.5rem",
                                    fontWeight: 500,
                                    color: getSecondaryTextColor(),
                                    height: 18,
                                  }}
                                />
                              )}
                              {(row.roleNames || []).length > 2 && (
                                <Chip
                                  label={`+${(row.roleNames || []).length - 2}`}
                                  size="small"
                                  sx={{
                                    fontSize: "0.5rem",
                                    fontWeight: 500,
                                    height: 18,
                                    bgcolor: getChipBackground(),
                                    color: getTextColor(),
                                  }}
                                />
                              )}
                            </Stack>
                          </Stack>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0, px: { xs: 1.5, md: 2 } }}>
                        <Stack spacing={2}>
                          <Divider sx={{ borderColor: getBorderColor() }} />

                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Stack spacing={1.5}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 600,
                                    color: getSecondaryTextColor(),
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    fontSize: "0.65rem",
                                  }}
                                >
                                  Personal Information
                                </Typography>

                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <Box
                                    sx={{
                                      width: 20,
                                      color: getSecondaryTextColor(),
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faUser} size="sm" />
                                  </Box>
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontSize: "0.6rem",
                                        color: getSecondaryTextColor(),
                                      }}
                                    >
                                      Full Name
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: getTextColor(),
                                        fontWeight: 500,
                                      }}
                                    >
                                      {row.full_name || row.name}
                                    </Typography>
                                  </Box>
                                </Stack>

                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <Box
                                    sx={{
                                      width: 20,
                                      color: getSecondaryTextColor(),
                                    }}
                                  >
                                    <FontAwesomeIcon
                                      icon={faEnvelope}
                                      size="sm"
                                    />
                                  </Box>
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontSize: "0.6rem",
                                        color: getSecondaryTextColor(),
                                      }}
                                    >
                                      Email
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: getTextColor() }}
                                    >
                                      {row.email}
                                    </Typography>
                                  </Box>
                                </Stack>

                                {row.phone && (
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                  >
                                    <Box
                                      sx={{
                                        width: 20,
                                        color: getSecondaryTextColor(),
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        icon={faPhone}
                                        size="sm"
                                      />
                                    </Box>
                                    <Box>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontSize: "0.6rem",
                                          color: getSecondaryTextColor(),
                                        }}
                                      >
                                        Phone
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{ color: getTextColor() }}
                                      >
                                        {row.phone}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                )}

                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <Box
                                    sx={{
                                      width: 20,
                                      color: getSecondaryTextColor(),
                                    }}
                                  >
                                    <FontAwesomeIcon
                                      icon={faCalendar}
                                      size="sm"
                                    />
                                  </Box>
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontSize: "0.6rem",
                                        color: getSecondaryTextColor(),
                                      }}
                                    >
                                      Joined
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: getTextColor() }}
                                    >
                                      {formatDate(row.created_at)}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Stack>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                              <Stack spacing={1.5}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 600,
                                    color: getSecondaryTextColor(),
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    fontSize: "0.65rem",
                                  }}
                                >
                                  Roles
                                </Typography>

                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  flexWrap="wrap"
                                >
                                  {(row.roleNames || []).length > 0 ? (
                                    (row.roleNames || []).map(
                                      (roleName: string) => (
                                        <Chip
                                          key={roleName}
                                          label={formatRoleLabel(roleName)}
                                          color={getRoleColor(roleName)}
                                          size="small"
                                          sx={{
                                            fontSize: "0.6rem",
                                            fontWeight: 500,
                                            color: isDarkMode
                                              ? "#ffffff"
                                              : undefined,
                                          }}
                                        />
                                      ),
                                    )
                                  ) : (
                                    <Chip
                                      label="No roles assigned"
                                      size="small"
                                      sx={{
                                        fontSize: "0.6rem",
                                        fontWeight: 500,
                                        color: getSecondaryTextColor(),
                                      }}
                                    />
                                  )}
                                </Stack>
                              </Stack>
                            </Grid>
                          </Grid>

                          <Divider sx={{ borderColor: getBorderColor() }} />

                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1.5}
                            justifyContent="flex-end"
                          >
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleEditUser(row)}
                              startIcon={
                                <FontAwesomeIcon icon={faEdit} size="sm" />
                              }
                              sx={{
                                textTransform: "none",
                                borderRadius: 1,
                                borderColor: getBorderColor(),
                                color: getTextColor(),
                                "&:hover": {
                                  borderColor: getTextColor(),
                                  bgcolor: getHoverBackgroundColor(),
                                },
                              }}
                            >
                              Edit Roles
                            </Button>
                          </Stack>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Stack>
            )}

            {filteredRows.length > USERS_PAGE_SIZE && (
              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  size={isMobile ? "small" : "medium"}
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
          </Box>
        </TabPanel>

        {/* Roles Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: { xs: 1.5, md: 2 }, pb: 2 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={{ xs: 2, sm: 0 }}
              sx={{ mb: 3 }}
            >
              <Typography variant="h6" fontWeight={600} color={getTextColor()}>
                Roles & Permissions
              </Typography>
              <Button
                variant="contained"
                startIcon={<FontAwesomeIcon icon={faPlus} size="sm" />}
                onClick={() => setOpenRoleDialog(true)}
                fullWidth={isMobile}
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
                  const filteredPerms = getFilteredPermissions();
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
                          px: { xs: 1.5, md: 2 },
                          py: { xs: 0.5, md: 1 },
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ width: "100%", pr: 1 }}
                        >
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={{ xs: 0.5, sm: 2 }}
                            alignItems={{ xs: "flex-start", sm: "center" }}
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight={600}
                              color={getTextColor()}
                              sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
                            >
                              {formatRoleLabel(role.name)}
                            </Typography>
                            {role.description && (
                              <Typography
                                variant="caption"
                                color={getSecondaryTextColor()}
                                sx={{
                                  fontSize: { xs: "0.6rem", md: "0.7rem" },
                                }}
                              >
                                {role.description}
                              </Typography>
                            )}
                            <Chip
                              label={`${currentPerms.length} permissions`}
                              size="small"
                              sx={{
                                fontSize: { xs: "0.5rem", md: "0.6rem" },
                                bgcolor: isDarkMode
                                  ? "rgba(255,255,255,0.1)"
                                  : "#f0ebe3",
                                color: getTextColor(),
                                height: { xs: 18, md: 24 },
                              }}
                            />
                          </Stack>
                          {hasChanges && (
                            <Chip
                              label="Unsaved changes"
                              size="small"
                              color="warning"
                              sx={{
                                fontSize: { xs: "0.5rem", md: "0.6rem" },
                                height: { xs: 18, md: 24 },
                              }}
                            />
                          )}
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0, px: { xs: 1.5, md: 2 } }}>
                        <Stack spacing={2}>
                          {isExpanded && (
                            <Grid container spacing={1.5} sx={{ mb: 1 }}>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                  placeholder="Search permissions..."
                                  value={permissionSearch}
                                  onChange={(e) => {
                                    setPermissionSearch(e.target.value);
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
                                      fontSize: {
                                        xs: "0.8rem",
                                        md: "0.875rem",
                                      },
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
                              </Grid>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Stack
                                  direction={{ xs: "column", sm: "row" }}
                                  spacing={{ xs: 1, sm: 1.5 }}
                                  alignItems={{
                                    xs: "flex-start",
                                    sm: "center",
                                  }}
                                  sx={{
                                    height: "100%",
                                    flexWrap: "wrap",
                                    p: { xs: 1, md: 0 },
                                    bgcolor: isDarkMode
                                      ? "rgba(255,255,255,0.03)"
                                      : "transparent",
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight: 500,
                                      color: getSecondaryTextColor(),
                                      whiteSpace: "nowrap",
                                      fontSize: { xs: "0.6rem", md: "0.7rem" },
                                    }}
                                  >
                                    Quick Actions:
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
                                    onClick={() =>
                                      handleSelectAllForRole(role.id)
                                    }
                                    disabled={
                                      !hasFilteredResults ||
                                      filteredPerms.every((p) =>
                                        currentPerms.includes(p.key),
                                      )
                                    }
                                    sx={{
                                      textTransform: "none",
                                      borderRadius: 1,
                                      fontSize: {
                                        xs: "0.55rem",
                                        md: "0.65rem",
                                      },
                                      borderColor: getBorderColor(),
                                      color: getTextColor(),
                                      px: { xs: 1, md: 1.5 },
                                      py: { xs: 0.5, md: 0.5 },
                                      "&:hover": {
                                        borderColor: getTextColor(),
                                        bgcolor: getHoverBackgroundColor(),
                                      },
                                    }}
                                  >
                                    Select All{" "}
                                    {permissionSearch &&
                                      `(${filteredPerms.length})`}
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
                                    onClick={() =>
                                      handleDeselectAllForRole(role.id)
                                    }
                                    disabled={
                                      !hasFilteredResults ||
                                      !filteredPerms.some((p) =>
                                        currentPerms.includes(p.key),
                                      )
                                    }
                                    sx={{
                                      textTransform: "none",
                                      borderRadius: 1,
                                      fontSize: {
                                        xs: "0.55rem",
                                        md: "0.65rem",
                                      },
                                      color: "error.main",
                                      borderColor: "error.main",
                                      px: { xs: 1, md: 1.5 },
                                      py: { xs: 0.5, md: 0.5 },
                                      "&:hover": {
                                        borderColor: "error.dark",
                                        bgcolor: isDarkMode
                                          ? "rgba(244,67,54,0.15)"
                                          : "error.light",
                                      },
                                    }}
                                  >
                                    Deselect All{" "}
                                    {permissionSearch &&
                                      `(${filteredPerms.length})`}
                                  </Button>
                                  <Chip
                                    label={`${currentPerms.length} selected`}
                                    size="small"
                                    color={
                                      currentPerms.length > 0
                                        ? "primary"
                                        : "default"
                                    }
                                    sx={{
                                      fontSize: { xs: "0.5rem", md: "0.55rem" },
                                      height: { xs: 18, md: 24 },
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
                                        fontSize: {
                                          xs: "0.5rem",
                                          md: "0.55rem",
                                        },
                                        height: { xs: 18, md: 24 },
                                        borderColor: getBorderColor(),
                                        color: getSecondaryTextColor(),
                                      }}
                                    />
                                  )}
                                </Stack>
                              </Grid>
                            </Grid>
                          )}

                          <List
                            dense
                            sx={{
                              maxHeight: { xs: 200, md: 300 },
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
                                    py: { xs: 0.5, md: 0.75 },
                                  }}
                                >
                                  <ListItemIcon
                                    sx={{ minWidth: { xs: 32, md: 40 } }}
                                  >
                                    <Checkbox
                                      edge="start"
                                      checked={currentPerms.includes(
                                        permission.key,
                                      )}
                                      tabIndex={-1}
                                      disableRipple
                                      size={isMobile ? "small" : "medium"}
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
                                        <Typography
                                          component="span"
                                          sx={{
                                            fontSize: {
                                              xs: "0.75rem",
                                              md: "0.85rem",
                                            },
                                            color: getPermissionText(),
                                            fontWeight: 500,
                                          }}
                                        >
                                          {permission.key.replace(/_/g, " ")}
                                        </Typography>
                                        {permissionSearch && (
                                          <Chip
                                            label="Match"
                                            size="small"
                                            sx={{
                                              ml: 0.5,
                                              fontSize: {
                                                xs: "0.4rem",
                                                md: "0.5rem",
                                              },
                                              height: { xs: 14, md: 16 },
                                              bgcolor: isDarkMode
                                                ? "rgba(255,255,255,0.1)"
                                                : "#f0ebe3",
                                              color: getSecondaryTextColor(),
                                            }}
                                          />
                                        )}
                                      </Box>
                                    }
                                    secondary={
                                      <Typography
                                        component="span"
                                        variant="caption"
                                        sx={{
                                          fontSize: {
                                            xs: "0.6rem",
                                            md: "0.7rem",
                                          },
                                          color: getPermissionDescription(),
                                          display: "block",
                                          mt: 0.25,
                                        }}
                                      >
                                        {permission.description}
                                      </Typography>
                                    }
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
                              fullWidth={isMobile}
                              sx={{
                                alignSelf: { xs: "stretch", sm: "flex-end" },
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

      {/* Add User Dialog with Validation Errors */}
      <Dialog
        open={openUserDialog}
        onClose={() => {
          setOpenUserDialog(false);
          setUserFormErrors({});
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: getDialogBackground(),
            border: `1px solid ${getBorderColor()}`,
            m: { xs: 1, md: 2 },
          },
        }}
      >
        <DialogTitle sx={{ p: { xs: 2, md: 3 } }}>
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
              onClick={() => {
                setOpenUserDialog(false);
                setUserFormErrors({});
              }}
              sx={{ color: getSecondaryTextColor() }}
            >
              <FontAwesomeIcon icon={faTimes} size="sm" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Full Name *"
              value={newUserName}
              onChange={(e) => {
                setNewUserName(e.target.value);
                clearUserFieldError("name");
              }}
              onBlur={() => {
                if (!newUserName.trim() && !userFormErrors.name) {
                  setUserFormErrors((prev) => ({
                    ...prev,
                    name: "Full name is required",
                  }));
                }
              }}
              fullWidth
              size={isMobile ? "small" : "medium"}
              error={!!userFormErrors.name}
              helperText={userFormErrors.name}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: getInputBackground(),
                  color: getTextColor(),
                },
                "& .MuiInputLabel-root": {
                  color: userFormErrors.name
                    ? "error.main"
                    : getSecondaryTextColor(),
                },
              }}
            />
            <TextField
              label="Email *"
              type="email"
              value={newUserEmail}
              onChange={(e) => {
                setNewUserEmail(e.target.value);
                clearUserFieldError("email");
              }}
              onBlur={() => {
                if (
                  newUserEmail.trim() &&
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserEmail.trim()) &&
                  !userFormErrors.email
                ) {
                  setUserFormErrors((prev) => ({
                    ...prev,
                    email: "Please enter a valid email address",
                  }));
                }
              }}
              fullWidth
              size={isMobile ? "small" : "medium"}
              error={!!userFormErrors.email}
              helperText={userFormErrors.email}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: getInputBackground(),
                  color: getTextColor(),
                },
                "& .MuiInputLabel-root": {
                  color: userFormErrors.email
                    ? "error.main"
                    : getSecondaryTextColor(),
                },
              }}
            />
            <TextField
              label="Password *"
              type="password"
              value={newUserPassword}
              onChange={(e) => {
                setNewUserPassword(e.target.value);
                clearUserFieldError("password");
              }}
              onBlur={() => {
                if (
                  newUserPassword.trim() &&
                  newUserPassword.trim().length < 8 &&
                  !userFormErrors.password
                ) {
                  setUserFormErrors((prev) => ({
                    ...prev,
                    password: "Password must be at least 8 characters",
                  }));
                }
              }}
              fullWidth
              size={isMobile ? "small" : "medium"}
              error={!!userFormErrors.password}
              helperText={userFormErrors.password}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: getInputBackground(),
                  color: getTextColor(),
                },
                "& .MuiInputLabel-root": {
                  color: userFormErrors.password
                    ? "error.main"
                    : getSecondaryTextColor(),
                },
              }}
            />
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
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
                            fontSize: "0.6rem",
                            height: 20,
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
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
          <Button
            onClick={() => {
              setOpenUserDialog(false);
              setUserFormErrors({});
            }}
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

      {/* Add Role Dialog with Validation Errors */}
      <Dialog
        open={openRoleDialog}
        onClose={() => {
          setOpenRoleDialog(false);
          setRoleFormErrors({});
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: getDialogBackground(),
            border: `1px solid ${getBorderColor()}`,
            m: { xs: 1, md: 2 },
          },
        }}
      >
        <DialogTitle sx={{ p: { xs: 2, md: 3 } }}>
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
              onClick={() => {
                setOpenRoleDialog(false);
                setRoleFormErrors({});
              }}
              sx={{ color: getSecondaryTextColor() }}
            >
              <FontAwesomeIcon icon={faTimes} size="sm" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Role Name *"
              value={roleName}
              onChange={(e) => {
                setRoleName(e.target.value);
                clearRoleFieldError("roleName");
              }}
              onBlur={() => {
                if (!roleName.trim() && !roleFormErrors.roleName) {
                  setRoleFormErrors((prev) => ({
                    ...prev,
                    roleName: "Role name is required",
                  }));
                }
              }}
              fullWidth
              size={isMobile ? "small" : "medium"}
              placeholder="e.g., Sales Manager"
              error={!!roleFormErrors.roleName}
              helperText={roleFormErrors.roleName}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: getInputBackground(),
                  color: getTextColor(),
                },
                "& .MuiInputLabel-root": {
                  color: roleFormErrors.roleName
                    ? "error.main"
                    : getSecondaryTextColor(),
                },
              }}
            />
            <TextField
              label="Description (optional)"
              value={roleDescription}
              onChange={(e) => {
                setRoleDescription(e.target.value);
                clearRoleFieldError("roleDescription");
              }}
              fullWidth
              size={isMobile ? "small" : "medium"}
              multiline
              minRows={2}
              placeholder="Describe the role's responsibilities..."
              error={!!roleFormErrors.roleDescription}
              helperText={roleFormErrors.roleDescription}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: getInputBackground(),
                  color: getTextColor(),
                },
                "& .MuiInputLabel-root": {
                  color: roleFormErrors.roleDescription
                    ? "error.main"
                    : getSecondaryTextColor(),
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
          <Button
            onClick={() => {
              setOpenRoleDialog(false);
              setRoleFormErrors({});
            }}
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

      {/* Edit User Roles Dialog */}
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
            m: { xs: 1, md: 2 },
          },
        }}
      >
        <DialogTitle sx={{ p: { xs: 2, md: 3 } }}>
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
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {editingUser && (
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color={getTextColor()}
                sx={{ fontSize: { xs: "0.95rem", md: "1rem" } }}
              >
                {editingUser.full_name || editingUser.name}
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
                maxHeight: 300,
                overflow: "auto",
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
                    py: { xs: 0.5, md: 0.75 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: { xs: 32, md: 40 } }}>
                    <Checkbox
                      edge="start"
                      checked={editingUserRoleIds.includes(role.id)}
                      tabIndex={-1}
                      disableRipple
                      size={isMobile ? "small" : "medium"}
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
                      fontSize: { xs: "0.8rem", md: "0.85rem" },
                      color: getPermissionText(),
                      fontWeight: 500,
                    }}
                    secondaryTypographyProps={{
                      fontSize: { xs: "0.6rem", md: "0.7rem" },
                      color: getPermissionDescription(),
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
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
