"use client";

import { useState } from "react";
import Link from "next/link";
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

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await authService.forgotPassword(email);
    } catch (error) {
      setLoading(false);
      setError(error instanceof Error ? error.message : "Unable to send reset link.");
      return;
    }

    setLoading(false);

    setMessage("Password reset link sent. Check your email inbox.");
  };

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Reset Admin Password
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Enter your admin email and we will send you a recovery link.
          </Typography>
          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Sending..." : "Send Recovery Link"}
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
