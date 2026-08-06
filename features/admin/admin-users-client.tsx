"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  userActions,
  UsersTable,
  type AdminUserRow,
  type UserRole,
} from "@/features/admin/users";

export const AdminUsersClient = ({ initialData }: { initialData: AdminUserRow[] }) => {
  const USERS_PAGE_SIZE = 10;
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [page, setPage] = useState(1);

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);

  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [creatingRole, setCreatingRole] = useState(false);

  const [attachUserId, setAttachUserId] = useState("");
  const [attachRoleId, setAttachRoleId] = useState("");
  const [attachingRole, setAttachingRole] = useState(false);

  const [permissionRoleId, setPermissionRoleId] = useState("");
  const [permissionId, setPermissionId] = useState("");
  const [attachingPermission, setAttachingPermission] = useState(false);

  const {
    data: rows = initialData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: userActions.list,
    initialData: initialData.length > 0 ? initialData : undefined,
  });

  const updateRole = async (id: string, role: UserRole, roleIds?: number[]) => {
    try {
      await userActions.updateRole(id, role, roleIds);
    } catch {
      setMessageType("error");
      setMessage("Failed to update role");
      return;
    }

    setMessageType("success");
    setMessage("Role updated");
    await refetch();
  };

  const handleCreateUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
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
      });
      setMessageType("success");
      setMessage("User created successfully.");
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      await refetch();
    } catch {
      setMessageType("error");
      setMessage("Failed to create user.");
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
    } catch {
      setMessageType("error");
      setMessage("Failed to create role.");
    } finally {
      setCreatingRole(false);
    }
  };

  const handleAttachRole = async () => {
    const parsedRoleId = Number(attachRoleId);
    if (!attachUserId.trim() || !Number.isInteger(parsedRoleId) || parsedRoleId <= 0) {
      setMessageType("error");
      setMessage("Valid user ID and role ID are required.");
      return;
    }

    try {
      setAttachingRole(true);
      await userActions.attachRoleToUser(attachUserId.trim(), parsedRoleId);
      setMessageType("success");
      setMessage("Role attached to user successfully.");
      setAttachUserId("");
      setAttachRoleId("");
      await refetch();
    } catch {
      setMessageType("error");
      setMessage("Failed to attach role to user.");
    } finally {
      setAttachingRole(false);
    }
  };

  const handleAttachPermission = async () => {
    const parsedRoleId = Number(permissionRoleId);
    const parsedPermissionId = Number(permissionId);
    if (!Number.isInteger(parsedRoleId) || parsedRoleId <= 0 || !Number.isInteger(parsedPermissionId) || parsedPermissionId <= 0) {
      setMessageType("error");
      setMessage("Valid role ID and permission ID are required.");
      return;
    }

    try {
      setAttachingPermission(true);
      await userActions.attachPermissionToRole(parsedRoleId, parsedPermissionId);
      setMessageType("success");
      setMessage("Permission attached to role successfully.");
      setPermissionRoleId("");
      setPermissionId("");
    } catch {
      setMessageType("error");
      setMessage("Failed to attach permission to role.");
    } finally {
      setAttachingPermission(false);
    }
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(rows.length / USERS_PAGE_SIZE)),
    [rows.length],
  );

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * USERS_PAGE_SIZE;
    return rows.slice(start, start + USERS_PAGE_SIZE);
  }, [rows, page]);

  const roleOptions = useMemo(() => {
    const unique = new Set<UserRole>();
    rows.forEach((row) => {
      unique.add(row.role);
    });

    // Ensure current table rows always have their selected role represented.
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

  return (
    <Stack spacing={3}>
      {message ? <Alert severity={messageType} onClose={() => setMessage("")} sx={{ borderRadius: 1.5 }}>{message}</Alert> : null}
      <Card sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none", bgcolor: "background.paper" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="overline" sx={{ letterSpacing: "0.24em", color: "primary.main" }}>
                Access Management
              </Typography>
              <Typography variant="h6" sx={{ color: "text.primary" }}>
                Users, Roles, and Permissions
              </Typography>
            </Stack>

            <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
              <Stack spacing={1.2} sx={{ flex: 1 }}>
                <Typography variant="subtitle2">Create User</Typography>
                <TextField size="small" label="Name" value={newUserName} onChange={(event) => setNewUserName(event.target.value)} />
                <TextField size="small" label="Email" type="email" value={newUserEmail} onChange={(event) => setNewUserEmail(event.target.value)} />
                <TextField size="small" label="Password" type="password" value={newUserPassword} onChange={(event) => setNewUserPassword(event.target.value)} />
                <Button
                  variant="contained"
                  onClick={handleCreateUser}
                  disabled={creatingUser}
                  startIcon={creatingUser ? <CircularProgress size={14} color="inherit" /> : null}
                  sx={{ alignSelf: "flex-start" }}
                >
                  {creatingUser ? "Creating..." : "Create User"}
                </Button>
              </Stack>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", lg: "block" } }} />

              <Stack spacing={1.2} sx={{ flex: 1 }}>
                <Typography variant="subtitle2">Create Role</Typography>
                <TextField size="small" label="Role Name" value={roleName} onChange={(event) => setRoleName(event.target.value)} />
                <TextField size="small" label="Description (optional)" value={roleDescription} onChange={(event) => setRoleDescription(event.target.value)} />
                <Button
                  variant="outlined"
                  onClick={handleCreateRole}
                  disabled={creatingRole}
                  startIcon={creatingRole ? <CircularProgress size={14} color="inherit" /> : null}
                  sx={{ alignSelf: "flex-start" }}
                >
                  {creatingRole ? "Creating..." : "Create Role"}
                </Button>
              </Stack>
            </Stack>

            <Divider />

            <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
              <Stack spacing={1.2} sx={{ flex: 1 }}>
                <Typography variant="subtitle2">Attach Role to User</Typography>
                <TextField size="small" label="User ID" value={attachUserId} onChange={(event) => setAttachUserId(event.target.value)} />
                <TextField size="small" label="Role ID" type="number" value={attachRoleId} onChange={(event) => setAttachRoleId(event.target.value)} />
                <Button
                  variant="outlined"
                  onClick={handleAttachRole}
                  disabled={attachingRole}
                  startIcon={attachingRole ? <CircularProgress size={14} color="inherit" /> : null}
                  sx={{ alignSelf: "flex-start" }}
                >
                  {attachingRole ? "Attaching..." : "Attach Role"}
                </Button>
              </Stack>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", lg: "block" } }} />

              <Stack spacing={1.2} sx={{ flex: 1 }}>
                <Typography variant="subtitle2">Attach Permission to Role</Typography>
                <TextField size="small" label="Role ID" type="number" value={permissionRoleId} onChange={(event) => setPermissionRoleId(event.target.value)} />
                <TextField size="small" label="Permission ID" type="number" value={permissionId} onChange={(event) => setPermissionId(event.target.value)} />
                <Button
                  variant="outlined"
                  onClick={handleAttachPermission}
                  disabled={attachingPermission}
                  startIcon={attachingPermission ? <CircularProgress size={14} color="inherit" /> : null}
                  sx={{ alignSelf: "flex-start" }}
                >
                  {attachingPermission ? "Attaching..." : "Attach Permission"}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <Card sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none", bgcolor: "background.paper" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={0.5} sx={{ mb: 3 }}>
            <Typography variant="overline" sx={{ letterSpacing: "0.24em", color: "primary.main" }}>
              Users
            </Typography>
            <Typography variant="h6" sx={{ color: "text.primary" }}>
              {isLoading ? "Loading admin users..." : "Admin Users & Roles"}
            </Typography>
          </Stack>
          {isError ? (
            <Typography color="error.main" sx={{ py: 2 }}>
              Failed to load users.
            </Typography>
          ) : null}
          <UsersTable rows={paginatedRows} roleOptions={roleOptions} onRoleChange={updateRole} />
          {rows.length > USERS_PAGE_SIZE ? (
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Stack>
          ) : null}
      </CardContent>
      </Card>
    </Stack>
  );
};
