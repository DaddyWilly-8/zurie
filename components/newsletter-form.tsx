"use client";

import { useState } from "react";
import { Alert, Button, Stack, TextField } from "@mui/material";
import { apiFetch } from "@/lib/api-client";

type NewsletterFormProps = {
  compact?: boolean;
};

export const NewsletterForm = ({ compact = false }: NewsletterFormProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("idle");

    const response = await apiFetch("/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      setEmail("");
      setStatus("success");
    } else {
      setStatus("error");
    }
  };

  return (
    <Stack component="form" spacing={1.6} onSubmit={handleSubmit}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.25}>
        <TextField
          label="Email address"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          fullWidth
          size={compact ? "small" : "medium"}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={compact ? { minWidth: 150 } : undefined}
        >
          Subscribe
        </Button>
      </Stack>
      {status === "success" ? (
        <Alert severity="success">You have been subscribed.</Alert>
      ) : null}
      {status === "error" ? (
        <Alert severity="error">Subscription failed. Please retry.</Alert>
      ) : null}
    </Stack>
  );
};
