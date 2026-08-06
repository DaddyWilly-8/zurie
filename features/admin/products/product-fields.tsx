"use client";

import {
  Grid,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { AdminField, AdminToggle } from "@/components/admin";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { convertFromBaseCurrency, convertToBaseCurrency } from "@/utils/currency";
import InputAdornment from "@mui/material/InputAdornment";
import type { ProductFieldsProps } from "./types";

export const ProductFields = ({ state, onChange, categoryOptions, errors }: ProductFieldsProps) => {
  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);

  const getError = <K extends keyof ProductFieldsProps["state"]>(key: K) => errors?.[key] ?? "";

  const formatNumber = (value: number | null, options?: { maxFractionDigits?: number }) => {
    if (value === null || Number.isNaN(value)) return "";
    const converted = convertFromBaseCurrency(value, currency, rates);
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: options?.maxFractionDigits ?? (currency === "TZS" ? 0 : 2),
    }).format(converted);
  };

  const parseNumber = (value: string) => {
    const normalized = value.replace(/,/g, "").replace(/[^\d.]/g, "");
    if (!normalized) return null;

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const parseBaseCurrencyValue = (value: string) => {
    const parsed = parseNumber(value);
    if (parsed === null) return null;

    return convertToBaseCurrency(parsed, currency, rates);
  };

  return (
    <Grid container spacing={2.5}>
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
          value={formatNumber(state.price)}
          onChange={(event) => onChange("price", parseBaseCurrencyValue(event.target.value))}
          fullWidth
          error={Boolean(getError("price"))}
          helperText={getError("price")}
          variant="outlined"
          inputMode="decimal"
          InputProps={{
            startAdornment: <InputAdornment position="start">{currency}</InputAdornment>,
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
          value={formatNumber(state.buyingPrice)}
          onChange={(event) => onChange("buyingPrice", parseBaseCurrencyValue(event.target.value))}
          fullWidth
          error={Boolean(getError("buyingPrice"))}
          helperText={getError("buyingPrice")}
          variant="outlined"
          inputMode="decimal"
          InputProps={{
            startAdornment: <InputAdornment position="start">{currency}</InputAdornment>,
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
          value={formatNumber(state.compareAt)}
          onChange={(event) => onChange("compareAt", parseBaseCurrencyValue(event.target.value))}
          fullWidth
          error={Boolean(getError("compareAt"))}
          helperText={getError("compareAt") || "Optional discount price"}
          variant="outlined"
          inputMode="decimal"
          InputProps={{
            startAdornment: <InputAdornment position="start">{currency}</InputAdornment>,
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
          onChange={(event) => onChange("status", event.target.value as ProductFieldsProps["state"]["status"])}
          fullWidth
          variant="outlined"
          error={Boolean(getError("status"))}
          helperText={getError("status")}
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
            "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
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
          <AdminToggle label="In Stock" checked={state.inStock} onChange={(checked) => onChange("inStock", checked)} />
          <AdminToggle label="Featured" checked={state.featured} onChange={(checked) => onChange("featured", checked)} />
          <AdminToggle label="Best Seller" checked={state.bestSeller} onChange={(checked) => onChange("bestSeller", checked)} />
          <AdminToggle label="New Arrival" checked={state.newArrival} onChange={(checked) => onChange("newArrival", checked)} />
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