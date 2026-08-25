"use client";

import { useEffect, useState } from "react";
import { Popover, Stack, TextField, Button, Typography } from "@mui/material";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { formatBaseCurrencyInCurrency } from "@/utils/currency";

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
  const [value, setValue] = useState(
    salePrice != null ? String(salePrice) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (anchorEl) {
      setValue(salePrice != null ? String(salePrice) : "");
      setError(null);
    }
  }, [anchorEl, salePrice]);

  const validate = (raw: string): number | null | undefined => {
    const trimmed = raw.trim();
    if (trimmed === "") return null;

    const num = Number(trimmed);
    if (!Number.isFinite(num) || num < 0) {
      setError("Enter a valid non-negative amount");
      return undefined;
    }
    if (num > price) {
      setError("Sale price cannot be greater than price");
      return undefined;
    }
    setError(null);
    return num;
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
