"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { AdminFeedbackSnackbar } from "@/components/admin";
import { ApiError } from "@/services/api/client";
import { costCenterActions } from "./cost-center-actions";
import { CostCentersTable } from "./cost-centers-table";
import { CostCenterFormDialog } from "./cost-center-form-dialog";
import { emptyCostCenterForm } from "./types";
import type { CostCenter, CostCenterForm } from "./types";

export const AdminCostCentersClient = () => {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<CostCenter | null>(null);
  const [form, setForm] = useState<CostCenterForm>(emptyCostCenterForm);

  const {
    data: items = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-cost-centers"],
    queryFn: costCenterActions.list,
  });

  const openNew = () => {
    setEditing(null);
    setForm(emptyCostCenterForm);
    setOpen(true);
  };

  const openEdit = (item: CostCenter) => {
    setEditing(item);
    setForm({ name: item.name, parentId: item.parentId ?? "" });
    setOpen(true);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await costCenterActions.update(editing.id, form);
        setMessage("Cost center updated successfully");
      } else {
        await costCenterActions.create(form);
        setMessage("Cost center created successfully");
      }
      setMessageType("success");
      setOpen(false);
      setForm(emptyCostCenterForm);
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : `Failed to ${editing ? "update" : "create"} cost center`,
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: CostCenter) => {
    try {
      await costCenterActions.setActive(item.id, !item.isActive);
      setMessage(
        item.isActive ? "Cost center deactivated" : "Cost center reactivated",
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
            Cost Centers
          </Typography>
          <Typography color="text.secondary">
            {isLoading ? "Loading..." : `${items.length} cost centers`}
          </Typography>
        </Stack>
        <Tooltip title="Add Cost Center" arrow>
          <IconButton
            onClick={openNew}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {isLoading ? (
        <Typography color="text.secondary">Loading cost centers...</Typography>
      ) : isError ? (
        <Typography color="error.main">Failed to load cost centers.</Typography>
      ) : items.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography color="text.secondary">No cost centers yet.</Typography>
        </Box>
      ) : (
        <CostCentersTable
          items={items}
          onEdit={openEdit}
          onToggleActive={toggleActive}
        />
      )}

      <CostCenterFormDialog
        open={open}
        saving={saving}
        editing={Boolean(editing)}
        editingId={editing?.id}
        form={form}
        costCenters={items}
        onClose={() => setOpen(false)}
        onChange={(key, value) =>
          setForm((prev) => ({ ...prev, [key]: value }))
        }
        onSubmit={handleSave}
      />
    </Stack>
  );
};
