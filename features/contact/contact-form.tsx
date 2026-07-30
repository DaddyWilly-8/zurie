"use client";

import { useState } from "react";
import { Alert, Button, Grid, Stack, TextField, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { apiFetch } from "@/lib/api-client";

export const ContactForm = () => {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name") ?? "",
      email: formData.get("email") ?? "",
      message: [
        formData.get("subject"),
        formData.get("phone")
          ? `Phone: ${String(formData.get("phone"))}`
          : null,
        String(formData.get("message") ?? ""),
      ]
        .filter(Boolean)
        .join("\n\n"),
    };

    const response = await apiFetch("/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setStatus(response.ok ? "success" : "error");
    if (response.ok) {
      event.currentTarget.reset();
    }
  };

  return (
    <Stack spacing={1.75} component="form" onSubmit={onSubmit}>
      <Typography
        sx={{
          fontFamily: "var(--font-playfair), serif",
          fontSize: { xs: "2rem", md: "2.15rem" },
          lineHeight: 1.1,
          mb: 0.2,
        }}
      >
        Send us a message
      </Typography>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            placeholder="Name *"
            name="name"
            required
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 0,
                backgroundColor: "#fff",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#efebe5",
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            placeholder="Email *"
            name="email"
            type="email"
            required
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 0,
                backgroundColor: "#fff",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#efebe5",
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            placeholder="Phone"
            name="phone"
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 0,
                backgroundColor: "#fff",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#efebe5",
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            placeholder="Subject"
            name="subject"
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 0,
                backgroundColor: "#fff",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#efebe5",
              },
            }}
          />
        </Grid>
      </Grid>
      <TextField
        placeholder="Your message *"
        name="message"
        required
        multiline
        minRows={4}
        fullWidth
        size="small"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 0,
            backgroundColor: "#fff",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#efebe5",
          },
        }}
      />
      <Button
        type="submit"
        variant="contained"
        endIcon={<FontAwesomeIcon icon={faPaperPlane} fontSize={11} />}
        sx={{
          alignSelf: "start",
          px: 2.4,
          minWidth: 130,
          borderRadius: 0,
          bgcolor: "#111",
          color: "#fff",
          fontSize: "0.62rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          py: 1,
          "&:hover": {
            bgcolor: "#000",
          },
        }}
      >
        Send Message
      </Button>
      {status === "success" ? (
        <Alert severity="success">Message sent successfully.</Alert>
      ) : null}
      {status === "error" ? (
        <Alert severity="error">Message failed. Please try again.</Alert>
      ) : null}
    </Stack>
  );
};
