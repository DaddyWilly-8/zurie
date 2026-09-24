"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useCustomerAuth } from "@/providers/customer-auth-provider";
import { ApiError } from "@/services/api/client";
import { GoogleButton } from "@/features/auth/google-button";

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useCustomerAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // CustomerAuthController::handleGoogleCallback() bounces back here with
  // ?error=google_failed when the OAuth round trip fails — surface it
  // instead of silently showing an empty login form.
  const [error, setError] = useState(
    searchParams.get("error") === "google_failed"
      ? "Google sign-in didn't complete. Please try again, or sign in with your email and password."
      : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push(searchParams.get("next") ?? "/account");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : "Login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={2.5}>
        <GoogleButton />
        <Divider>
          <Typography variant="caption" color="text.secondary">
            OR
          </Typography>
        </Divider>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          fullWidth
        />
        {error ? <Alert severity="error">{error}</Alert> : null}
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ fontWeight: 600 }}>
            Create one
          </Link>
        </Typography>
      </Stack>
    </Box>
  );
};
