"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { toDataURL } from "qrcode";
import { AdminFeedbackSnackbar } from "@/components/admin";
import { authService } from "@/services/auth/auth.service";
import { ApiError } from "@/services/api/client";

type Step = "idle" | "scanning" | "confirming" | "recovery-codes";

/**
 * Self-service TOTP 2FA management for the currently logged-in admin
 * account (backend: Modules/Auth/Controllers/TwoFactorController — no
 * permission gate, every account manages its own). Not yet mandated for
 * any role — this page is how a staff account opts in.
 */
export const AdminAccountSecurityClient = () => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("idle");
  const [secret, setSecret] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [savedAcknowledged, setSavedAcknowledged] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );

  const status = useQuery({
    queryKey: ["admin-two-factor-status"],
    queryFn: () => authService.twoFactorStatus(),
  });

  const startEnable = async () => {
    setBusy(true);
    try {
      const result = await authService.enableTwoFactor();
      setSecret(result.secret);
      // Generated entirely client-side from the otpauth:// URI — the
      // secret never leaves the browser via a third-party QR-rendering
      // service, which would otherwise leak it over the network.
      setQrDataUrl(await toDataURL(result.qrCodeUrl));
      setStep("scanning");
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.message : "Failed to start setup",
      );
      setMessageType("error");
    } finally {
      setBusy(false);
    }
  };

  const confirmCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await authService.confirmTwoFactor(code);
      setRecoveryCodes(result.recoveryCodes);
      setStep("recovery-codes");
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.message : "That code is invalid",
      );
      setMessageType("error");
    } finally {
      setBusy(false);
    }
  };

  const finish = () => {
    setStep("idle");
    setCode("");
    setSavedAcknowledged(false);
    setMessage("Two-factor authentication is now active on your account.");
    setMessageType("success");
    void queryClient.invalidateQueries({
      queryKey: ["admin-two-factor-status"],
    });
  };

  const disable = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await authService.disableTwoFactor(disablePassword);
      setDisableDialogOpen(false);
      setDisablePassword("");
      setMessage("Two-factor authentication has been disabled.");
      setMessageType("success");
      void queryClient.invalidateQueries({
        queryKey: ["admin-two-factor-status"],
      });
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.message : "Incorrect password",
      );
      setMessageType("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={3.2} sx={{ maxWidth: 560 }}>
      <AdminFeedbackSnackbar
        open={Boolean(message)}
        message={message}
        severity={messageType}
        onClose={() => setMessage("")}
      />

      <Stack spacing={0.3}>
        <Typography sx={{ fontSize: { xs: "2rem", md: "2.2rem" } }}>
          Security
        </Typography>
        <Typography color="text.secondary">
          Manage two-factor authentication for your own account.
        </Typography>
      </Stack>

      <Card variant="outlined">
        <CardContent>
          {status.isLoading ? (
            <Typography color="text.secondary">Loading...</Typography>
          ) : step === "idle" ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography>Two-factor authentication</Typography>
                <Chip
                  size="small"
                  color={status.data?.enabled ? "success" : "default"}
                  label={status.data?.enabled ? "Enabled" : "Disabled"}
                />
              </Stack>
              <Typography color="text.secondary">
                Adds a 6-digit code from an authenticator app (Google
                Authenticator, Authy, 1Password, etc.) on top of your password
                when signing in.
              </Typography>
              {status.data?.enabled ? (
                <Button
                  color="error"
                  variant="outlined"
                  sx={{ alignSelf: "flex-start" }}
                  onClick={() => setDisableDialogOpen(true)}
                >
                  Disable
                </Button>
              ) : (
                <Button
                  variant="contained"
                  sx={{ alignSelf: "flex-start" }}
                  disabled={busy}
                  onClick={startEnable}
                  startIcon={
                    busy ? <CircularProgress size={16} color="inherit" /> : null
                  }
                >
                  Enable two-factor authentication
                </Button>
              )}
            </Stack>
          ) : step === "scanning" ? (
            <Stack spacing={2}>
              <Typography>
                Scan this QR code with your authenticator app, then enter the
                6-digit code it shows.
              </Typography>
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="Two-factor setup QR code"
                  width={220}
                  height={220}
                />
              ) : null}
              <Typography variant="caption" color="text.secondary">
                Can&apos;t scan? Enter this code manually: {secret}
              </Typography>
              <Box component="form" onSubmit={confirmCode}>
                <Stack spacing={1.5}>
                  <TextField
                    label="6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    autoFocus
                    required
                  />
                  <Stack direction="row" spacing={1.5}>
                    <Button type="submit" variant="contained" disabled={busy}>
                      {busy ? "Verifying..." : "Verify & Activate"}
                    </Button>
                    <Button variant="text" onClick={() => setStep("idle")}>
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          ) : step === "recovery-codes" ? (
            <Stack spacing={2}>
              <Alert severity="warning">
                Save these recovery codes somewhere safe. Each one can be used
                once to sign in if you lose access to your authenticator app —
                they will never be shown again.
              </Alert>
              <Stack
                sx={{
                  fontFamily: "monospace",
                  bgcolor: "action.hover",
                  p: 2,
                  borderRadius: 1,
                }}
                spacing={0.5}
              >
                {recoveryCodes.map((rc) => (
                  <Typography key={rc} component="span">
                    {rc}
                  </Typography>
                ))}
              </Stack>
              <Button
                variant="outlined"
                sx={{ alignSelf: "flex-start" }}
                onClick={() =>
                  void navigator.clipboard.writeText(recoveryCodes.join("\n"))
                }
              >
                Copy all
              </Button>
              <label>
                <input
                  type="checkbox"
                  checked={savedAcknowledged}
                  onChange={(e) => setSavedAcknowledged(e.target.checked)}
                />{" "}
                I&apos;ve saved these recovery codes
              </label>
              <Button
                variant="contained"
                disabled={!savedAcknowledged}
                sx={{ alignSelf: "flex-start" }}
                onClick={finish}
              >
                Done
              </Button>
            </Stack>
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        open={disableDialogOpen}
        onClose={() => setDisableDialogOpen(false)}
      >
        <Box component="form" onSubmit={disable}>
          <DialogTitle>Disable two-factor authentication</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography color="text.secondary">
                Enter your password to confirm.
              </Typography>
              <TextField
                label="Password"
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                autoFocus
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDisableDialogOpen(false)}>Cancel</Button>
            <Button type="submit" color="error" disabled={busy}>
              {busy ? "Disabling..." : "Disable"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
};
