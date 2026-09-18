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
import { measurementUnitService } from "@/services/measurement-units/measurement-unit.service";
import { grnService } from "@/services/procurement/grn.service";
import { purchaseOrderActions } from "./purchase-order-actions";
import { PurchaseOrdersTable } from "./purchase-orders-table";
import { PurchaseOrderFormDialog } from "./purchase-order-form-dialog";
import { ReceiveGrnDialog } from "./receive-grn-dialog";
import { emptyPurchaseOrderForm } from "./types";
import type { AdminProduct } from "@/features/admin/products";
import type { PurchaseOrder, PurchaseOrderForm } from "./types";

const PAGE_SIZE = 20;

export const AdminPurchaseOrdersClient = () => {
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PurchaseOrderForm>(emptyPurchaseOrderForm);
  const [receiving, setReceiving] = useState<PurchaseOrder | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-purchase-orders", page],
    queryFn: () => purchaseOrderActions.list(page, PAGE_SIZE),
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

  const { data: measurementUnits = [] } = useQuery({
    queryKey: ["admin-measurement-units"],
    queryFn: measurementUnitService.list,
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
    setForm(emptyPurchaseOrderForm);
    setOpen(true);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await purchaseOrderActions.create(form);
      setMessage("Purchase order created");
      setMessageType("success");
      setOpen(false);
      setForm(emptyPurchaseOrderForm);
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : "Failed to create purchase order",
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (
    action: () => Promise<unknown>,
    successMessage: string,
  ) => {
    try {
      await action();
      setMessage(successMessage);
      setMessageType("success");
      await refetch();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Action failed");
      setMessageType("error");
    }
  };

  const handleReceive = async (
    lines: Array<{ purchaseOrderItemId: number; quantityReceived: number }>,
  ) => {
    if (!receiving) return;
    setSaving(true);
    try {
      await grnService.create({ purchaseOrderId: receiving.id, lines });
      setMessage("Goods received");
      setMessageType("success");
      setReceiving(null);
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.message : "Failed to receive goods",
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
            Purchase Orders
          </Typography>
          <Typography color="text.secondary">
            {isLoading
              ? "Loading..."
              : `${data?.meta.count ?? 0} purchase orders`}
          </Typography>
        </Stack>
        <Tooltip title="New Purchase Order" arrow>
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
          Loading purchase orders...
        </Typography>
      ) : isError ? (
        <Typography color="error.main">
          Failed to load purchase orders.
        </Typography>
      ) : items.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography color="text.secondary">
            No purchase orders yet.
          </Typography>
        </Box>
      ) : (
        <>
          <PurchaseOrdersTable
            items={items}
            onReceive={setReceiving}
            onClose={(item) =>
              runAction(
                () => purchaseOrderActions.close(item.id),
                "Purchase order closed",
              )
            }
            onReopen={(item) =>
              runAction(
                () => purchaseOrderActions.reopen(item.id),
                "Purchase order reopened",
              )
            }
            onCancel={(item) =>
              runAction(
                () => purchaseOrderActions.cancel(item.id),
                "Purchase order cancelled",
              )
            }
            onDelete={(item) =>
              runAction(
                () => purchaseOrderActions.remove(item.id),
                "Purchase order deleted",
              )
            }
            onGrnUnreceived={(text) => {
              setMessage(text);
              setMessageType("success");
              void refetch();
            }}
            onGrnUnreceiveError={(text) => {
              setMessage(text);
              setMessageType("error");
            }}
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

      <PurchaseOrderFormDialog
        open={open}
        saving={saving}
        form={form}
        stakeholders={stakeholders}
        products={products}
        measurementUnits={measurementUnits}
        currencies={currencies}
        onClose={() => setOpen(false)}
        onChange={(key, value) =>
          setForm((prev) => ({ ...prev, [key]: value }))
        }
        onSubmit={handleSave}
      />

      <ReceiveGrnDialog
        open={receiving !== null}
        saving={saving}
        purchaseOrder={receiving}
        onClose={() => setReceiving(null)}
        onSubmit={handleReceive}
      />
    </Stack>
  );
};
