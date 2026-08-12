"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  Stack,
  TextField,
  Typography,
  Paper,
  Divider,
  InputAdornment,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faUser,
  faEnvelope,
  faPhone,
  faTag,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import { enquiryService } from "@/services/enquiries/enquiry.service";

export const ContactForm = () => {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setIsSubmitting(true);

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

    try {
      await enquiryService.createEnquiry({
        name: String(payload.name),
        email: String(payload.email),
        message: String(payload.message),
      });
      setStatus("success");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper
      sx={{
        p: { xs: 3, md: 4 },
        border: "1px solid #e9e2d8",
        borderRadius: 2,
        boxShadow: "none",
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={3} component="form" onSubmit={onSubmit}>
        <Box>
          <Typography
            sx={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: { xs: "1.8rem", md: "2.2rem" },
              lineHeight: 1.1,
              color: "#171512",
              mb: 0.5,
            }}
          >
            Send us a message
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.9rem",
            }}
          >
            We would love to hear from you. Fill in the form below and we will
            get back to you as soon as possible.
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "#e9e2d8" }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Your Name"
              placeholder="Enter your full name"
              name="name"
              required
              fullWidth
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FontAwesomeIcon
                      icon={faUser}
                      style={{ color: "#999", fontSize: 14 }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  bgcolor: "#f8f6f2",
                  "&:hover": {
                    bgcolor: "#f5f0ea",
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e9e2d8",
                },
                "& .MuiInputLabel-root": {
                  color: "#666",
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Email Address"
              placeholder="you@example.com"
              name="email"
              type="email"
              required
              fullWidth
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      style={{ color: "#999", fontSize: 14 }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  bgcolor: "#f8f6f2",
                  "&:hover": {
                    bgcolor: "#f5f0ea",
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e9e2d8",
                },
                "& .MuiInputLabel-root": {
                  color: "#666",
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Phone Number"
              placeholder="+255 123 456 789"
              name="phone"
              fullWidth
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FontAwesomeIcon
                      icon={faPhone}
                      style={{ color: "#999", fontSize: 14 }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  bgcolor: "#f8f6f2",
                  "&:hover": {
                    bgcolor: "#f5f0ea",
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e9e2d8",
                },
                "& .MuiInputLabel-root": {
                  color: "#666",
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Subject"
              placeholder="What is this about?"
              name="subject"
              fullWidth
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FontAwesomeIcon
                      icon={faTag}
                      style={{ color: "#999", fontSize: 14 }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  bgcolor: "#f8f6f2",
                  "&:hover": {
                    bgcolor: "#f5f0ea",
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e9e2d8",
                },
                "& .MuiInputLabel-root": {
                  color: "#666",
                },
              }}
            />
          </Grid>
        </Grid>

        <TextField
          label="Your Message"
          placeholder="Write your message here..."
          name="message"
          required
          multiline
          minRows={5}
          fullWidth
          size="medium"
          InputProps={{
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{ alignSelf: "flex-start", mt: 1.5 }}
              >
                <FontAwesomeIcon
                  icon={faMessage}
                  style={{ color: "#999", fontSize: 14 }}
                />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1,
              bgcolor: "#f8f6f2",
              "&:hover": {
                bgcolor: "#f5f0ea",
              },
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#e9e2d8",
            },
            "& .MuiInputLabel-root": {
              color: "#666",
            },
          }}
        />

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            endIcon={<FontAwesomeIcon icon={faPaperPlane} fontSize={12} />}
            sx={{
              px: 3.5,
              py: 1.2,
              minWidth: 160,
              borderRadius: 1,
              bgcolor: "#171512",
              color: "#ffffff",
              fontSize: "0.68rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#2d2a26",
                boxShadow: "none",
              },
              "&:disabled": {
                opacity: 0.6,
              },
            }}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.7rem",
              fontStyle: "italic",
            }}
          >
            We will respond within 24 hours
          </Typography>
        </Stack>

        {status === "success" && (
          <Alert
            severity="success"
            sx={{
              borderRadius: 1,
              border: "1px solid #e8f5e9",
              bgcolor: "#f1f8f4",
            }}
          >
            <Typography variant="body2" fontWeight={500}>
              Message sent successfully! 🎉
            </Typography>
            <Typography variant="caption" color="text.secondary">
              We will get back to you as soon as possible.
            </Typography>
          </Alert>
        )}

        {status === "error" && (
          <Alert
            severity="error"
            sx={{
              borderRadius: 1,
              border: "1px solid #ffebee",
              bgcolor: "#fef4f4",
            }}
          >
            <Typography variant="body2" fontWeight={500}>
              Failed to send message.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Please try again or contact us directly via WhatsApp.
            </Typography>
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};
