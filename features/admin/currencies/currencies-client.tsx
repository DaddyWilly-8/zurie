"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { AdminFeedbackSnackbar } from "@/components/admin";
import { ApiError } from "@/services/api/client";
import { currencyActions } from "./currency-actions";
import { CurrenciesTable } from "./currencies-table";
import { CurrencyFormDialog } from "./currency-form-dialog";
import { ExchangeRatesDialog } from "./exchange-rates-dialog";
import { emptyCurrencyForm } from "./types";
import type { Currency, CurrencyForm } from "./types";

export const AdminCurrenciesClient = () => {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Currency | null>(null);
  const [form, setForm] = useState<CurrencyForm>(emptyCurrencyForm);
  const [managingRatesFor, setManagingRatesFor] = useState<Currency | null>(
    null,
  );

  const {
    data: items = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-currencies"],
    queryFn: currencyActions.list,
  });

  const openNew = () => {
    setEditing(null);
    setForm(emptyCurrencyForm);
    setOpen(true);
  };

  const openEdit = (item: Currency) => {
    setEditing(item);
    setForm({
      name: item.name,
      namePlural: item.namePlural,
      code: item.code,
      symbol: item.symbol,
      symbolNative: item.symbolNative,
      decimalDigits: String(item.decimalDigits),
    });
    setOpen(true);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await currencyActions.update(editing.id, form);
        setMessage("Currency updated successfully");
      } else {
        await currencyActions.create(form);
        setMessage("Currency created successfully");
      }
      setMessageType("success");
      setOpen(false);
      setForm(emptyCurrencyForm);
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : `Failed to ${editing ? "update" : "create"} currency`,
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: Currency) => {
    try {
      await currencyActions.setActive(item.id, !item.isActive);
      setMessage(
        item.isActive ? "Currency deactivated" : "Currency reactivated",
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

  const designateBase = async (item: Currency) => {
    try {
      await currencyActions.designateBase(item.id);
      setMessage(`${item.code} is now the base currency`);
      setMessageType("success");
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : "Failed to set base currency",
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
            Currencies
          </Typography>
          <Typography color="text.secondary">
            {isLoading ? "Loading..." : `${items.length} currencies`}
          </Typography>
        </Stack>
        <Tooltip title="Add Currency" arrow>
          <IconButton
            onClick={openNew}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {isLoading ? (
        <Typography color="text.secondary">Loading currencies...</Typography>
      ) : isError ? (
        <Typography color="error.main">Failed to load currencies.</Typography>
      ) : items.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography color="text.secondary">No currencies yet.</Typography>
        </Box>
      ) : (
        <CurrenciesTable
          items={items}
          onEdit={openEdit}
          onToggleActive={toggleActive}
          onDesignateBase={designateBase}
          onManageRates={setManagingRatesFor}
        />
      )}

      <CurrencyFormDialog
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

      <ExchangeRatesDialog
        open={Boolean(managingRatesFor)}
        currency={managingRatesFor}
        onClose={() => setManagingRatesFor(null)}
        onAdded={() => {
          setMessage("Exchange rate added");
          setMessageType("success");
        }}
      />
    </Stack>
  );
};
