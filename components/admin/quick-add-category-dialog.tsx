"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { categoryService } from "@/services/categories/category.service";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (category: { id: string | number; name: string }) => void;
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Reused from Product's own form so an admin never has to leave it to
 * create a category — mirrors QuickAddLedgerDialog's role for Category's
 * own Income/Expense ledger fields.
 */
export const QuickAddCategoryDialog = ({ open, onClose, onCreated }: Props) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setName("");
      setSlug("");
      setSlugTouched(false);
      setError("");
    }
  }, [open]);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(name));
    }
  }, [name, slugTouched]);

  const handleSubmit = async () => {
    if (!name.trim() || !slug.trim()) {
      setError("Name and slug are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const response = (await categoryService.createCategory({
        name: name.trim(),
        slug: slug.trim(),
        visible: true,
      })) as { data?: { id: string | number; name: string } };

      if (!response.data) {
        throw new Error("Category creation did not return the new record.");
      }

      onCreated(response.data);
      onClose();
    } catch {
      setError("Failed to create category. The slug may already be in use.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>New Category</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
            fullWidth
          />
          <TextField
            label="Slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving}>
          {saving ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
