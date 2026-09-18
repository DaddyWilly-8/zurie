"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { AdminFeedbackSnackbar } from "@/components/admin";
import { ApiError } from "@/services/api/client";
import { measurementUnitActions } from "./measurement-unit-actions";
import { MeasurementUnitsTable } from "./measurement-units-table";
import { MeasurementUnitFormDialog } from "./measurement-unit-form-dialog";
import { emptyMeasurementUnitForm } from "./types";
import type { MeasurementUnit, MeasurementUnitForm } from "./types";

export const AdminMeasurementUnitsClient = () => {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<MeasurementUnit | null>(null);
  const [form, setForm] = useState<MeasurementUnitForm>(
    emptyMeasurementUnitForm,
  );

  const {
    data: items = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-measurement-units"],
    queryFn: measurementUnitActions.list,
  });

  const openNew = () => {
    setEditing(null);
    setForm(emptyMeasurementUnitForm);
    setOpen(true);
  };

  const openEdit = (item: MeasurementUnit) => {
    setEditing(item);
    setForm({
      name: item.name,
      symbol: item.symbol,
      description: item.description ?? "",
    });
    setOpen(true);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await measurementUnitActions.update(editing.id, form);
        setMessage("Measurement unit updated successfully");
      } else {
        await measurementUnitActions.create(form);
        setMessage("Measurement unit created successfully");
      }
      setMessageType("success");
      setOpen(false);
      setForm(emptyMeasurementUnitForm);
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : `Failed to ${editing ? "update" : "create"} measurement unit`,
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: MeasurementUnit) => {
    try {
      await measurementUnitActions.setActive(item.id, !item.isActive);
      setMessage(item.isActive ? "Unit deactivated" : "Unit reactivated");
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
            Measurement Units
          </Typography>
          <Typography color="text.secondary">
            {isLoading ? "Loading..." : `${items.length} units`}
          </Typography>
        </Stack>
        <Tooltip title="Add Measurement Unit" arrow>
          <IconButton
            onClick={openNew}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {isLoading ? (
        <Typography color="text.secondary">Loading units...</Typography>
      ) : isError ? (
        <Typography color="error.main">Failed to load units.</Typography>
      ) : items.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography color="text.secondary">
            No measurement units yet.
          </Typography>
        </Box>
      ) : (
        <MeasurementUnitsTable
          items={items}
          onEdit={openEdit}
          onToggleActive={toggleActive}
        />
      )}

      <MeasurementUnitFormDialog
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
