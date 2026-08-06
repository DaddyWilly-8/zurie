import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductFields } from "./product-fields";
import { productFormSchema } from "./product-form.schema";
import { emptyFormState } from "./product-utils";
import type { ProductFormState } from "./types";

type ProductCreateDialogProps = {
  open: boolean;
  categoryOptions: Array<{ value: string; label: string }>;
  onClose: () => void;
  onSubmit: (values: ProductFormState) => Promise<boolean>;
};

export const ProductCreateDialog = ({
  open,
  categoryOptions,
  onClose,
  onSubmit,
}: ProductCreateDialogProps) => {
  const [submitError, setSubmitError] = useState("");
  const form = useForm<ProductFormState>({
    resolver: zodResolver(productFormSchema) as Resolver<ProductFormState>,
    defaultValues: emptyFormState,
    mode: "onSubmit",
  });

  useEffect(() => {
    if (open) {
      form.reset(emptyFormState);
      setSubmitError("");
    }
  }, [open, form]);

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
    setSubmitError("");
    const created = await onSubmit(payload);
    if (created) {
      form.reset(emptyFormState);
    } else {
      setSubmitError("Failed to create product.");
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
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
        <Typography variant="h4" textAlign="center" component="div" sx={{ color: "text.primary", fontFamily: "var(--font-playfair), serif", lineHeight: 1 }}>
          New Product
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
          <ProductFields
            state={values}
            onChange={changeField}
            categoryOptions={categoryOptions}
            errors={errors}
          />
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
            {isSubmitting ? "Creating..." : "Create Product"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
