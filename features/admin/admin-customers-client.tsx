"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Pagination,
  Stack,
  Typography,
  Chip,
  Divider,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPhone,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import {
  customerActions,
  CustomersTable,
  type AdminCustomerDetail,
} from "@/features/admin/customers";

const CUSTOMERS_PAGE_SIZE = 10;

export const AdminCustomersClient = () => {
  const [detail, setDetail] = useState<AdminCustomerDetail | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info",
  );
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [page, setPage] = useState(1);

  const {
    data: rows = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: customerActions.list,
  });

  const viewDetail = async (id: string) => {
    setOpen(true);
    setLoadingDetail(true);
    setDetail(null);

    try {
      const payload = await customerActions.detail(id);
      setDetail(payload);
      if (!payload) {
        setMessage("Customer detail is unavailable.");
        setMessageType("info");
      }
    } catch {
      setMessage("Failed to load customer detail");
      setMessageType("error");
    } finally {
      setLoadingDetail(false);
    }
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(rows.length / CUSTOMERS_PAGE_SIZE)),
    [rows.length],
  );

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * CUSTOMERS_PAGE_SIZE;
    return rows.slice(start, start + CUSTOMERS_PAGE_SIZE);
  }, [rows, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Stack spacing={3}>
      {message ? (
        <Alert
          severity={messageType}
          onClose={() => setMessage("")}
          sx={{ borderRadius: 1.5 }}
        >
          {message}
        </Alert>
      ) : null}

      <Card
        sx={{
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
          bgcolor: "background.paper",
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2.5 }}
          >
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ color: "#171512" }}
            ></Typography>
            <Chip
              label={`${rows.length} customers`}
              size="small"
              sx={{ bgcolor: "#f0ebe3", color: "#171512", fontWeight: 500 }}
            />
          </Stack>

          {isLoading ? (
            <Typography
              color="text.secondary"
              sx={{ py: 4, textAlign: "center" }}
            >
              Loading customers...
            </Typography>
          ) : isError ? (
            <Typography color="error.main" sx={{ py: 2 }}>
              Failed to load customers.
            </Typography>
          ) : null}

          <CustomersTable rows={paginatedRows} onView={viewDetail} />

          {rows.length > CUSTOMERS_PAGE_SIZE ? (
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Stack>
          ) : null}
        </CardContent>
      </Card>

      {/* Customer Detail Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
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
              onClick={() => setOpen(false)}
              sx={{
                border: "1px solid #e9e2d8",
                borderRadius: 1,
                p: 0.5,
              }}
            >
              <FontAwesomeIcon icon={faTimes} size="sm" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {loadingDetail ? (
            <Typography
              color="text.secondary"
              sx={{ py: 4, textAlign: "center" }}
            >
              Loading customer details...
            </Typography>
          ) : detail ? (
            <Stack spacing={2.5}>
              {/* Customer Name */}
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

              {/* Customer Info Grid */}
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
                  {/* Phone */}
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

                  {/* WhatsApp */}
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

                  {/* Email */}
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

              {/* Customer ID & Created Date */}
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
    </Stack>
  );
};
