"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { authService } from "@/services/auth/auth.service";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? "";
  const email = searchParams?.get("email") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const ready = useMemo(() => Boolean(token && email), [token, email]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token || !email) {
      setError("Missing reset token or email.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        token,
        email,
        password,
        passwordConfirmation: confirmPassword,
      });
    } catch (error) {
      setLoading(false);
      setError(error instanceof Error ? error.message : "Failed to reset password");
      return;
    }

    setLoading(false);
    setMessage("Password updated successfully. You can now sign in.");
  };

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Set New Password
          </Typography>

          {!ready ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Open this page using the recovery link from your email.
            </Alert>
          ) : null}

          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField label="Email" value={email} disabled />
              <TextField label="Reset Token" value={token} disabled />
              <TextField
                label="New Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <TextField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
              <Button type="submit" variant="contained" disabled={!ready || loading}>
                {loading ? "Saving..." : "Update Password"}
              </Button>
              <Button component={Link} href="/admin/login" variant="text">
                Back to login
              </Button>
              {message ? <Alert severity="success">{message}</Alert> : null}
              {error ? <Alert severity="error">{error}</Alert> : null}
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}