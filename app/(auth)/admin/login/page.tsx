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
  const [error, setError] = useState("");

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      await authService.login(email, password);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed.");
      return;
    }

    const target = new URLSearchParams(window.location.search).get("next") ?? "/admin";
    router.push(target);
    router.refresh();
  };

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Admin Login
          </Typography>
          <Box component="form" onSubmit={onSubmit}>
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
              <Button type="submit" variant="contained">
                Sign In
              </Button>
              <Button component={Link} href="/admin/forgot-password" variant="text">
                Forgot password?
              </Button>
              {error ? <Alert severity="error">{error}</Alert> : null}
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
