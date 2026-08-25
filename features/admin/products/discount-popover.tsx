"use client";

import { useEffect, useState } from "react";
import {
  Popover,
  Stack,
  TextField,
  Button,
  Typography,
  InputAdornment,
} from "@mui/material";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import {
  convertFromBaseCurrency,
  convertToBaseCurrency,
  formatBaseCurrencyInCurrency,
} from "@/utils/currency";

type DiscountPopoverProps = {
  productId: string;
  price: number;
  salePrice: number | null;
  onSave: (id: string, salePrice: number | null) => Promise<boolean>;
  trigger: (
    open: (event: React.MouseEvent<HTMLElement>) => void,
  ) => React.ReactNode;
};

export const DiscountPopover = ({
  productId,
  price,
  salePrice,
  onSave,
  trigger,
}: DiscountPopoverProps) => {
  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  // Input is always shown/typed in the admin's currently selected display
  // currency, then converted to the base currency (TZS) before it's sent
  // anywhere — same convention as the price/buyingPrice/compareAt fields
  // in product-fields.tsx. `price` and `salePrice` here are always TZS.
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (anchorEl) {
      setValue(
        salePrice != null
          ? String(convertFromBaseCurrency(salePrice, currency, rates))
          : "",
      );
      setError(null);
    }
  }, [anchorEl, salePrice, currency, rates]);

  // Parses what the admin typed (in `currency`), converts it to TZS, and
  // validates the TZS amount against `price` (already TZS) — never compare
  // across currencies.
  const validate = (raw: string): number | null | undefined => {
    const trimmed = raw.trim();
    if (trimmed === "") return null;

    const typed = Number(trimmed);
    if (!Number.isFinite(typed) || typed < 0) {
      setError("Enter a valid non-negative amount");
      return undefined;
    }

    const inBaseCurrency = convertToBaseCurrency(typed, currency, rates);
    if (inBaseCurrency > price) {
      setError("Sale price cannot be greater than price");
      return undefined;
    }
    setError(null);
    return inBaseCurrency;
  };

  const handleSave = async () => {
    const parsed = validate(value);
    if (parsed === undefined) return;
    setSaving(true);
    const ok = await onSave(productId, parsed);
    setSaving(false);
    if (ok) setAnchorEl(null);
  };

  const handleClear = async () => {
    setSaving(true);
    const ok = await onSave(productId, null);
    setSaving(false);
    if (ok) setAnchorEl(null);
  };

  return (
    <>
      {trigger((event) => setAnchorEl(event.currentTarget))}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Stack spacing={1.5} sx={{ p: 2, width: 240 }}>
          <Typography variant="subtitle2">Set Discount</Typography>
          <Typography variant="caption" color="text.secondary">
            Price: {formatBaseCurrencyInCurrency(price, currency, rates)}
          </Typography>
          <TextField
            label="Sale price"
            type="number"
            size="small"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            error={Boolean(error)}
            helperText={error ?? "Leave empty to remove discount"}
            disabled={saving}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">{currency}</InputAdornment>
              ),
            }}
          />
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              fullWidth
            >
              {saving ? "Saving…" : "Save"}
            </Button>
            {salePrice != null && (
              <Button
                size="small"
                color="error"
                variant="outlined"
                onClick={handleClear}
                disabled={saving}
                fullWidth
              >
                Clear
              </Button>
            )}
          </Stack>
        </Stack>
      </Popover>
    </>
  );
};
