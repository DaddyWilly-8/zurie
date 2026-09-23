"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { authService } from "@/services/auth/auth.service";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [awaitingTwoFactor, setAwaitingTwoFactor] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goToNext = () => {
    const target =
      new URLSearchParams(window.location.search).get("next") ?? "/admin";
    router.push(target);
    router.refresh();
  };

  const onSubmitPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      const result = await authService.login(email, password);

      if (result.status === "two_factor_required") {
        setAwaitingTwoFactor(true);
        return;
      }

      goToNext();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      await authService.completeTwoFactorChallenge(code);
      goToNext();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "That code is invalid.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Admin Login
          </Typography>

          {awaitingTwoFactor ? (
            <Box component="form" onSubmit={onSubmitCode}>
              <Stack spacing={2}>
                <Typography color="text.secondary">
                  Enter the 6-digit code from your authenticator app, or one of
                  your recovery codes.
                </Typography>
                <TextField
                  label="Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoFocus
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : null
                  }
                >
                  {isSubmitting ? "Verifying..." : "Verify"}
                </Button>
                <Button
                  variant="text"
                  onClick={() => {
                    setAwaitingTwoFactor(false);
                    setCode("");
                    setError("");
                  }}
                >
                  Back to password
                </Button>
                {error ? <Alert severity="error">{error}</Alert> : null}
              </Stack>
            </Box>
          ) : (
            <Box component="form" onSubmit={onSubmitPassword}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : null
                  }
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Button>
                <Button
                  component={Link}
                  href="/admin/forgot-password"
                  variant="text"
                >
                  Forgot password?
                </Button>
                {error ? <Alert severity="error">{error}</Alert> : null}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
