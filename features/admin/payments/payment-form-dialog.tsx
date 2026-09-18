import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { AdminField, LedgerSelect } from "@/components/admin";
import type { Ledger } from "@/services/finance/finance.service";
import { emptyPaymentLine } from "./types";
import type { PaymentForm, PaymentLineForm } from "./types";

type Props = {
  open: boolean;
  saving: boolean;
  form: PaymentForm;
  ledgers: Array<Ledger & { groupName: string }>;
  onClose: () => void;
  onChange: <K extends keyof PaymentForm>(
    key: K,
    value: PaymentForm[K],
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const PaymentFormDialog = ({
  open,
  saving,
  form,
  ledgers,
  onClose,
  onChange,
  onSubmit,
}: Props) => {
  const updateLine = (index: number, patch: Partial<PaymentLineForm>) => {
    const items = form.items.map((line, i) =>
      i === index ? { ...line, ...patch } : line,
    );
    onChange("items", items);
  };

  const addLine = () =>
    onChange("items", [...form.items, { ...emptyPaymentLine }]);
  const removeLine = (index: number) =>
    onChange(
      "items",
      form.items.filter((_, i) => i !== index),
    );

  const total = form.items.reduce(
    (sum, line) => sum + (Number(line.amount) || 0),
    0,
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography
          variant="h5"
          sx={{ fontFamily: "var(--font-playfair), serif" }}
        >
          New Payment
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            <LedgerSelect
              label="Paid From (credited)"
              value={form.creditLedgerId}
              ledgers={ledgers}
              onChange={(value) => onChange("creditLedgerId", value)}
              required
            />
            <AdminField
              label="Reference"
              value={form.reference}
              onChange={(value) => onChange("reference", value)}
            />

            <Divider />
            <Typography variant="subtitle2">
              Items (what&apos;s being paid)
            </Typography>

            {form.items.map((line, index) => (
              <Grid container spacing={1.5} key={index} alignItems="center">
                <Grid size={{ xs: 12, md: 8 }}>
                  <LedgerSelect
                    label="Debit (expense/payable)"
                    size="small"
                    value={line.debitLedgerId}
                    ledgers={ledgers}
                    onChange={(value) =>
                      updateLine(index, { debitLedgerId: value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 9, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Amount"
                    value={line.amount}
                    onChange={(event) =>
                      updateLine(index, { amount: event.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 3, md: 1 }}>
                  <IconButton
                    onClick={() => removeLine(index)}
                    disabled={form.items.length === 1}
                    color="error"
                  >
                    <FontAwesomeIcon icon={faTrash} size="xs" />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button
              startIcon={<FontAwesomeIcon icon={faPlus} size="xs" />}
              onClick={addLine}
              sx={{ alignSelf: "flex-start" }}
            >
              Add Line
            </Button>

            <Divider />
            <Typography color="text.secondary">
              Total: {total.toLocaleString()}
            </Typography>
            <AdminField
              label="Narration"
              value={form.narration}
              onChange={(value) => onChange("narration", value)}
              multiline
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Record Payment"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
