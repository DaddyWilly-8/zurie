"use client";

import { Alert, Snackbar } from "@mui/material";

type AdminFeedbackSnackbarProps = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
  onClose: () => void;
};

export const AdminFeedbackSnackbar = ({
  open,
  message,
  severity,
  onClose,
}: AdminFeedbackSnackbarProps) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3500}
      onClose={(_, reason) => {
        if (reason === "clickaway") return;
        onClose();
      }}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};