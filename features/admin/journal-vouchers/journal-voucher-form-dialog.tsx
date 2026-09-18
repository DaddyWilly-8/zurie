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
import { emptyJournalVoucherLine } from "./types";
import type { JournalVoucherForm, JournalVoucherLineForm } from "./types";

type Props = {
  open: boolean;
  saving: boolean;
  form: JournalVoucherForm;
  ledgers: Array<Ledger & { groupName: string }>;
  onClose: () => void;
  onChange: <K extends keyof JournalVoucherForm>(
    key: K,
    value: JournalVoucherForm[K],
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const JournalVoucherFormDialog = ({
  open,
  saving,
  form,
  ledgers,
  onClose,
  onChange,
  onSubmit,
}: Props) => {
  const updateLine = (
    index: number,
    patch: Partial<JournalVoucherLineForm>,
  ) => {
    const items = form.items.map((line, i) =>
      i === index ? { ...line, ...patch } : line,
    );
    onChange("items", items);
  };

  const addLine = () =>
    onChange("items", [...form.items, { ...emptyJournalVoucherLine }]);
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Typography
          variant="h5"
          sx={{ fontFamily: "var(--font-playfair), serif" }}
        >
          New Journal Voucher
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            <AdminField
              label="Reference"
              value={form.reference}
              onChange={(value) => onChange("reference", value)}
            />

            <Divider />
            <Typography variant="subtitle2">
              Lines (each line is its own manual debit/credit pair)
            </Typography>

            {form.items.map((line, index) => (
              <Grid container spacing={1.5} key={index} alignItems="center">
                <Grid size={{ xs: 12, md: 4.5 }}>
                  <LedgerSelect
                    label="Debit"
                    size="small"
                    value={line.debitLedgerId}
                    ledgers={ledgers}
                    onChange={(value) =>
                      updateLine(index, { debitLedgerId: value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4.5 }}>
                  <LedgerSelect
                    label="Credit"
                    size="small"
                    value={line.creditLedgerId}
                    ledgers={ledgers}
                    onChange={(value) =>
                      updateLine(index, { creditLedgerId: value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 9, md: 2.5 }}>
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
                <Grid size={{ xs: 3, md: 0.5 }}>
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
            {saving ? "Saving..." : "Post Voucher"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
