import {
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { AdminField, AdminImageUploader, AdminToggle } from "@/components/admin";
import { parseImageUrls } from "./product-utils";
import type { ProductFieldsProps } from "./types";

export const ProductFields = ({ state, onChange }: ProductFieldsProps) => (
  <Grid container spacing={2.5}>
    <Grid size={{ xs: 12, md: 6 }}>
      <AdminField label="Name" value={state.name} onChange={(value) => onChange("name", value)} required />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <AdminField label="Slug" value={state.slug} onChange={(value) => onChange("slug", value)} required />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <TextField
        label="Price"
        type="number"
        value={state.price}
        onChange={(event) => onChange("price", Number(event.target.value))}
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
        InputProps={{
          startAdornment: <InputAdornment position="start" sx={{ color: "text.secondary" }}>$</InputAdornment>,
        }}
      />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <TextField
        label="Compare At"
        type="number"
        value={state.compareAt}
        onChange={(event) => onChange("compareAt", Number(event.target.value))}
        fullWidth
        variant="outlined"
        sx={{
          bgcolor: "background.paper",
          "& .MuiOutlinedInput-root": {
            borderRadius: 0,
          },
        }}
        InputLabelProps={{ sx: { textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.7rem", color: "text.secondary", fontWeight: 500 } }}
        InputProps={{
          startAdornment: <InputAdornment position="start" sx={{ color: "text.secondary" }}>$</InputAdornment>,
        }}
        helperText="Optional: Original price for sale items"
        FormHelperTextProps={{
          sx: {
            color: "text.secondary",
            fontSize: "0.7rem",
            marginLeft: 0,
          },
        }}
      />
    </Grid>
    <Grid size={{ xs: 12 }}>
      <TextField
        label="Category"
        select
        value={state.category}
        onChange={(event) => onChange("category", event.target.value)}
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
        <MenuItem value="handbags">Handbags</MenuItem>
        <MenuItem value="tote-bags">Tote Bags</MenuItem>
        <MenuItem value="shoulder-bags">Shoulder Bags</MenuItem>
        <MenuItem value="crossbody-bags">Crossbody Bags</MenuItem>
        <MenuItem value="backpacks">Backpacks</MenuItem>
        <MenuItem value="wallets">Wallets</MenuItem>
        <MenuItem value="accessories">Accessories</MenuItem>
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
