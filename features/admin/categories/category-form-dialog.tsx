import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { AdminField, AdminToggle } from "@/components/admin/admin-field";
import { AdminImageUploader } from "@/components/admin/admin-image-uploader";
import type { CategoryForm } from "./types";

type CategoryFormDialogProps = {
  open: boolean;
  saving: boolean;
  editing: boolean;
  form: CategoryForm;
  onClose: () => void;
  onChange: <K extends keyof CategoryForm>(key: K, value: CategoryForm[K]) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const CategoryFormDialog = ({
  open,
  saving,
  editing,
  form,
  onClose,
  onChange,
  onSubmit,
}: CategoryFormDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 0.5,
          bgcolor: "#fbf8f3",
          border: "1px solid #e6dccb",
          overflow: "hidden",
          width: "min(860px, calc(100vw - 32px))",
          maxHeight: "calc(100vh - 32px)",
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          px: { xs: 2.5, md: 3.5 },
          pt: { xs: 2.5, md: 3 },
          pb: 1,
        }}
      >
        <Typography variant="h4" component="div" sx={{ color: "#171512", fontFamily: "var(--font-playfair), serif", lineHeight: 1 }}>
          {editing ? "Edit Category" : "New Category"}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Close category dialog">
          <FontAwesomeIcon icon={faTimes} size="sm" />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", flexDirection: "column" }}>
        <DialogContent
          dividers
          sx={{
            bgcolor: "#fbf8f3",
            px: { xs: 2.5, md: 3.5 },
            pb: 3,
            pt: 0.5,
            overflowY: "auto",
            "& .MuiInputLabel-root": {
              textTransform: "uppercase",
              letterSpacing: "0.24em",
              fontSize: "0.72rem",
              color: "#7f7467",
            },
            "& .MuiOutlinedInput-root": {
              bgcolor: "#ffffff",
              borderRadius: 0,
            },
          }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdminField label="Name" value={form.name} onChange={(value) => onChange("name", value)} required />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdminField label="Slug" value={form.slug} onChange={(value) => onChange("slug", value)} required />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <AdminField
                label="Description"
                value={form.description}
                onChange={(value) => onChange("description", value)}
                multiline
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <AdminField
                label="Category Image URL"
                value={form.imageUrl}
                onChange={(value) => onChange("imageUrl", value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <AdminImageUploader
                label="Category Image"
                images={form.imageUrl ? [form.imageUrl] : []}
                onChange={(images) => onChange("imageUrl", images[0] ?? "")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdminField
                label="Display Order"
                type="number"
                value={form.sortOrder}
                onChange={(value) => onChange("sortOrder", Number(value) || 0)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" alignItems="center" sx={{ height: "100%" }}>
                <AdminToggle label="Visible" checked={form.visible} onChange={(checked) => onChange("visible", checked)} />
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: "#fbf8f3" }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ borderRadius: 0, textTransform: "uppercase", letterSpacing: "0.3em", fontSize: "0.72rem", borderColor: "#e0d4c1", color: "#171512", px: 3 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{ borderRadius: 0, textTransform: "uppercase", letterSpacing: "0.3em", fontSize: "0.72rem", bgcolor: "#171512", px: 4, "&:hover": { bgcolor: "#2d2a26" } }}
          >
            {saving ? "Saving..." : editing ? "Save Changes" : "Create Category"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
