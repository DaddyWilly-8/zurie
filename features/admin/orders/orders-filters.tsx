import { Button, MenuItem, Stack, TextField } from "@mui/material";

type Props = {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onApply: () => void;
};

export const OrdersFilters = ({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onApply,
}: Props) => {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
      <TextField
        label="Search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        fullWidth
        sx={{ bgcolor: "#ffffff" }}
      />

      <TextField
        label="Status"
        select
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        sx={{ minWidth: 220, bgcolor: "#ffffff" }}
      >
        <MenuItem value="">All statuses</MenuItem>
        <MenuItem value="new">New</MenuItem>
        <MenuItem value="confirmed">Confirmed</MenuItem>
        <MenuItem value="processing">Processing</MenuItem>
        <MenuItem value="ready_for_delivery">Ready for Delivery</MenuItem>
        <MenuItem value="delivered">Delivered</MenuItem>
        <MenuItem value="cancelled">Cancelled</MenuItem>
      </TextField>

      <Button
        variant="contained"
        onClick={onApply}
        sx={{
          borderRadius: 1,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          fontSize: "0.72rem",
          bgcolor: "#171512",
          "&:hover": { bgcolor: "#2d2a26" },
          px: 4,
        }}
      >
        Apply
      </Button>
    </Stack>
  );
};
