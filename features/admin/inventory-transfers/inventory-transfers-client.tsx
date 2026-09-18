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
import { outletService } from "@/services/outlets/outlet.service";
import { costCenterService } from "@/services/cost-centers/cost-center.service";
import { productService } from "@/services/products/product.service";
import { inventoryTransferActions } from "./inventory-transfer-actions";
import { InventoryTransfersTable } from "./inventory-transfers-table";
import { InventoryTransferFormDialog } from "./inventory-transfer-form-dialog";
import { emptyInventoryTransferForm } from "./types";
import type { AdminProduct } from "@/features/admin/products";
import type { InventoryTransferForm } from "./types";

const PAGE_SIZE = 20;

export const AdminInventoryTransfersClient = () => {
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<InventoryTransferForm>(
    emptyInventoryTransferForm,
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-inventory-transfers", page],
    queryFn: () => inventoryTransferActions.list(page, PAGE_SIZE),
  });

  const { data: outlets = [] } = useQuery({
    queryKey: ["admin-outlets-picker"],
    queryFn: () => outletService.list(),
  });

  const { data: costCenters = [] } = useQuery({
    queryKey: ["admin-cost-centers-picker"],
    queryFn: () => costCenterService.list(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () =>
      productService.listAdminProducts() as Promise<AdminProduct[]>,
  });

  const items = data?.data ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.meta.count ?? 0) / PAGE_SIZE),
  );

  const openNew = () => {
    setForm(emptyInventoryTransferForm);
    setOpen(true);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await inventoryTransferActions.create(form);
      setMessage("Inventory transfer created");
      setMessageType("success");
      setOpen(false);
      setForm(emptyInventoryTransferForm);
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : "Failed to create inventory transfer",
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
            Inventory Transfers
          </Typography>
          <Typography color="text.secondary">
            {isLoading
              ? "Loading..."
              : `${data?.meta.count ?? 0} inventory transfers`}
          </Typography>
        </Stack>
        <Tooltip title="New Inventory Transfer" arrow>
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
          Loading inventory transfers...
        </Typography>
      ) : isError ? (
        <Typography color="error.main">
          Failed to load inventory transfers.
        </Typography>
      ) : items.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography color="text.secondary">
            No inventory transfers yet.
          </Typography>
        </Box>
      ) : (
        <>
          <InventoryTransfersTable
            items={items}
            outlets={outlets}
            costCenters={costCenters}
            products={products}
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

      <InventoryTransferFormDialog
        open={open}
        saving={saving}
        form={form}
        outlets={outlets}
        costCenters={costCenters}
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
