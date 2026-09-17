"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { AdminFeedbackSnackbar } from "@/components/admin";
import { ApiError } from "@/services/api/client";
import { outletService } from "@/services/outlets/outlet.service";
import { productService } from "@/services/products/product.service";
import { priceListActions } from "./price-list-actions";
import { PriceListsTable } from "./price-lists-table";
import { PriceListFormDialog } from "./price-list-form-dialog";
import { PriceListItemsDialog } from "./price-list-items-dialog";
import { emptyPriceListForm } from "./types";
import type { AdminProduct } from "@/features/admin/products";
import type { PriceList, PriceListForm } from "./types";

export const AdminPriceListsClient = () => {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<PriceList | null>(null);
  const [form, setForm] = useState<PriceListForm>(emptyPriceListForm);
  const [managingItemsFor, setManagingItemsFor] = useState<PriceList | null>(
    null,
  );

  const {
    data: items = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-price-lists"],
    queryFn: priceListActions.list,
  });

  const { data: outlets = [] } = useQuery({
    queryKey: ["admin-outlets"],
    queryFn: outletService.list,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () =>
      productService.listAdminProducts() as Promise<AdminProduct[]>,
  });

  const openNew = () => {
    setEditing(null);
    setForm(emptyPriceListForm);
    setOpen(true);
  };

  const openEdit = (item: PriceList) => {
    setEditing(item);
    setForm({
      name: item.name,
      outletId: item.outletId ?? "",
      customerId: item.customerId ?? "",
      validFrom: item.validFrom ?? "",
      validTo: item.validTo ?? "",
    });
    setOpen(true);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await priceListActions.update(editing.id, form);
        setMessage("Price list updated successfully");
      } else {
        await priceListActions.create(form);
        setMessage("Price list created successfully");
      }
      setMessageType("success");
      setOpen(false);
      setForm(emptyPriceListForm);
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : `Failed to ${editing ? "update" : "create"} price list`,
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: PriceList) => {
    try {
      await priceListActions.setActive(item.id, !item.isActive);
      setMessage(
        item.isActive ? "Price list deactivated" : "Price list reactivated",
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

  const handleAddItem = async (
    productId: number,
    price: number,
    salePrice?: number,
  ) => {
    if (!managingItemsFor) return;
    try {
      const response = await priceListActions.setItem(
        managingItemsFor.id,
        productId,
        price,
        salePrice,
      );
      setManagingItemsFor(response.data);
      setMessage("Price updated");
      setMessageType("success");
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.message : "Failed to set price",
      );
      setMessageType("error");
    }
  };

  const handleRemoveItem = async (productId: number) => {
    if (!managingItemsFor) return;
    try {
      const response = await priceListActions.removeItem(
        managingItemsFor.id,
        productId,
      );
      setManagingItemsFor(response.data);
      setMessage("Price override removed");
      setMessageType("success");
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.message : "Failed to remove price",
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
            Price Lists
          </Typography>
          <Typography color="text.secondary">
            {isLoading ? "Loading..." : `${items.length} price lists`}
          </Typography>
        </Stack>
        <Tooltip title="Add Price List" arrow>
          <IconButton
            onClick={openNew}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {isLoading ? (
        <Typography color="text.secondary">Loading price lists...</Typography>
      ) : isError ? (
        <Typography color="error.main">Failed to load price lists.</Typography>
      ) : items.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography color="text.secondary">No price lists yet.</Typography>
        </Box>
      ) : (
        <PriceListsTable
          items={items}
          onEdit={openEdit}
          onManageItems={setManagingItemsFor}
          onToggleActive={toggleActive}
        />
      )}

      <PriceListFormDialog
        open={open}
        saving={saving}
        editing={Boolean(editing)}
        form={form}
        outlets={outlets}
        onClose={() => setOpen(false)}
        onChange={(key, value) =>
          setForm((prev) => ({ ...prev, [key]: value }))
        }
        onSubmit={handleSave}
      />

      <PriceListItemsDialog
        open={Boolean(managingItemsFor)}
        priceList={managingItemsFor}
        products={products}
        onClose={() => setManagingItemsFor(null)}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
      />
    </Stack>
  );
};
