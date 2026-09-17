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
import { supplierActions } from "./supplier-actions";
import { SuppliersTable } from "./suppliers-table";
import { SupplierFormDialog } from "./supplier-form-dialog";
import { emptySupplierForm } from "./types";
import type { Supplier, SupplierForm } from "./types";

const PAGE_SIZE = 20;

export const AdminSuppliersClient = () => {
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierForm>(emptySupplierForm);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-suppliers", page],
    queryFn: () => supplierActions.list(page, PAGE_SIZE),
  });

  const items = data?.data ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.meta.count ?? 0) / PAGE_SIZE),
  );

  const openNew = () => {
    setEditing(null);
    setForm(emptySupplierForm);
    setOpen(true);
  };

  const openEdit = (item: Supplier) => {
    setEditing(item);
    setForm({
      name: item.name,
      phone: item.phone ?? "",
      email: item.email ?? "",
      address: item.address ?? "",
    });
    setOpen(true);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await supplierActions.update(editing.id, form);
        setMessage("Supplier updated successfully");
      } else {
        await supplierActions.create(form);
        setMessage("Supplier created successfully");
      }
      setMessageType("success");
      setOpen(false);
      setForm(emptySupplierForm);
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : `Failed to ${editing ? "update" : "create"} supplier`,
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: Supplier) => {
    try {
      await supplierActions.setActive(item.id, !item.isActive);
      setMessage(
        item.isActive ? "Supplier deactivated" : "Supplier reactivated",
      );
      setMessageType("success");
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.message : "Failed to update status",
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
            Suppliers
          </Typography>
          <Typography color="text.secondary">
            {isLoading ? "Loading..." : `${data?.meta.count ?? 0} suppliers`}
          </Typography>
        </Stack>
        <Tooltip title="Add Supplier" arrow>
          <IconButton
            onClick={openNew}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {isLoading ? (
        <Typography color="text.secondary">Loading suppliers...</Typography>
      ) : isError ? (
        <Typography color="error.main">Failed to load suppliers.</Typography>
      ) : items.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography color="text.secondary">No suppliers yet.</Typography>
        </Box>
      ) : (
        <>
          <SuppliersTable
            items={items}
            onEdit={openEdit}
            onToggleActive={toggleActive}
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

      <SupplierFormDialog
        open={open}
        saving={saving}
        editing={Boolean(editing)}
        form={form}
        onClose={() => setOpen(false)}
        onChange={(key, value) =>
          setForm((prev) => ({ ...prev, [key]: value }))
        }
        onSubmit={handleSave}
      />
    </Stack>
  );
};
