"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ApiError } from "@/services/api/client";
import { customerAuthService } from "@/services/auth/customer-auth.service";

/**
 * Customer "forgot password": the backend emails a link to
 * /reset-password (never says whether the address has an account).
 */
export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await customerAuthService.forgotPassword(email.trim());
      setSent(true);
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <Stack spacing={2}>
        <Alert severity="success">
          If an account exists for {email.trim()}, we&apos;ve emailed a link to
          reset your password. It expires in 60 minutes.
        </Alert>
        <Typography variant="body2" textAlign="center">
          <Link href="/login" style={{ fontWeight: 600 }}>
            Back to sign in
          </Link>
        </Typography>
      </Stack>
    );
  }

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={2.5}>
        <Typography color="text.secondary">
          Enter the email you signed up with and we&apos;ll send you a reset
          link.
        </Typography>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          fullWidth
        />
        {error ? <Alert severity="error">{error}</Alert> : null}
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={submitting}
          startIcon={
            submitting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {submitting ? "Sending..." : "Send reset link"}
        </Button>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Remembered it?{" "}
          <Link href="/login" style={{ fontWeight: 600 }}>
            Sign in
          </Link>
        </Typography>
      </Stack>
    </Box>
  );
};
