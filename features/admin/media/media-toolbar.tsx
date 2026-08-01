import { Button, Stack, TextField } from "@mui/material";

type Props = {
  search: string;
  folder: string;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onFolderChange: (value: string) => void;
  onSearch: () => void;
  onUpload: (file: File) => void;
};

export const MediaToolbar = ({
  search,
  folder,
  loading,
  onSearchChange,
  onFolderChange,
  onSearch,
  onUpload,
}: Props) => {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
      <TextField
        label="Search Media"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        fullWidth
        sx={{ bgcolor: "#ffffff" }}
      />

      <TextField
        label="Folder"
        value={folder}
        onChange={(event) => onFolderChange(event.target.value)}
        sx={{ minWidth: 200, bgcolor: "#ffffff" }}
      />

      <Button
        variant="outlined"
        onClick={onSearch}
        sx={{
          borderRadius: 1,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          fontSize: "0.72rem",
          borderColor: "#e0d4c1",
          color: "#171512",
        }}
      >
        Search
      </Button>

      <Button
        variant="contained"
        component="label"
        disabled={loading}
        sx={{
          borderRadius: 1,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          fontSize: "0.72rem",
          bgcolor: "#171512",
          "&:hover": { bgcolor: "#2d2a26" },
        }}
      >
        Upload
        <input
          hidden
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onUpload(file);
            }
          }}
        />
      </Button>
    </Stack>
  );
};
