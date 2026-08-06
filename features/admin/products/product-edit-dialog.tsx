import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useMemo, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductFields } from "./product-fields";
import { emptyFormState, toFormState } from "./product-utils";
import { productFormSchema } from "./product-form.schema";
import type { AdminProduct, ProductFormState } from "./types";

type ProductEditDialogProps = {
  product: AdminProduct | null;
  categoryOptions: Array<{ value: string; label: string }>;
  onClose: () => void;
  onSubmit: (productId: string, values: ProductFormState) => Promise<boolean>;
};

export const ProductEditDialog = ({
  product,
  categoryOptions,
  onClose,
  onSubmit,
}: ProductEditDialogProps) => {
  const [submitError, setSubmitError] = useState("");
  const form = useForm<ProductFormState>({
    resolver: zodResolver(productFormSchema) as Resolver<ProductFormState>,
    defaultValues: emptyFormState,
    mode: "onSubmit",
  });

  useEffect(() => {
    if (product) {
      form.reset(toFormState(product));
      setSubmitError("");
    }
  }, [product, form]);

  const values = form.watch();
  const isSubmitting = form.formState.isSubmitting;
  const errors = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(form.formState.errors).map(([key, value]) => [key, value?.message ?? ""]),
      ) as Partial<Record<keyof ProductFormState, string>>,
    [form.formState.errors],
  );

  const changeField = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    form.setValue(key as never, value as never, { shouldDirty: true, shouldValidate: true });
  };

  const submit = form.handleSubmit(async (payload) => {
    if (!product) return;
    setSubmitError("");
    const saved = await onSubmit(String(product.id), payload);
    if (!saved) {
      setSubmitError("Failed to update product.");
    }
  });

  return (
    <Dialog
      open={Boolean(product)}
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
        <Typography variant="h4" textAlign={'center'} component="div" sx={{ color: "text.primary", fontFamily: "var(--font-playfair), serif", lineHeight: 1 }}>
          Edit Product
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={submit} sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
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
          {submitError ? <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert> : null}
          {product ? (
            <ProductFields
              state={values}
              onChange={changeField}
              categoryOptions={categoryOptions}
              errors={errors}
            />
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5, bgcolor: "background.paper", borderTop: "1px solid", borderColor: "divider", flexShrink: 0 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : null}
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
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
