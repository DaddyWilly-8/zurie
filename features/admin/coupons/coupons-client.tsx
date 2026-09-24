"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { AdminFeedbackSnackbar } from "@/components/admin";
import { ApiError } from "@/services/api/client";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { formatBaseCurrencyInCurrency } from "@/utils/currency";
import { couponActions } from "./coupon-actions";
import { CouponFormDialog } from "./coupon-form-dialog";
import { emptyCouponForm, type Coupon, type CouponForm } from "./types";

export const AdminCouponsClient = () => {
  const { currency, rates } = useCurrencyStore();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CouponForm>(emptyCouponForm);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: couponActions.list,
  });
  const coupons = data?.data ?? [];

  const notify = (text: string, type: "success" | "error") => {
    setMessage(text);
    setMessageType(type);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await couponActions.create(form, currency, rates);
      notify("Coupon created", "success");
      setOpen(false);
      setForm(emptyCouponForm);
      await refetch();
    } catch (error) {
      notify(
        error instanceof ApiError ? error.message : "Failed to create coupon",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      await couponActions.setActive(coupon.id, !coupon.isActive);
      notify(
        coupon.isActive ? "Coupon deactivated" : "Coupon activated",
        "success",
      );
      await refetch();
    } catch (error) {
      notify(
        error instanceof ApiError ? error.message : "Failed to update coupon",
        "error",
      );
    }
  };

  const money = (amount: number) =>
    formatBaseCurrencyInCurrency(amount, currency, rates);

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
            Coupons
          </Typography>
          <Typography color="text.secondary">
            {isLoading ? "Loading..." : `${data?.count ?? 0} coupons`} ·
            customers enter the code at checkout
          </Typography>
        </Stack>
        <Tooltip title="New Coupon" arrow>
          <IconButton
            aria-label="New Coupon"
            onClick={() => setOpen(true)}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {isLoading ? (
        <Typography color="text.secondary">Loading coupons...</Typography>
      ) : isError ? (
        <Typography color="error.main">Failed to load coupons.</Typography>
      ) : coupons.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography color="text.secondary">No coupons yet.</Typography>
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 0 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Min. order</TableCell>
                <TableCell>Used</TableCell>
                <TableCell>Valid</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{coupon.code}</TableCell>
                  <TableCell>
                    {coupon.type === "percentage"
                      ? `${coupon.value}%`
                      : money(coupon.value)}
                  </TableCell>
                  <TableCell>
                    {coupon.minOrderAmount !== null
                      ? money(coupon.minOrderAmount)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {coupon.usedCount}
                    {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ""}
                  </TableCell>
                  <TableCell>
                    {coupon.validFrom || coupon.validTo
                      ? `${coupon.validFrom ?? "…"} → ${coupon.validTo ?? "…"}`
                      : "Always"}
                  </TableCell>
                  <TableCell>
                    <Tooltip
                      title={
                        coupon.isActive
                          ? "Click to deactivate"
                          : "Click to activate"
                      }
                    >
                      <Chip
                        size="small"
                        clickable
                        label={coupon.isActive ? "Active" : "Inactive"}
                        color={coupon.isActive ? "success" : "default"}
                        onClick={() => toggleActive(coupon)}
                      />
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CouponFormDialog
        open={open}
        saving={saving}
        form={form}
        currency={currency}
        onClose={() => setOpen(false)}
        onChange={(key, value) =>
          setForm((prev) => ({ ...prev, [key]: value }))
        }
        onSubmit={handleSave}
      />
    </Stack>
  );
};
