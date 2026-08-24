"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPhone,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { customerActions } from "./customer-actions";
import type { AdminCustomerDetail } from "./types";

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
};

export const CustomerDetailDialog = ({
  customerId,
  onClose,
}: {
  customerId: string | null;
  onClose: () => void;
}) => {
  const [detail, setDetail] = useState<AdminCustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!customerId) return;

    let cancelled = false;
    setLoading(true);
    setDetail(null);

    customerActions
      .detail(customerId)
      .then((payload) => {
        if (!cancelled) setDetail(payload);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [customerId]);

  return (
    <Dialog
      open={Boolean(customerId)}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          border: "1px solid #e9e2d8",
          bgcolor: "background.paper",
        },
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h6" fontWeight={600}>
            Customer Details
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ border: "1px solid #e9e2d8", borderRadius: 1, p: 0.5 }}
          >
            <FontAwesomeIcon icon={faTimes} size="sm" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        {loading ? (
          <Typography
            color="text.secondary"
            sx={{ py: 4, textAlign: "center" }}
          >
            Loading customer details...
          </Typography>
        ) : detail ? (
          <Stack spacing={2.5}>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: "0.28em",
                  fontSize: "0.6rem",
                  color: "text.secondary",
                  fontWeight: 600,
                }}
              >
                Customer Name
              </Typography>
              <Typography variant="h5" fontWeight={600} sx={{ mt: 0.5 }}>
                {detail.name || "N/A"}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: "#e9e2d8" }} />

            <Box>
              <Typography
                variant="caption"
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: "0.28em",
                  fontSize: "0.6rem",
                  color: "text.secondary",
                  fontWeight: 600,
                  mb: 1.5,
                  display: "block",
                }}
              >
                Contact Information
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 20, color: "text.secondary" }}>
                    <FontAwesomeIcon icon={faPhone} size="sm" />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontSize: "0.6rem", color: "text.secondary" }}
                    >
                      Phone
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem" }}>
                      {detail.phone || "N/A"}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 20, color: "#25D366" }}>
                    <FontAwesomeIcon icon={faWhatsapp} size="sm" />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontSize: "0.6rem", color: "text.secondary" }}
                    >
                      WhatsApp
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem" }}>
                      {(detail.whatsappNumber as number) || "N/A"}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 20, color: "text.secondary" }}>
                    <FontAwesomeIcon icon={faEnvelope} size="sm" />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontSize: "0.6rem", color: "text.secondary" }}
                    >
                      Email
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem" }}>
                      {detail.email || "N/A"}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>

            <Divider sx={{ borderColor: "#e9e2d8" }} />

            <Box>
              <Typography
                variant="caption"
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: "0.28em",
                  fontSize: "0.6rem",
                  color: "text.secondary",
                  fontWeight: 600,
                  mb: 1.5,
                  display: "block",
                }}
              >
                Account Information
              </Typography>
              <Stack direction="row" spacing={2}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontSize: "0.6rem", color: "text.secondary" }}
                  >
                    Customer ID
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem" }}>
                    #{String(detail.id ?? "").padStart(6, "0")}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontSize: "0.6rem", color: "text.secondary" }}
                  >
                    Joined
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem" }}>
                    {formatDate(detail.createdAt)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        ) : (
          <Typography
            color="text.secondary"
            sx={{ py: 4, textAlign: "center" }}
          >
            No customer details available.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};
