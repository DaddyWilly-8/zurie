"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Pagination,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import { customerActions } from "./customer-actions";
import { CustomersTable } from "./customers-table";
import { CustomerDetailDialog } from "./customer-detail-dialog";

const CUSTOMERS_PAGE_SIZE = 10;

export const AdminCustomersClient = () => {
  const [viewCustomerId, setViewCustomerId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info",
  );
  const [page, setPage] = useState(1);

  const {
    data: rows = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: customerActions.list,
  });

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

          <CustomersTable rows={paginatedRows} onView={setViewCustomerId} />

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

      <CustomerDetailDialog
        customerId={viewCustomerId}
        onClose={() => setViewCustomerId(null)}
      />
    </Stack>
  );
};
