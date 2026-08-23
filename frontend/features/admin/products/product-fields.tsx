"use client";
import { useState } from "react";
import {
  Grid,
  MenuItem,
  Stack,
  TextField,
  FormHelperText,
  Alert,
  Typography,
} from "@mui/material";
import { AdminField, AdminToggle } from "@/components/admin";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import {
  convertFromBaseCurrency,
  convertToBaseCurrency,
} from "@/utils/currency";
import InputAdornment from "@mui/material/InputAdornment";
import type { ProductFieldsProps } from "./types";

type DecimalFieldKey = "price" | "buyingPrice" | "compareAt";

export const ProductFields = ({
  state,
  onChange,
  categoryOptions,
  errors,
}: ProductFieldsProps) => {
  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);

  // Tracks which decimal field is currently focused, and the raw text
  // the user is typing into it (so "12." doesn't get collapsed to "12").
  const [editingField, setEditingField] = useState<DecimalFieldKey | null>(
    null,
  );
  const [rawValue, setRawValue] = useState("");

  const getError = <K extends keyof ProductFieldsProps["state"]>(key: K) =>
    errors?.[key] ?? "";

  const formatNumber = (
    value: number | null,
    options?: { maxFractionDigits?: number },
  ) => {
    if (value === null || Number.isNaN(value)) return "";
    const converted = convertFromBaseCurrency(value, currency, rates);
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits:
        options?.maxFractionDigits ?? (currency === "TZS" ? 0 : 2),
      minimumFractionDigits: 0,
    }).format(converted);
  };

  const parseNumber = (value: string) => {
    // Remove all non-numeric characters except decimal point and minus sign
    const normalized = value.replace(/[^\d.\-]/g, "");
    if (!normalized) return null;

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const parseBaseCurrencyValue = (value: string) => {
    const parsed = parseNumber(value);
    if (parsed === null) return null;

    return convertToBaseCurrency(parsed, currency, rates);
  };

  // Builds the value/onFocus/onBlur/onChange props for a decimal-money field.
  // While the field is focused we show exactly what the user typed (rawValue),
  // so intermediate states like "12." or "-" or "0.50" aren't reformatted away
  // mid-keystroke. On blur we drop back to the formatted display value.
  const decimalFieldProps = (field: DecimalFieldKey, value: number | null) => {
    const isEditing = editingField === field;

    return {
      value: isEditing ? rawValue : formatNumber(value),
      onFocus: () => {
        setEditingField(field);
        setRawValue(
          value !== null && !Number.isNaN(value)
            ? String(convertFromBaseCurrency(value, currency, rates))
            : "",
        );
      },
      onBlur: () => {
        setEditingField(null);
      },
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value;

        // Only allow an optional leading minus, digits, and a single decimal point
        if (!/^-?\d*\.?\d*$/.test(raw)) return;

        setRawValue(raw);

        if (raw === "" || raw === "." || raw === "-") {
          onChange(field, null);
          return;
        }

        const parsed = parseBaseCurrencyValue(raw);
        if (parsed !== null) {
          onChange(field, parsed);
        }
      },
    };
  };

  const hasImages =
    state.imageUrlsText.trim().length > 0 || state.existingImageIds.length > 0;
  const isStatusError =
    errors?.status === "Product must have at least one image to be published" ||
    errors?.status === "Product must have stock to be published";

  return (
    <Grid container spacing={2.5}>
      {/* Status warning when trying to publish without images */}
      {state.status === "published" && !hasImages && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="warning" sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight={500}>
              ⚠️ Product cannot be published without images
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Please upload at least one image before publishing.
            </Typography>
          </Alert>
        </Grid>
      )}

      {/* Status warning when trying to publish without stock */}
      {state.status === "published" && state.stockCount <= 0 && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="warning" sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight={500}>
              ⚠️ Product cannot be published without stock
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Please add stock quantity before publishing.
            </Typography>
          </Alert>
        </Grid>
      )}

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="Name"
          value={state.name}
          onChange={(event) => onChange("name", event.target.value)}
          fullWidth
          error={Boolean(getError("name"))}
          helperText={getError("name")}
          variant="outlined"
          sx={{
            bgcolor: "background.paper",
            "& .MuiOutlinedInput-root": {
              borderRadius: 0,
            },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="Slug"
          value={state.slug}
          onChange={(event) => onChange("slug", event.target.value)}
          fullWidth
          error={Boolean(getError("slug"))}
          helperText={getError("slug")}
          variant="outlined"
          sx={{
            bgcolor: "background.paper",
            "& .MuiOutlinedInput-root": {
              borderRadius: 0,
            },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="Price"
          {...decimalFieldProps("price", state.price)}
          fullWidth
          error={Boolean(getError("price"))}
          helperText={getError("price")}
          variant="outlined"
          inputMode="decimal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">{currency}</InputAdornment>
            ),
          }}
          sx={{
            bgcolor: "background.paper",
            "& .MuiOutlinedInput-root": {
              borderRadius: 0,
            },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="Buying Price"
          {...decimalFieldProps("buyingPrice", state.buyingPrice)}
          fullWidth
          error={Boolean(getError("buyingPrice"))}
          helperText={getError("buyingPrice")}
          variant="outlined"
          inputMode="decimal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">{currency}</InputAdornment>
            ),
          }}
          sx={{
            bgcolor: "background.paper",
            "& .MuiOutlinedInput-root": {
              borderRadius: 0,
            },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="Sale Price"
          {...decimalFieldProps("compareAt", state.compareAt)}
          fullWidth
          error={Boolean(getError("compareAt"))}
          helperText={getError("compareAt") || "Optional discount price"}
          variant="outlined"
          inputMode="decimal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">{currency}</InputAdornment>
            ),
          }}
          sx={{
            bgcolor: "background.paper",
            "& .MuiOutlinedInput-root": {
              borderRadius: 0,
            },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <AdminField
          label="SKU"
          value={state.sku}
          onChange={(value) => onChange("sku", value)}
          placeholder="e.g., AUR-001"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="Category"
          select
          value={state.categoryId}
          onChange={(event) => onChange("categoryId", event.target.value)}
          fullWidth
          variant="outlined"
          error={Boolean(getError("categoryId"))}
          helperText={getError("categoryId")}
          sx={{
            bgcolor: "background.paper",
            "& .MuiOutlinedInput-root": {
              borderRadius: 0,
            },
          }}
        >
          {categoryOptions.map((category) => (
            <MenuItem key={category.value} value={category.value}>
              {category.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="Status"
          select
          value={state.status}
          onChange={(event) =>
            onChange(
              "status",
              event.target.value as ProductFieldsProps["state"]["status"],
            )
          }
          fullWidth
          variant="outlined"
          error={isStatusError}
          helperText={isStatusError ? getError("status") : ""}
          sx={{
            bgcolor: "background.paper",
            "& .MuiOutlinedInput-root": {
              borderRadius: 0,
            },
          }}
        >
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="published">Published</MenuItem>
          <MenuItem value="archived">Archived</MenuItem>
        </TextField>
        {state.status === "published" && !hasImages && (
          <FormHelperText error sx={{ mt: 0.5 }}>
            Please add images before publishing
          </FormHelperText>
        )}
        {state.status === "published" && state.stockCount <= 0 && (
          <FormHelperText error sx={{ mt: 0.5 }}>
            Please add stock before publishing
          </FormHelperText>
        )}
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AdminField
          label="Short Description"
          value={state.shortDescription}
          onChange={(value) => onChange("shortDescription", value)}
          multiline
          minRows={2}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <AdminField
          label="Colours (Comma Separated)"
          value={state.colorsText}
          onChange={(value) => onChange("colorsText", value)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <AdminField
          label="Sizes (Comma Separated)"
          value={state.sizesText}
          onChange={(value) => onChange("sizesText", value)}
          placeholder="e.g., One Size"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <AdminField
          label="Material"
          value={state.material}
          onChange={(value) => onChange("material", value)}
          placeholder="e.g., Pebbled Calfskin"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <AdminField
          label="Dimensions"
          value={state.dimensions}
          onChange={(value) => onChange("dimensions", value)}
          placeholder="32 x 26 x 14 cm"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label="Stock Quantity"
          type="number"
          value={state.stockCount ?? 0}
          onChange={(event) => {
            const value = parseInt(event.target.value, 10);
            onChange("stockCount", isNaN(value) ? 0 : Math.max(0, value));
          }}
          fullWidth
          variant="outlined"
          error={Boolean(getError("stockCount"))}
          helperText={getError("stockCount")}
          sx={{
            bgcolor: "background.paper",
            "& .MuiOutlinedInput-root": {
              borderRadius: 0,
            },
            "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
              {
                WebkitAppearance: "none",
                margin: 0,
              },
            "& input[type=number]": {
              MozAppearance: "textfield",
            },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <AdminField
          label="Hardware"
          value={state.hardware}
          onChange={(value) => onChange("hardware", value)}
          placeholder="e.g., Gold-tone"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <AdminField
          label="Lining"
          value={state.lining}
          onChange={(value) => onChange("lining", value)}
          placeholder="e.g., Suede"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <AdminField
          label="SEO Title"
          value={state.seoTitle}
          onChange={(value) => onChange("seoTitle", value)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <AdminField
          label="SEO Description"
          value={state.seoDescription}
          onChange={(value) => onChange("seoDescription", value)}
          multiline
          minRows={2}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 12 }}>
        <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mt: 1 }}>
          <AdminToggle
            label="In Stock"
            checked={state.inStock}
            onChange={(checked) => onChange("inStock", checked)}
          />
          <AdminToggle
            label="Featured"
            checked={state.featured}
            onChange={(checked) => onChange("featured", checked)}
          />
          <AdminToggle
            label="Best Seller"
            checked={state.bestSeller}
            onChange={(checked) => onChange("bestSeller", checked)}
          />
          <AdminToggle
            label="New Arrival"
            checked={state.newArrival}
            onChange={(checked) => onChange("newArrival", checked)}
          />
        </Stack>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          label="Description"
          value={state.description}
          onChange={(event) => onChange("description", event.target.value)}
          fullWidth
          multiline
          minRows={2}
          error={Boolean(getError("description"))}
          helperText={getError("description")}
          variant="outlined"
          sx={{
            bgcolor: "background.paper",
            "& .MuiOutlinedInput-root": {
              borderRadius: 0,
            },
          }}
        />
      </Grid>
    </Grid>
  );
};
