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
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
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
// Import WhatsApp from brands package
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { enquiryService } from "@/services/enquiries/enquiry.service";
import { SITE } from "@/constants/site";
import {
  buildWhatsAppCheckoutLink,
  buildWhatsAppOrderMessage,
} from "@/utils/whatsapp";

type ContactMethod = "whatsapp" | "email" | "phone";

export const ContactForm = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactMethod, setContactMethod] = useState<ContactMethod>("whatsapp");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info"
  >("info");

  // Form fields for contact methods
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleContactMethodChange = (
    _: React.MouseEvent<HTMLElement>,
    newMethod: ContactMethod | null,
  ) => {
    if (newMethod !== null) {
      setContactMethod(newMethod);
    }
  };

  const showSnackbarMessage = (
    message: string,
    severity: "success" | "error" | "info",
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
  };

  const validateForm = () => {
    if (!customerName.trim()) {
      showSnackbarMessage("Please enter your name", "error");
      return false;
    }

    if (contactMethod === "whatsapp") {
      if (!customerPhone.trim()) {
        showSnackbarMessage("Please enter your WhatsApp number", "error");
        return false;
      }
      const phoneDigits = customerPhone.replace(/\D/g, "");
      if (phoneDigits.length < 10) {
        showSnackbarMessage(
          "Please enter a valid phone number (at least 10 digits)",
          "error",
        );
        return false;
      }
    }

    if (contactMethod === "email") {
      if (!customerEmail.trim()) {
        showSnackbarMessage("Please enter your email address", "error");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        showSnackbarMessage("Please enter a valid email address", "error");
        return false;
      }
    }

    if (contactMethod === "phone") {
      if (!customerPhone.trim()) {
        showSnackbarMessage("Please enter your phone number", "error");
        return false;
      }
      const phoneDigits = customerPhone.replace(/\D/g, "");
      if (phoneDigits.length < 10) {
        showSnackbarMessage(
          "Please enter a valid phone number (at least 10 digits)",
          "error",
        );
        return false;
      }
    }

    if (!message.trim()) {
      showSnackbarMessage("Please enter your message", "error");
      return false;
    }

    return true;
  };

  const handleWhatsAppSubmit = () => {
    if (!validateForm()) return;

    const enquiryMessage = [
      `Name: ${customerName.trim()}`,
      customerPhone ? `Phone: ${customerPhone.trim()}` : null,
      customerEmail ? `Email: ${customerEmail.trim()}` : null,
      subject ? `Subject: ${subject.trim()}` : null,
      "",
      `Message: ${message.trim()}`,
      "",
      "---",
      "This enquiry was sent from the Zuriè website.",
    ]
      .filter(Boolean)
      .join("\n");

    const checkoutLink = buildWhatsAppCheckoutLink(
      SITE.whatsappNumber,
      enquiryMessage,
    );

    window.open(checkoutLink, "_blank", "noopener,noreferrer");
    setStatus("success");
  };

  const handleEmailSubmit = async () => {
    if (!validateForm()) return;

    // Send via email
    const subjectLine = subject
      ? `Zuriè Enquiry: ${subject.trim()}`
      : "Zuriè Website Enquiry";
    const body = [
      `Name: ${customerName.trim()}`,
      customerPhone ? `Phone: ${customerPhone.trim()}` : null,
      customerEmail ? `Email: ${customerEmail.trim()}` : null,
      "",
      `Message: ${message.trim()}`,
      "",
      "---",
      "This enquiry was sent from the Zuriè website.",
    ]
      .filter(Boolean)
      .join("\n");

    const mailtoLink = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, "_blank");

    // Also save to backend
    try {
      await enquiryService.createEnquiry({
        name: customerName.trim(),
        email: customerEmail.trim() || "no-email@provided.com",
        message: body,
      });
      setStatus("success");
    } catch {
      // Email was already opened, but backend save failed
      showSnackbarMessage(
        "Email opened, but failed to save to our system. Please follow up if needed.",
        "info",
      );
    }
  };

  const handlePhoneSubmit = () => {
    if (!validateForm()) return;

    const enquiryMessage = [
      `Name: ${customerName.trim()}`,
      customerPhone ? `Phone: ${customerPhone.trim()}` : null,
      customerEmail ? `Email: ${customerEmail.trim()}` : null,
      subject ? `Subject: ${subject.trim()}` : null,
      "",
      `Message: ${message.trim()}`,
      "",
      "---",
      "This enquiry was sent from the Zuriè website.",
    ]
      .filter(Boolean)
      .join("\n");

    const storePhone = SITE.contactPhone.replace(/\D/g, "");
    const smsLink = `sms:${storePhone}?body=${encodeURIComponent(enquiryMessage)}`;
    window.open(smsLink, "_blank");
    setStatus("success");
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setIsSubmitting(true);

    // Validate form
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    // Handle based on contact method
    switch (contactMethod) {
      case "whatsapp":
        handleWhatsAppSubmit();
        break;
      case "email":
        await handleEmailSubmit();
        break;
      case "phone":
        handlePhoneSubmit();
        break;
    }

    // Reset form after successful submission
    if (status === "success") {
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setSubject("");
      setMessage("");
    }

    setIsSubmitting(false);
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
    <>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

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
              We would love to hear from you. Fill in the form below and choose
              your preferred contact method.
            </Typography>
          </Box>

          <Divider sx={{ borderColor: getBorderColor() }} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Your Name *"
                placeholder="Enter your full name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
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
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                type="email"
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
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
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
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
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
            label="Your Message *"
            placeholder="Write your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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

          {/* Contact Method Selection */}
          <Box>
            <Typography
              sx={{
                fontSize: "0.7rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: isDarkMode ? "rgba(255,255,255,0.5)" : "text.secondary",
                mb: 1.5,
              }}
            >
              Contact Method *
            </Typography>
            <ToggleButtonGroup
              value={contactMethod}
              exclusive
              onChange={handleContactMethodChange}
              aria-label="contact method"
              sx={{
                width: "100%",
                "& .MuiToggleButtonGroup-grouped": {
                  flex: 1,
                  borderRadius: 1,
                  borderColor: getBorderColor(),
                  py: 1.2,
                  px: 1,
                  color: isDarkMode ? "rgba(255,255,255,0.7)" : "#171512",
                  "&.Mui-selected": {
                    bgcolor: isDarkMode ? "#ffffff" : "#171512",
                    color: isDarkMode ? "#171512" : "#ffffff",
                    "&:hover": {
                      bgcolor: isDarkMode ? "rgba(255,255,255,0.9)" : "#2d2a26",
                    },
                  },
                  "&:not(.Mui-selected)": {
                    bgcolor: isDarkMode
                      ? "rgba(255,255,255,0.03)"
                      : "background.paper",
                    "&:hover": {
                      bgcolor: isDarkMode
                        ? "rgba(255,255,255,0.06)"
                        : "#f8f6f2",
                    },
                  },
                },
              }}
            >
              <ToggleButton value="whatsapp" aria-label="WhatsApp">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FontAwesomeIcon
                    icon={faWhatsapp}
                    style={{ fontSize: 20, color: "#25D366" }}
                  />
                  <Typography variant="body2" fontWeight={500}>
                    WhatsApp
                  </Typography>
                </Stack>
              </ToggleButton>
              <ToggleButton value="email" aria-label="Email">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 20 }} />
                  <Typography variant="body2" fontWeight={500}>
                    Email
                  </Typography>
                </Stack>
              </ToggleButton>
              <ToggleButton value="phone" aria-label="Phone">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FontAwesomeIcon icon={faPhone} style={{ fontSize: 20 }} />
                  <Typography variant="body2" fontWeight={500}>
                    Phone
                  </Typography>
                </Stack>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Helper Text */}
          <Typography
            sx={{
              fontSize: "0.7rem",
              color: isDarkMode ? "rgba(255,255,255,0.4)" : "text.secondary",
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            {contactMethod === "whatsapp" &&
              "We'll contact you via WhatsApp to respond to your enquiry"}
            {contactMethod === "email" &&
              "We'll send our response to your email address"}
            {contactMethod === "phone" &&
              "We'll call or SMS you to respond to your enquiry"}
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >
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
                  color: isDarkMode
                    ? "rgba(0,0,0,0.3)"
                    : "rgba(255,255,255,0.6)",
                },
              }}
            >
              {isSubmitting
                ? "Sending..."
                : `Send via ${contactMethod === "whatsapp" ? "WhatsApp" : contactMethod === "email" ? "Email" : "SMS"}`}
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
                  color: isDarkMode
                    ? "rgba(165,214,167,0.8)"
                    : "text.secondary",
                }}
              >
                We will get back to you via{" "}
                {contactMethod === "whatsapp"
                  ? "WhatsApp"
                  : contactMethod === "email"
                    ? "email"
                    : "phone"}{" "}
                as soon as possible.
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
                  color: isDarkMode
                    ? "rgba(239,154,154,0.8)"
                    : "text.secondary",
                }}
              >
                Please try again or contact us directly via WhatsApp.
              </Typography>
            </Alert>
          )}
        </Stack>
      </Paper>
    </>
  );
};
