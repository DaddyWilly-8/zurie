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
import { journalVoucherActions } from "./journal-voucher-actions";
import { JournalVouchersTable } from "./journal-vouchers-table";
import { JournalVoucherFormDialog } from "./journal-voucher-form-dialog";
import { emptyJournalVoucherForm } from "./types";
import type { JournalVoucher, JournalVoucherForm } from "./types";

const PAGE_SIZE = 20;

export const AdminJournalVouchersClient = () => {
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<JournalVoucherForm>(emptyJournalVoucherForm);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-journal-vouchers", page],
    queryFn: () => journalVoucherActions.list(page, PAGE_SIZE),
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
    setForm(emptyJournalVoucherForm);
    setOpen(true);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await journalVoucherActions.create(form);
      setMessage("Journal voucher posted");
      setMessageType("success");
      setOpen(false);
      setForm(emptyJournalVoucherForm);
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : "Failed to post journal voucher",
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: JournalVoucher) => {
    try {
      await journalVoucherActions.remove(item.id);
      setMessage("Journal voucher deleted");
      setMessageType("success");
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : "Failed to delete journal voucher",
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
            Journal Vouchers
          </Typography>
          <Typography color="text.secondary">
            {isLoading
              ? "Loading..."
              : `${data?.meta.count ?? 0} journal vouchers`}
          </Typography>
        </Stack>
        <Tooltip title="New Journal Voucher" arrow>
          <IconButton
            onClick={openNew}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {isLoading ? (
        <Typography color="text.secondary">
          Loading journal vouchers...
        </Typography>
      ) : isError ? (
        <Typography color="error.main">
          Failed to load journal vouchers.
        </Typography>
      ) : items.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography color="text.secondary">
            No journal vouchers yet.
          </Typography>
        </Box>
      ) : (
        <>
          <JournalVouchersTable items={items} onDelete={handleDelete} />
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

      <JournalVoucherFormDialog
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
