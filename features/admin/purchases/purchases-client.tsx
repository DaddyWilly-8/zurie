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
import { supplierService } from "@/services/suppliers/supplier.service";
import { productService } from "@/services/products/product.service";
import { purchaseActions } from "./purchase-actions";
import { PurchasesTable } from "./purchases-table";
import { PurchaseFormDialog } from "./purchase-form-dialog";
import { emptyPurchaseForm } from "./types";
import type { AdminProduct } from "@/features/admin/products";
import type { PurchaseForm } from "./types";

const PAGE_SIZE = 20;

export const AdminPurchasesClient = () => {
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PurchaseForm>(emptyPurchaseForm);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-purchases", page],
    queryFn: () => purchaseActions.list(page, PAGE_SIZE),
  });

  // active suppliers list only shows first page (20) — fine for a picker;
  // suppliers beyond that are an edge case this dialog doesn't handle yet.
  const { data: suppliersResponse } = useQuery({
    queryKey: ["admin-suppliers-picker"],
    queryFn: () => supplierService.list({ page: 1, pageSize: 100 }),
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () =>
      productService.listAdminProducts() as Promise<AdminProduct[]>,
  });

  const items = data?.data ?? [];
  const suppliers = (suppliersResponse?.data ?? []).filter((s) => s.isActive);
  const totalPages = Math.max(
    1,
    Math.ceil((data?.meta.count ?? 0) / PAGE_SIZE),
  );

  const openNew = () => {
    setForm(emptyPurchaseForm);
    setOpen(true);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.supplierId === "") return;
    setSaving(true);
    try {
      await purchaseActions.create(form);
      setMessage("Purchase recorded successfully");
      setMessageType("success");
      setOpen(false);
      setForm(emptyPurchaseForm);
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.message : "Failed to record purchase",
      );
      setMessageType("error");
    } finally {
      setSaving(false);
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
            Purchases
          </Typography>
          <Typography color="text.secondary">
            {isLoading ? "Loading..." : `${data?.meta.count ?? 0} purchases`}
          </Typography>
        </Stack>
        <Tooltip title="Record Purchase" arrow>
          <IconButton
            onClick={openNew}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {isLoading ? (
        <Typography color="text.secondary">Loading purchases...</Typography>
      ) : isError ? (
        <Typography color="error.main">Failed to load purchases.</Typography>
      ) : items.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography color="text.secondary">No purchases yet.</Typography>
        </Box>
      ) : (
        <>
          <PurchasesTable items={items} />
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

      <PurchaseFormDialog
        open={open}
        saving={saving}
        form={form}
        suppliers={suppliers}
        products={products}
        onClose={() => setOpen(false)}
        onChange={(key, value) =>
          setForm((prev) => ({ ...prev, [key]: value }))
        }
        onSubmit={handleSave}
      />
    </Stack>
  );
};
