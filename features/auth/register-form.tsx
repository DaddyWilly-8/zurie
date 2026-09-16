"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

type FormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirmation: string;
};

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  passwordConfirmation: "",
};

export const RegisterForm = () => {
  const router = useRouter();
  const { register } = useCustomerAuth();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField =
    (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    // Mirrors RegisterRequest's own rule (min:8, confirmed) so a mismatch
    // never round-trips to the server — the backend still re-validates
    // this itself, this is just to avoid a wasted request for the most
    // common typo.
    if (form.password !== form.passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await register(form);
      router.push("/account");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : "Registration failed. Please try again.",
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
          label="Full Name"
          value={form.name}
          onChange={setField("name")}
          required
          fullWidth
        />
        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={setField("email")}
          required
          fullWidth
        />
        <TextField
          label="Phone Number"
          value={form.phone}
          onChange={setField("phone")}
          required
          fullWidth
          helperText="Used for order updates and WhatsApp contact."
        />
        <TextField
          label="Password"
          type="password"
          value={form.password}
          onChange={setField("password")}
          required
          fullWidth
          helperText="At least 8 characters."
        />
        <TextField
          label="Confirm Password"
          type="password"
          value={form.passwordConfirmation}
          onChange={setField("passwordConfirmation")}
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
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Already have an account?{" "}
          <Link href="/login" style={{ fontWeight: 600 }}>
            Sign in
          </Link>
        </Typography>
      </Stack>
    </Box>
  );
};
