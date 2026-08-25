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
} from "@/utils/currency";

export type PricingUpdate = { price: number; salePrice: number | null };

type PricingPopoverProps = {
  productId: string;
  price: number;
  salePrice: number | null;
  onSave: (id: string, pricing: PricingUpdate) => Promise<boolean>;
  trigger: (
    open: (event: React.MouseEvent<HTMLElement>) => void,
  ) => React.ReactNode;
};

type FieldKey = "price" | "sale";

export const PricingPopover = ({
  productId,
  price,
  salePrice,
  onSave,
  trigger,
}: PricingPopoverProps) => {
  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  // Numeric values are always held in the admin's currently selected display
  // currency, then converted to the base currency (TZS) on save — same
  // convention as the price/buyingPrice/compareAt fields in
  // product-fields.tsx. `price` and `salePrice` props here are always TZS.
  const [priceValue, setPriceValue] = useState<number | null>(null);
  const [saleValue, setSaleValue] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // While a field is focused we show exactly what the admin typed (rawValue),
  // so intermediate states like "12." aren't reformatted away mid-keystroke.
  // On blur it falls back to the comma-formatted display value.
  const [editingField, setEditingField] = useState<FieldKey | null>(null);
  const [rawValue, setRawValue] = useState("");

  useEffect(() => {
    if (anchorEl) {
      setPriceValue(convertFromBaseCurrency(price, currency, rates));
      setSaleValue(
        salePrice != null
          ? convertFromBaseCurrency(salePrice, currency, rates)
          : null,
      );
      setError(null);
      setEditingField(null);
    }
  }, [anchorEl, price, salePrice, currency, rates]);

  const formatNumber = (value: number | null) => {
    if (value === null || Number.isNaN(value)) return "";
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: currency === "TZS" ? 0 : 2,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const parseNumber = (raw: string) => {
    const normalized = raw.replace(/[^\d.]/g, "");
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const fieldProps = (field: FieldKey, value: number | null) => {
    const isEditing = editingField === field;
    const setValue = field === "price" ? setPriceValue : setSaleValue;

    return {
      value: isEditing ? rawValue : formatNumber(value),
      onFocus: () => {
        setEditingField(field);
        setRawValue(value !== null ? String(value) : "");
      },
      onBlur: () => setEditingField(null),
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value;
        // Only allow digits, commas (from paste), and a single decimal point.
        if (!/^[\d,]*\.?\d*$/.test(raw)) return;
        setRawValue(raw);
        setValue(parseNumber(raw));
      },
    };
  };

  // Validates salePrice <= price in TZS — never compare across currencies.
  const validate = (): PricingUpdate | undefined => {
    if (priceValue === null || priceValue < 0) {
      setError("Enter a valid price");
      return undefined;
    }

    const priceInBaseCurrency = convertToBaseCurrency(
      priceValue,
      currency,
      rates,
    );

    if (saleValue === null) {
      setError(null);
      return { price: priceInBaseCurrency, salePrice: null };
    }

    if (saleValue < 0) {
      setError("Enter a valid sale price");
      return undefined;
    }

    const saleInBaseCurrency = convertToBaseCurrency(
      saleValue,
      currency,
      rates,
    );
    if (saleInBaseCurrency > priceInBaseCurrency) {
      setError("Sale price cannot be greater than price");
      return undefined;
    }

    setError(null);
    return { price: priceInBaseCurrency, salePrice: saleInBaseCurrency };
  };

  const handleSave = async () => {
    const parsed = validate();
    if (!parsed) return;
    setSaving(true);
    const ok = await onSave(productId, parsed);
    setSaving(false);
    if (ok) setAnchorEl(null);
  };

  const handleClearSale = async () => {
    if (priceValue === null || priceValue < 0) {
      setError("Enter a valid price");
      return;
    }
    setSaving(true);
    const ok = await onSave(productId, {
      price: convertToBaseCurrency(priceValue, currency, rates),
      salePrice: null,
    });
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
          <Typography variant="subtitle2">Edit Pricing</Typography>
          <TextField
            label="Price"
            size="small"
            disabled={saving}
            {...fieldProps("price", priceValue)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">{currency}</InputAdornment>
              ),
            }}
          />
          <TextField
            label="Sale price"
            size="small"
            error={Boolean(error)}
            helperText={error ?? "Leave empty for no discount"}
            disabled={saving}
            {...fieldProps("sale", saleValue)}
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
                onClick={handleClearSale}
                disabled={saving}
                fullWidth
              >
                Clear Sale
              </Button>
            )}
          </Stack>
        </Stack>
      </Popover>
    </>
  );
};
