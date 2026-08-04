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
import type { ProductFormState } from "./types";

type ProductCreateDialogProps = {
  open: boolean;
  form: ProductFormState;
  categoryOptions: Array<{ value: string; label: string }>;
  onClose: () => void;
  onChange: <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

export const ProductCreateDialog = ({
  open,
  form,
  categoryOptions,
  onClose,
  onChange,
  onSubmit,
}: ProductCreateDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 0,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
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
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Typography variant="h4" component="div" sx={{ color: "text.primary", fontFamily: "var(--font-playfair), serif", lineHeight: 1 }}>
          New Product
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Close add dialog" sx={{ color: "text.secondary" }}>
          <FontAwesomeIcon icon={faTimes} size="sm" />
        </IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <DialogContent
          dividers
          sx={{
            bgcolor: "background.paper",
            px: { xs: 2.5, md: 3.5 },
            py: 3,
            overflowY: "auto",
            flex: 1,
            "& .MuiInputLabel-root": {
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontSize: "0.7rem",
              color: "text.secondary",
              fontWeight: 500,
            },
            "& .MuiOutlinedInput-root": {
              bgcolor: "background.paper",
              borderRadius: 0,
            },
            "& .MuiDialogContent-dividers": {
              borderTop: "none",
              borderBottom: "none",
            },
          }}
        >
          <ProductFields state={form} onChange={onChange} categoryOptions={categoryOptions} />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5, bgcolor: "background.paper", borderTop: "1px solid", borderColor: "divider", flexShrink: 0 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: 0,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              fontSize: "0.72rem",
              borderColor: "divider",
              color: "text.primary",
              px: 3,
              "&:hover": {
                borderColor: "text.primary",
                bgcolor: "action.hover",
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
              bgcolor: "text.primary",
              px: 4,
              "&:hover": { bgcolor: "text.secondary" },
            }}
          >
            Create Product
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
