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
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import {
  customerActions,
  CustomersTable,
  type AdminCustomerDetail,
  type AdminCustomerRow,
} from "@/features/admin/customers";

const CUSTOMERS_PAGE_SIZE = 10;

export const AdminCustomersClient = () => {
  const [detail, setDetail] = useState<AdminCustomerDetail | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
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

  return (
    <Stack spacing={3}>
      {message ? (
        <Alert severity={messageType} onClose={() => setMessage("")} sx={{ borderRadius: 1.5 }}>
          {message}
        </Alert>
      ) : null}

      <Card sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none", bgcolor: "background.paper" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={0.5} sx={{ mb: 3 }}>
            <Typography variant="overline" sx={{ letterSpacing: "0.24em", color: "primary.main" }}>
              Customers
            </Typography>
            <Typography variant="h6" sx={{ color: "text.primary" }}>
              {isLoading ? "Loading customer records..." : "Customer Records"}
            </Typography>
          </Stack>

          {isError ? (
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

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">Customer Detail</Typography>
          <IconButton size="small" onClick={() => setOpen(false)}>
            <FontAwesomeIcon icon={faTimes} size="sm" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {loadingDetail ? (
            <Typography color="text.secondary">Loading detail...</Typography>
          ) : detail ? (
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2,
                bgcolor: "background.default",
                border: "1px solid",
                borderColor: "divider",
                overflowX: "auto",
                fontSize: "0.8rem",
              }}
            >
              {JSON.stringify(detail, null, 2)}
            </Box>
          ) : (
            <Typography color="text.secondary">No detail available.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
};
