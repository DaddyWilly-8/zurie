"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, IconButton, Pagination, Stack, Tooltip, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { AdminFeedbackSnackbar } from "@/components/admin";
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
  const CATEGORIES_PAGE_SIZE = 9;
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyCategoryForm);
  const [page, setPage] = useState(1);

  const {
    data: items = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: categoryActions.list,
  });

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
      await refetch();
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
      await refetch();
    } catch {
      setMessage("Category deletion failed");
      setMessageType("error");
    }
  };

  const uploadCategoryImage = async (id: string, dataUrl: string) => {
    try {
      await categoryActions.uploadImage(id, dataUrl);
      setMessage("Category image updated successfully");
      setMessageType("success");
      await refetch();
    } catch {
      setMessage("Failed to update category image");
      setMessageType("error");
    }
  };

  const removeCategoryImage = async (id: string) => {
    try {
      await categoryActions.removeImage(id);
      setMessage("Category image removed successfully");
      setMessageType("success");
      await refetch();
    } catch {
      setMessage("Failed to remove category image");
      setMessageType("error");
    }
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / CATEGORIES_PAGE_SIZE)),
    [items.length],
  );

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * CATEGORIES_PAGE_SIZE;
    return items.slice(start, start + CATEGORIES_PAGE_SIZE);
  }, [items, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <Stack spacing={3.2}>
      <AdminFeedbackSnackbar
        open={Boolean(message)}
        message={message}
        severity={messageType}
        onClose={() => setMessage("")}
      />
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.2}>
        <Stack spacing={0.3}>
          <Typography sx={{ color: "text.primary", fontSize: { xs: "2rem", md: "2.2rem" } }}>
            Categories
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: "1rem" }}>
            {isLoading ? "Loading categories..." : `${items.length} categories`}
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

      {isLoading ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
          Loading categories...
        </Typography>
      ) : isError ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", bgcolor: "background.paper", px: 2, py: 3 }}>
          <Typography color="error.main">Failed to load categories.</Typography>
        </Box>
      ) : items.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", bgcolor: "background.paper", px: 2, py: 3 }}>
          <Typography color="text.secondary">No categories yet.</Typography>
        </Box>
      ) : (
        <>
          <CategoriesTable
            items={paginatedItems}
            onEdit={openEdit}
            onDelete={removeCategory}
            onUploadImage={uploadCategoryImage}
            onRemoveImage={removeCategoryImage}
          />
          {items.length > CATEGORIES_PAGE_SIZE ? (
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Stack>
          ) : null}
        </>
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
