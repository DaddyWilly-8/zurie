import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { ProductFields } from "./product-fields";
import { emptyFormState } from "./product-utils";
import type { ProductEdits, ProductFormState } from "./types";

type ProductEditDialogProps = {
  editingId: string | null;
  edits: ProductEdits;
  onClose: () => void;
  onChange: <K extends keyof ProductFormState>(id: string, key: K, value: ProductFormState[K]) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

export const ProductEditDialog = ({
  editingId,
  edits,
  onClose,
  onChange,
  onSubmit,
}: ProductEditDialogProps) => {
  return (
    <Dialog
      open={Boolean(editingId)}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 0,
          bgcolor: "#fbf8f3",
          border: "1px solid #e6dccb",
          overflow: "hidden",
          width: "min(860px, calc(100vw - 32px))",
          maxHeight: "calc(100vh - 32px)",
          position: "relative",
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
          bgcolor: "#fbf8f3",
          borderBottom: "1px solid #e6dccb",
          flexShrink: 0,
        }}
      >
        <Typography variant="h4" component="div" sx={{ color: "#171512", fontFamily: "var(--font-playfair), serif", lineHeight: 1 }}>
          Edit Product
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Close edit dialog" sx={{ color: "#7f7467" }}>
          <FontAwesomeIcon icon={faTimes} size="sm" />
        </IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <DialogContent
          dividers
          sx={{
            bgcolor: "#fbf8f3",
            px: { xs: 2.5, md: 3.5 },
            py: 3,
            overflowY: "auto",
            flex: 1,
            "& .MuiInputLabel-root": {
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontSize: "0.7rem",
              color: "#7f7467",
              fontWeight: 500,
            },
            "& .MuiOutlinedInput-root": {
              bgcolor: "#ffffff",
              borderRadius: 0,
            },
            "& .MuiDialogContent-dividers": {
              borderTop: "none",
              borderBottom: "none",
            },
          }}
        >
          {editingId ? (
            <ProductFields
              state={edits[editingId] ?? emptyFormState}
              onChange={(key, value) => onChange(editingId, key, value)}
            />
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5, bgcolor: "#fbf8f3", borderTop: "1px solid #e6dccb", flexShrink: 0 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: 0,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              fontSize: "0.72rem",
              borderColor: "#e0d4c1",
              color: "#171512",
              px: 3,
              "&:hover": {
                borderColor: "#171512",
                bgcolor: "#f5f0e8",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              borderRadius: 0,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              fontSize: "0.72rem",
              bgcolor: "#171512",
              px: 4,
              "&:hover": { bgcolor: "#2d2a26" },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
