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
import { stakeholderService } from "@/services/stakeholders/stakeholder.service";
import { productService } from "@/services/products/product.service";
import { currencyService } from "@/services/currencies/currency.service";
import { outletService } from "@/services/outlets/outlet.service";
import { proformaInvoiceActions } from "./proforma-invoice-actions";
import { ProformaInvoicesTable } from "./proforma-invoices-table";
import { ProformaInvoiceFormDialog } from "./proforma-invoice-form-dialog";
import { emptyProformaInvoiceForm } from "./types";
import type { AdminProduct } from "@/features/admin/products";
import type { ProformaInvoice, ProformaInvoiceForm } from "./types";

const PAGE_SIZE = 20;

export const AdminProformaInvoicesClient = () => {
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ProformaInvoice | null>(null);
  const [form, setForm] = useState<ProformaInvoiceForm>(
    emptyProformaInvoiceForm,
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-proforma-invoices", page],
    queryFn: () => proformaInvoiceActions.list(page, PAGE_SIZE),
  });

  const { data: outlets = [] } = useQuery({
    queryKey: ["admin-outlets-picker"],
    queryFn: outletService.list,
  });

  const { data: stakeholders = [] } = useQuery({
    queryKey: ["admin-stakeholders-picker"],
    queryFn: () => stakeholderService.list(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () =>
      productService.listAdminProducts() as Promise<AdminProduct[]>,
  });

  const { data: currencies = [] } = useQuery({
    queryKey: ["admin-currencies"],
    queryFn: currencyService.list,
  });

  const items = data?.data ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.meta.count ?? 0) / PAGE_SIZE),
  );

  const openNew = () => {
    setEditing(null);
    setForm(emptyProformaInvoiceForm);
    setOpen(true);
  };

  const openEdit = (item: ProformaInvoice) => {
    setEditing(item);
    setForm({
      salesOutletId: item.salesOutletId,
      stakeholderId: item.stakeholderId,
      currencyId: item.currencyId,
      proformaDate: item.proformaDate,
      expiryDate: item.expiryDate ?? "",
      notes: item.notes ?? "",
      items: item.items.map((line) => ({
        productId: line.productId,
        quantity: String(line.quantity),
        unitPrice: String(line.unitPrice),
      })),
    });
    setOpen(true);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await proformaInvoiceActions.update(editing.id, form);
        setMessage("Proforma invoice updated");
      } else {
        await proformaInvoiceActions.create(form);
        setMessage("Proforma invoice created");
      }
      setMessageType("success");
      setOpen(false);
      setForm(emptyProformaInvoiceForm);
      setEditing(null);
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : "Failed to save proforma invoice",
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: ProformaInvoice) => {
    try {
      await proformaInvoiceActions.setActive(item.id, !item.isActive);
      setMessage(
        item.isActive
          ? "Proforma invoice withdrawn"
          : "Proforma invoice restored",
      );
      setMessageType("success");
      await refetch();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Action failed");
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
            Proforma Invoices
          </Typography>
          <Typography color="text.secondary">
            {isLoading
              ? "Loading..."
              : `${data?.meta.count ?? 0} proforma invoices`}
          </Typography>
        </Stack>
        <Tooltip title="New Proforma Invoice" arrow>
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
          Loading proforma invoices...
        </Typography>
      ) : isError ? (
        <Typography color="error.main">
          Failed to load proforma invoices.
        </Typography>
      ) : items.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography color="text.secondary">
            No proforma invoices yet.
          </Typography>
        </Box>
      ) : (
        <>
          <ProformaInvoicesTable
            items={items}
            onEdit={openEdit}
            onToggleActive={handleToggleActive}
          />
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

      <ProformaInvoiceFormDialog
        open={open}
        saving={saving}
        title={editing ? "Edit Proforma Invoice" : "New Proforma Invoice"}
        form={form}
        outlets={outlets}
        stakeholders={stakeholders}
        products={products}
        currencies={currencies}
        onClose={() => setOpen(false)}
        onChange={(key, value) =>
          setForm((prev) => ({ ...prev, [key]: value }))
        }
        onSubmit={handleSave}
      />
    </Stack>
  );
};
