"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { AdminFeedbackSnackbar } from "@/components/admin";
import { ApiError } from "@/services/api/client";
import { costCenterService } from "@/services/cost-centers/cost-center.service";
import { outletActions } from "./outlet-actions";
import { OutletsTable } from "./outlets-table";
import { OutletFormDialog } from "./outlet-form-dialog";
import { emptyOutletForm } from "./types";
import type { OutletForm, SalesOutlet } from "./types";

export const AdminOutletsClient = () => {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<SalesOutlet | null>(null);
  const [form, setForm] = useState<OutletForm>(emptyOutletForm);

  const {
    data: items = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-outlets"],
    queryFn: outletActions.list,
  });

  // Needed for the "Cost Center" picker in the create dialog — outlets and
  // cost centers are separate backend modules (per the Extensibility
  // Constitution, cross-module coupling is fine at the frontend service
  // layer, only the backend enforces the Services-only rule).
  const { data: costCenters = [] } = useQuery({
    queryKey: ["admin-cost-centers"],
    queryFn: costCenterService.list,
  });

  const openNew = () => {
    setEditing(null);
    setForm(emptyOutletForm);
    setOpen(true);
  };

  const openEdit = (item: SalesOutlet) => {
    setEditing(item);
    setForm({
      name: item.name,
      type: item.type,
      address: item.address ?? "",
      costCenterId: item.costCenterId ?? "",
    });
    setOpen(true);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await outletActions.update(editing.id, form);
        setMessage("Outlet updated successfully");
      } else {
        await outletActions.create(form);
        setMessage("Outlet created successfully");
      }
      setMessageType("success");
      setOpen(false);
      setForm(emptyOutletForm);
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : `Failed to ${editing ? "update" : "create"} outlet`,
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: SalesOutlet) => {
    try {
      await outletActions.setActive(item.id, !item.isActive);
      setMessage(item.isActive ? "Outlet deactivated" : "Outlet reactivated");
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
            Sales Outlets
          </Typography>
          <Typography color="text.secondary">
            {isLoading ? "Loading..." : `${items.length} outlets`}
          </Typography>
        </Stack>
        <Tooltip title="Add Outlet" arrow>
          <IconButton
            onClick={openNew}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {isLoading ? (
        <Typography color="text.secondary">Loading outlets...</Typography>
      ) : isError ? (
        <Typography color="error.main">Failed to load outlets.</Typography>
      ) : items.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography color="text.secondary">No outlets yet.</Typography>
        </Box>
      ) : (
        <OutletsTable
          items={items}
          onEdit={openEdit}
          onToggleActive={toggleActive}
        />
      )}

      <OutletFormDialog
        open={open}
        saving={saving}
        editing={Boolean(editing)}
        form={form}
        costCenters={costCenters}
        onClose={() => setOpen(false)}
        onChange={(key, value) =>
          setForm((prev) => ({ ...prev, [key]: value }))
        }
        onSubmit={handleSave}
      />
    </Stack>
  );
};
