"use client";

import {
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { AdminField, AdminImageUploader, AdminToggle } from "@/components/admin";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { parseImageUrls } from "./product-utils";
import type { ProductFieldsProps } from "./types";
import { getCurrencySymbol } from "@/utils/currency";

export const ProductFields = ({ state, onChange, categoryOptions }: ProductFieldsProps) => {
  const removeImage = (index: number) => {
    const currentUrls = parseImageUrls(state.imageUrlsText);
    if (index < 0 || index >= currentUrls.length) return;

    const removedImageId = state.existingImageIds[index];
    const nextUrls = currentUrls.filter((_, imageIndex) => imageIndex !== index);
    const nextImageIds = state.existingImageIds.filter((_, imageIndex) => imageIndex !== index);

    onChange("imageUrlsText", nextUrls.join("\n"));
    onChange("existingImageIds", nextImageIds);

    if (removedImageId) {
      onChange("removedImageIds", [...state.removedImageIds, removedImageId]);
    }
  };

  return (
  <Grid container spacing={2.5}>
    <Grid size={{ xs: 12, md: 6 }}>
      <AdminField label="Name" value={state.name} onChange={(value) => onChange("name", value)} required />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <AdminField label="Slug" value={state.slug} onChange={(value) => onChange("slug", value)} required />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <CurrencyInput label="Price" value={state.price} onChange={(value) => onChange("price", value)} required />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <CurrencyInput label="Buying Price" value={state.buyingPrice} onChange={(value) => onChange("buyingPrice", value)} required />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <CurrencyInput
        label="Compare At"
        value={state.compareAt}
        onChange={(value) => onChange("compareAt", value)}
        helperText="Optional: Original price for sale items"
      />
    </Grid>
    <Grid size={{ xs: 12 }}>
      <TextField
        label="Category"
        select
        value={state.categoryId}
        onChange={(event) => onChange("categoryId", event.target.value)}
        fullWidth
        required
        variant="outlined"
        sx={{
          bgcolor: "background.paper",
          "& .MuiOutlinedInput-root": {
            borderRadius: 0,
          },
        }}
        InputLabelProps={{ sx: { textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.7rem", color: "text.secondary", fontWeight: 500 } }}
      >
        {categoryOptions.map((category) => (
          <MenuItem key={category.value} value={category.value}>
            {category.label}
          </MenuItem>
        ))}
      </TextField>
    </Grid>
    <Grid size={{ xs: 12 }}>
      <AdminField
        label="Description"
        value={state.description}
        onChange={(value) => onChange("description", value)}
        multiline
        minRows={4}
        required
      />
    </Grid>
    <Grid size={{ xs: 12 }}>
      <AdminField
        label="Colours (Comma Separated)"
        value={state.colorsText}
        onChange={(value) => onChange("colorsText", value)}
        placeholder="Beige, Black, Tan"
      />
    </Grid>
    <Grid size={{ xs: 12 }}>
      <AdminImageUploader
        label="Product Images"
        images={parseImageUrls(state.imageUrlsText)}
        onChange={(images) => onChange("imageUrlsText", images.join("\n"))}
        onRemoveImage={removeImage}
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
        value={state.stockCount}
        onChange={(event) => onChange("stockCount", Math.max(0, Number(event.target.value) || 0))}
        fullWidth
        variant="outlined"
        sx={{
          bgcolor: "background.paper",
          "& .MuiOutlinedInput-root": {
            borderRadius: 0,
          },
        }}
        InputLabelProps={{ sx: { textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.7rem", color: "text.secondary", fontWeight: 500 } }}
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
    <Grid size={{ xs: 12 }}>
      <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mt: 1 }}>
        <AdminToggle label="In Stock" checked={state.inStock} onChange={(checked) => onChange("inStock", checked)} />
        <AdminToggle label="Featured" checked={state.featured} onChange={(checked) => onChange("featured", checked)} />
        <AdminToggle label="Best Seller" checked={state.bestSeller} onChange={(checked) => onChange("bestSeller", checked)} />
        <AdminToggle label="New Arrival" checked={state.newArrival} onChange={(checked) => onChange("newArrival", checked)} />
      </Stack>
    </Grid>
  </Grid>
  );
};

type CurrencyInputProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
  helperText?: string;
};

const CurrencyInput = ({ label, value, onChange, required, helperText }: CurrencyInputProps) => {
  const currency = useCurrencyStore((state) => state.currency);
  const symbol = getCurrencySymbol(currency);

  return (
    <TextField
      label={label}
      type="number"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      fullWidth
      required={required}
      variant="outlined"
      sx={{
        bgcolor: "background.paper",
        "& .MuiOutlinedInput-root": {
          borderRadius: 0,
        },
      }}
      InputLabelProps={{ sx: { textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.7rem", color: "text.secondary", fontWeight: 500 } }}
      InputProps={{
        startAdornment: <InputAdornment position="start" sx={{ color: "text.secondary" }}>{symbol}</InputAdornment>,
      }}
      helperText={helperText}
      FormHelperTextProps={helperText ? { sx: { color: "text.secondary", fontSize: "0.7rem", marginLeft: 0 } } : undefined}
    />
  );
};
