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
  useTheme,
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
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

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

  // Dynamic styles based on dark mode
  const getBorderColor = () =>
    isDarkMode ? "rgba(255,255,255,0.12)" : "#e9e2d8";
  const getBackgroundColor = () =>
    isDarkMode ? "rgba(255,255,255,0.05)" : "#f8f6f2";
  const getHoverBackgroundColor = () =>
    isDarkMode ? "rgba(255,255,255,0.08)" : "#f5f0ea";
  const getTextColor = () => (isDarkMode ? "rgba(255,255,255,0.7)" : "#666");
  const getIconColor = () => (isDarkMode ? "rgba(255,255,255,0.4)" : "#999");
  const getPaperBackground = () =>
    isDarkMode ? "rgba(255,255,255,0.03)" : "background.paper";

  return (
    <Paper
      sx={{
        p: { xs: 3, md: 4 },
        border: `1px solid ${getBorderColor()}`,
        borderRadius: 2,
        boxShadow: "none",
        bgcolor: getPaperBackground(),
        transition: "all 0.3s ease",
      }}
    >
      <Stack spacing={3} component="form" onSubmit={onSubmit}>
        <Box>
          <Typography
            sx={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: { xs: "1.8rem", md: "2.2rem" },
              lineHeight: 1.1,
              color: isDarkMode ? "#ffffff" : "#171512",
              mb: 0.5,
              transition: "color 0.3s ease",
            }}
          >
            Send us a message
          </Typography>
          <Typography
            sx={{
              color: isDarkMode ? "rgba(255,255,255,0.6)" : "text.secondary",
              fontSize: "0.9rem",
              transition: "color 0.3s ease",
            }}
          >
            We would love to hear from you. Fill in the form below and we will
            get back to you as soon as possible.
          </Typography>
        </Box>

        <Divider sx={{ borderColor: getBorderColor() }} />

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
                      style={{ color: getIconColor(), fontSize: 14 }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  bgcolor: getBackgroundColor(),
                  "&:hover": {
                    bgcolor: getHoverBackgroundColor(),
                  },
                  "&.Mui-focused": {
                    bgcolor: getBackgroundColor(),
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: getBorderColor(),
                },
                "& .MuiInputLabel-root": {
                  color: getTextColor(),
                },
                "& .MuiInputBase-input": {
                  color: isDarkMode ? "#ffffff" : "inherit",
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
                      style={{ color: getIconColor(), fontSize: 14 }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  bgcolor: getBackgroundColor(),
                  "&:hover": {
                    bgcolor: getHoverBackgroundColor(),
                  },
                  "&.Mui-focused": {
                    bgcolor: getBackgroundColor(),
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: getBorderColor(),
                },
                "& .MuiInputLabel-root": {
                  color: getTextColor(),
                },
                "& .MuiInputBase-input": {
                  color: isDarkMode ? "#ffffff" : "inherit",
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
                      style={{ color: getIconColor(), fontSize: 14 }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  bgcolor: getBackgroundColor(),
                  "&:hover": {
                    bgcolor: getHoverBackgroundColor(),
                  },
                  "&.Mui-focused": {
                    bgcolor: getBackgroundColor(),
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: getBorderColor(),
                },
                "& .MuiInputLabel-root": {
                  color: getTextColor(),
                },
                "& .MuiInputBase-input": {
                  color: isDarkMode ? "#ffffff" : "inherit",
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
                      style={{ color: getIconColor(), fontSize: 14 }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  bgcolor: getBackgroundColor(),
                  "&:hover": {
                    bgcolor: getHoverBackgroundColor(),
                  },
                  "&.Mui-focused": {
                    bgcolor: getBackgroundColor(),
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: getBorderColor(),
                },
                "& .MuiInputLabel-root": {
                  color: getTextColor(),
                },
                "& .MuiInputBase-input": {
                  color: isDarkMode ? "#ffffff" : "inherit",
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
                  style={{ color: getIconColor(), fontSize: 14 }}
                />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1,
              bgcolor: getBackgroundColor(),
              "&:hover": {
                bgcolor: getHoverBackgroundColor(),
              },
              "&.Mui-focused": {
                bgcolor: getBackgroundColor(),
              },
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: getBorderColor(),
            },
            "& .MuiInputLabel-root": {
              color: getTextColor(),
            },
            "& .MuiInputBase-input": {
              color: isDarkMode ? "#ffffff" : "inherit",
            },
            "& .MuiInputBase-inputMultiline": {
              color: isDarkMode ? "#ffffff" : "inherit",
            },
          }}
        />

        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
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
              bgcolor: isDarkMode ? "#ffffff" : "#171512",
              color: isDarkMode ? "#171512" : "#ffffff",
              fontSize: "0.68rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              boxShadow: "none",
              "&:hover": {
                bgcolor: isDarkMode ? "rgba(255,255,255,0.9)" : "#2d2a26",
                boxShadow: "none",
              },
              "&:disabled": {
                opacity: 0.6,
                bgcolor: isDarkMode ? "rgba(255,255,255,0.3)" : "#171512",
                color: isDarkMode ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.6)",
              },
            }}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
          <Typography
            sx={{
              color: isDarkMode ? "rgba(255,255,255,0.5)" : "text.secondary",
              fontSize: "0.7rem",
              fontStyle: "italic",
              transition: "color 0.3s ease",
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
              border: `1px solid ${isDarkMode ? "rgba(46,125,50,0.3)" : "#e8f5e9"}`,
              bgcolor: isDarkMode ? "rgba(46,125,50,0.15)" : "#f1f8f4",
              color: isDarkMode ? "#a5d6a7" : "inherit",
            }}
          >
            <Typography variant="body2" fontWeight={500}>
              Message sent successfully! 🎉
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isDarkMode ? "rgba(165,214,167,0.8)" : "text.secondary",
              }}
            >
              We will get back to you as soon as possible.
            </Typography>
          </Alert>
        )}

        {status === "error" && (
          <Alert
            severity="error"
            sx={{
              borderRadius: 1,
              border: `1px solid ${isDarkMode ? "rgba(211,47,47,0.3)" : "#ffebee"}`,
              bgcolor: isDarkMode ? "rgba(211,47,47,0.15)" : "#fef4f4",
              color: isDarkMode ? "#ef9a9a" : "inherit",
            }}
          >
            <Typography variant="body2" fontWeight={500}>
              Failed to send message.
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isDarkMode ? "rgba(239,154,154,0.8)" : "text.secondary",
              }}
            >
              Please try again or contact us directly via WhatsApp.
            </Typography>
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};
