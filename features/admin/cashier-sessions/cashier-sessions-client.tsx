"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AdminFeedbackSnackbar } from "@/components/admin";
import { ApiError } from "@/services/api/client";
import { outletService } from "@/services/outlets/outlet.service";
import { cashierSessionActions } from "./cashier-session-actions";
import { CashierSessionsTable } from "./cashier-sessions-table";
import { OpenSessionDialog } from "./open-session-dialog";
import { CloseSessionDialog } from "./close-session-dialog";

const PAGE_SIZE = 20;

export const AdminCashierSessionsClient = () => {
  const [outletId, setOutletId] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [closeDialog, setCloseDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: outlets = [] } = useQuery({
    queryKey: ["admin-outlets"],
    queryFn: outletService.list,
  });

  const {
    data: currentSession,
    isLoading: currentLoading,
    refetch: refetchCurrent,
  } = useQuery({
    queryKey: ["cashier-session-current", outletId],
    queryFn: () => cashierSessionActions.current(Number(outletId)),
    enabled: outletId !== "",
    retry: false,
  });

  const { data: history, refetch: refetchHistory } = useQuery({
    queryKey: ["admin-cashier-sessions", page],
    queryFn: () => cashierSessionActions.list(page, PAGE_SIZE),
  });

  const items = history?.data ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil((history?.meta.count ?? 0) / PAGE_SIZE),
  );

  const selectedOutlet = outlets.find((o) => o.id === outletId);

  const handleOpen = async (openingBalance: number) => {
    if (outletId === "") return;
    setSaving(true);
    try {
      await cashierSessionActions.open(Number(outletId), openingBalance);
      setMessage("Session opened");
      setMessageType("success");
      setOpenDialog(false);
      await Promise.all([refetchCurrent(), refetchHistory()]);
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.message : "Failed to open session",
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async (closingBalance: number) => {
    if (!currentSession) return;
    setSaving(true);
    try {
      await cashierSessionActions.close(currentSession.id, closingBalance);
      setMessage("Session closed");
      setMessageType("success");
      setCloseDialog(false);
      await Promise.all([refetchCurrent(), refetchHistory()]);
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.message : "Failed to close session",
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3.2}>
      <AdminFeedbackSnackbar
        open={Boolean(message)}
        message={message}
        severity={messageType}
        onClose={() => setMessage("")}
      />
      <Typography sx={{ fontSize: { xs: "2rem", md: "2.2rem" } }}>
        Cashier Sessions
      </Typography>

      <Card variant="outlined" sx={{ borderRadius: 0 }}>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              select
              label="Outlet"
              value={outletId}
              onChange={(event) =>
                setOutletId(
                  event.target.value === "" ? "" : Number(event.target.value),
                )
              }
              sx={{ maxWidth: 320 }}
            >
              {outlets.map((outlet) => (
                <MenuItem key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </MenuItem>
              ))}
            </TextField>

            {outletId === "" ? null : currentLoading ? (
              <Typography color="text.secondary">Checking...</Typography>
            ) : currentSession ? (
              <Alert
                severity="info"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => setCloseDialog(true)}
                  >
                    Close Session
                  </Button>
                }
              >
                Open since {new Date(currentSession.openedAt).toLocaleString()}{" "}
                — opening balance{" "}
                {currentSession.openingBalance.toLocaleString()}
              </Alert>
            ) : (
              <Box>
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  No open session for this outlet.
                </Typography>
                <Button variant="contained" onClick={() => setOpenDialog(true)}>
                  Open Session
                </Button>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="h6">History</Typography>
      <CashierSessionsTable items={items} />
      {totalPages > 1 ? (
        <Stack direction="row" justifyContent="flex-end">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Stack>
      ) : null}

      <OpenSessionDialog
        open={openDialog}
        saving={saving}
        outletName={selectedOutlet?.name ?? ""}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleOpen}
      />
      <CloseSessionDialog
        open={closeDialog}
        saving={saving}
        session={currentSession ?? null}
        onClose={() => setCloseDialog(false)}
        onSubmit={handleClose}
      />
    </Stack>
  );
};
