"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  IconButton,
  Pagination,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { AdminFeedbackSnackbar } from "@/components/admin";
import { ApiError } from "@/services/api/client";
import {
  financeService,
  flattenLedgers,
} from "@/services/finance/finance.service";
import { paymentActions } from "./payment-actions";
import { PaymentsTable } from "./payments-table";
import { PaymentFormDialog } from "./payment-form-dialog";
import { emptyPaymentForm } from "./types";
import type { Payment, PaymentForm } from "./types";

const PAGE_SIZE = 20;

export const AdminPaymentsClient = () => {
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PaymentForm>(emptyPaymentForm);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-payments", page],
    queryFn: () => paymentActions.list(page, PAGE_SIZE),
  });

  const { data: chartOfAccounts = [] } = useQuery({
    queryKey: ["admin-chart-of-accounts"],
    queryFn: financeService.chartOfAccounts,
  });
  const ledgers = flattenLedgers(chartOfAccounts);

  const items = data?.data ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.meta.count ?? 0) / PAGE_SIZE),
  );

  const openNew = () => {
    setForm(emptyPaymentForm);
    setOpen(true);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await paymentActions.create(form);
      setMessage("Payment recorded");
      setMessageType("success");
      setOpen(false);
      setForm(emptyPaymentForm);
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.message : "Failed to record payment",
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Payment) => {
    try {
      await paymentActions.remove(item.id);
      setMessage("Payment deleted");
      setMessageType("success");
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.message : "Failed to delete payment",
      );
      setMessageType("error");
    }
  };

  return (
    <Stack spacing={3.2}>
      <AdminFeedbackSnackbar
        open={Boolean(message)}
        message={message}
        severity={messageType}
        onClose={() => setMessage("")}
      />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack spacing={0.3}>
          <Typography sx={{ fontSize: { xs: "2rem", md: "2.2rem" } }}>
            Payments
          </Typography>
          <Typography color="text.secondary">
            {isLoading ? "Loading..." : `${data?.meta.count ?? 0} payments`}
          </Typography>
        </Stack>
        <Tooltip title="New Payment" arrow>
          <IconButton
            onClick={openNew}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {isLoading ? (
        <Typography color="text.secondary">Loading payments...</Typography>
      ) : isError ? (
        <Typography color="error.main">Failed to load payments.</Typography>
      ) : items.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography color="text.secondary">No payments yet.</Typography>
        </Box>
      ) : (
        <>
          <PaymentsTable items={items} onDelete={handleDelete} />
          {totalPages > 1 ? (
            <Stack direction="row" justifyContent="flex-end">
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Stack>
          ) : null}
        </>
      )}

      <PaymentFormDialog
        open={open}
        saving={saving}
        form={form}
        ledgers={ledgers}
        onClose={() => setOpen(false)}
        onChange={(key, value) =>
          setForm((prev) => ({ ...prev, [key]: value }))
        }
        onSubmit={handleSave}
      />
    </Stack>
  );
};
