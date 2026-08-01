import { Button, MenuItem, Stack, TextField } from "@mui/material";

type EnquiriesFiltersProps = {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onApply: () => void;
};

export const EnquiriesFilters = ({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onApply,
}: EnquiriesFiltersProps) => {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
      <TextField
        label="Search enquiries..."
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
        sx={{ minWidth: 200, bgcolor: "#ffffff" }}
      >
        <MenuItem value="">All statuses</MenuItem>
        <MenuItem value="new">New</MenuItem>
        <MenuItem value="read">Read</MenuItem>
        <MenuItem value="responded">Responded</MenuItem>
        <MenuItem value="archived">Archived</MenuItem>
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
