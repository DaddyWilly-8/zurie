import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { currencyActions } from "./currency-actions";
import type { Currency } from "./types";

type Props = {
  open: boolean;
  currency: Currency | null;
  onClose: () => void;
  onAdded: () => void;
};

export const ExchangeRatesDialog = ({
  open,
  currency,
  onClose,
  onAdded,
}: Props) => {
  const [rate, setRate] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: rates = [], refetch } = useQuery({
    queryKey: ["currency-exchange-rates", currency?.id],
    queryFn: () => currencyActions.listExchangeRates(currency!.id),
    enabled: Boolean(currency),
  });

  const handleAdd = async () => {
    if (!currency || !rate) return;
    setSaving(true);
    try {
      await currencyActions.addExchangeRate(currency.id, Number(rate));
      setRate("");
      await refetch();
      onAdded();
    } finally {
      setSaving(false);
    }
  };

  if (!currency) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography
          variant="h5"
          sx={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {currency.code} Exchange Rates
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Typography color="text.secondary" variant="body2">
            Rate to base currency — how many {currency.code} equal 1 unit of the
            base currency.
          </Typography>
          <Grid container spacing={1.5} alignItems="center">
            <Grid size={9}>
              <TextField
                fullWidth
                type="number"
                label={`Rate (1 base = ? ${currency.code})`}
                value={rate}
                onChange={(event) => setRate(event.target.value)}
              />
            </Grid>
            <Grid size={3}>
              <Button
                fullWidth
                variant="contained"
                disabled={saving || !rate}
                onClick={handleAdd}
              >
                Add
              </Button>
            </Grid>
          </Grid>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      No exchange rates recorded yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rates.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {new Date(item.rateDatetime).toLocaleString()}
                    </TableCell>
                    <TableCell>{item.rateToBaseCurrency}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
