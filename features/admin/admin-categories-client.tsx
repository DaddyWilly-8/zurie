"use client";

import { useEffect, useState } from "react";
import { Alert, Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import {
  categoryActions,
  CategoriesTable,
  CategoryFormDialog,
  emptyCategoryForm,
  toCategoryForm,
  type Category,
  type CategoryForm,
} from "@/features/admin/categories";

export const AdminCategoriesClient = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyCategoryForm);

  const load = async () => {
    try {
      setLoading(true);
      const categories = await categoryActions.list();
      setItems(categories);
    } catch {
      setMessage("Failed to load categories");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyCategoryForm);
    setOpen(true);
  };

  const openEdit = (item: Category) => {
    setEditing(item);
    setForm(toCategoryForm(item));
    setOpen(true);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      if (editing) {
        await categoryActions.update(editing.id, form);
        setMessage("Category updated successfully");
      } else {
        await categoryActions.create(form);
        setMessage("Category created successfully");
      }
      setMessageType("success");
      setOpen(false);
      await load();
    } catch {
      setMessage(editing ? "Category update failed" : "Category creation failed");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await categoryActions.remove(id);
      setMessage("Category deleted successfully");
      setMessageType("success");
      await load();
    } catch {
      setMessage("Category deletion failed");
      setMessageType("error");
    }
  };

  return (
    <Stack spacing={3.2}>
      {message ? (
        <Alert severity={messageType} onClose={() => setMessage("")} sx={{ borderRadius: 1.5 }}>
          {message}
        </Alert>
      ) : null}
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.2}>
        <Stack spacing={0.3}>
          <Typography sx={{ color: "text.primary", fontSize: { xs: "2rem", md: "2.2rem" } }}>
            Categories
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: "1rem" }}>
            {loading ? "Loading categories..." : `${items.length} categories`}
          </Typography>
        </Stack>

        <Tooltip title="Add Category" arrow>
          <IconButton
            onClick={openNew}
            aria-label="Add Category"
            sx={{
              border: "1px solid",
              borderColor: "divider",
              color: "text.primary",
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {loading ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
          Loading categories...
        </Typography>
      ) : items.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", bgcolor: "background.paper", px: 2, py: 3 }}>
          <Typography color="text.secondary">No categories yet.</Typography>
        </Box>
      ) : (
        <CategoriesTable items={items} onEdit={openEdit} onDelete={removeCategory} />
      )}

      <CategoryFormDialog
        open={open}
        saving={saving}
        editing={Boolean(editing)}
        form={form}
        onClose={() => setOpen(false)}
        onChange={(key, value) => setForm((prev) => ({ ...prev, [key]: value }))}
        onSubmit={handleSave}
      />
    </Stack>
  );
};
