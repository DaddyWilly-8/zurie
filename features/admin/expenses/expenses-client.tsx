"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { AdminFeedbackSnackbar, AdminField } from "@/components/admin";
import { ApiError } from "@/services/api/client";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { formatBaseCurrencyInCurrency } from "@/utils/currency";
import { expenseActions } from "./expense-actions";
import { emptyExpenseForm, type ExpenseForm } from "./types";

export const AdminExpensesClient = () => {
  const { currency, rates } = useCurrencyStore();
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ExpenseForm>(emptyExpenseForm);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-expenses", page],
    queryFn: () => expenseActions.list(page),
  });
  const { data: costCenters = [] } = useQuery({
    queryKey: ["cost-centers"],
    queryFn: expenseActions.costCenters,
  });
  const expenses = data?.data ?? [];
  const pageCount = Math.max(
    1,
    Math.ceil((data?.count ?? 0) / expenseActions.pageSize),
  );
  const costCenterName = (id: number | null) =>
    costCenters.find((center) => center.id === id)?.name ?? "—";

  const change = <K extends keyof ExpenseForm>(key: K, value: ExpenseForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!(Number(form.amount) > 0)) {
      setMessage("Enter an amount greater than zero.");
      setMessageType("error");
      return;
    }
    setSaving(true);
    try {
      await expenseActions.create(form, currency, rates);
      setMessage("Expense recorded and posted to the books");
      setMessageType("success");
      setOpen(false);
      setForm(emptyExpenseForm);
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.message : "Failed to record expense",
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
            Expenses
          </Typography>
          <Typography color="text.secondary">
            {isLoading ? "Loading..." : `${data?.count ?? 0} expenses`} · each
            one is paid from Cash or Bank and posted to the ledger
          </Typography>
        </Stack>
        <Tooltip title="Record Expense" arrow>
          <IconButton
            aria-label="Record Expense"
            onClick={() => setOpen(true)}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {isLoading ? (
        <Typography color="text.secondary">Loading expenses...</Typography>
      ) : isError ? (
        <Typography color="error.main">Failed to load expenses.</Typography>
      ) : expenses.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography color="text.secondary">
            No expenses recorded yet.
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 0 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Paid from</TableCell>
                  <TableCell>Cost center</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id} hover>
                    <TableCell>
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.description ?? "—"}</TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>
                      {expense.paymentMethod ?? "cash"}
                    </TableCell>
                    <TableCell>
                      {costCenterName(expense.costCenterId)}
                    </TableCell>
                    <TableCell align="right">
                      {formatBaseCurrencyInCurrency(
                        expense.amount,
                        currency,
                        rates,
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {pageCount > 1 ? (
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_, value) => setPage(value)}
            />
          ) : null}
        </>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Typography
            variant="h5"
            sx={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Record Expense
          </Typography>
        </DialogTitle>
        <Box component="form" onSubmit={handleSave}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <AdminField
                  label="Category (e.g. Rent, Salaries)"
                  value={form.category}
                  onChange={(value) => change("category", value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AdminField
                  label={`Amount (${currency})`}
                  type="number"
                  value={form.amount}
                  onChange={(value) => change("amount", value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Paid from"
                  value={form.paymentMethod}
                  onChange={(event) =>
                    change(
                      "paymentMethod",
                      event.target.value as ExpenseForm["paymentMethod"],
                    )
                  }
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="bank">Bank</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Cost center (optional)"
                  value={form.costCenterId}
                  onChange={(event) =>
                    change("costCenterId", event.target.value)
                  }
                >
                  <MenuItem value="">None</MenuItem>
                  {costCenters.map((center) => (
                    <MenuItem key={center.id} value={String(center.id)}>
                      {center.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={12}>
                <AdminField
                  label="Description (optional)"
                  value={form.description}
                  onChange={(value) => change("description", value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpen(false)} variant="outlined">
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Saving..." : "Record"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
};
