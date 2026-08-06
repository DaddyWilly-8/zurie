"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  IconButton,
  InputAdornment,
  Pagination,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { categoryService } from "@/services/categories/category.service";
import { AdminFeedbackSnackbar } from "@/components/admin";
import {
  productActions,
  ProductCreateDialog,
  ProductEditDialog,
  ProductsTable,
  type AdminProduct,
  type ProductFormState,
} from "@/features/admin/products";

const PRODUCTS_PAGE_SIZE = 10;

export const AdminProductsClient = () => {
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [message, setMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-products"],
    queryFn: productActions.list,
  });

  const {
    data: editingProductDetails,
  } = useQuery({
    queryKey: ["admin-product", editingId],
    queryFn: () => productActions.getById(editingId!),
    enabled: Boolean(editingId),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-product-categories"],
    queryFn: categoryService.listAdminCategories,
  });

  const categoryOptions = useMemo(
    () => categories.map((item) => ({ value: String(item.id), label: item.name })),
    [categories],
  );

  const createProduct = async (values: ProductFormState) => {
    try {
      await productActions.create(values);
      setMessageType("success");
      setMessage("Product created successfully.");
      await refetch();
      return true;
    } catch {
      setMessageType("error");
      setMessage("Failed to create product.");
      return false;
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await productActions.remove(id);
      setMessageType("success");
      setMessage("Product removed successfully.");
      await refetch();
    } catch {
      setMessageType("error");
      setMessage("Failed to remove product.");
    }
  };

  const saveProduct = async (id: string, values: ProductFormState) => {
    try {
      await productActions.update(id, values);
      setMessageType("success");
      setMessage("Product updated successfully.");
      await refetch();
      return true;
    } catch {
      setMessageType("error");
      setMessage("Failed to update product.");
      return false;
    }
  };

  const duplicateProduct = async (id: string) => {
    try {
      await productActions.duplicate(id);
      setMessageType("success");
      setMessage("Product duplicated successfully.");
      await refetch();
    } catch {
      setMessageType("error");
      setMessage("Failed to duplicate product.");
    }
  };

  const uploadProductImages = async (id: string, files: File[]) => {
    try {
      await productActions.uploadImages(id, files);
      setMessageType("success");
      setMessage("Images uploaded successfully.");
      await refetch();
      return true;
    } catch {
      setMessageType("error");
      setMessage("Failed to upload images.");
      return false;
    }
  };

  const deleteProductImage = async (id: string, imageId: string) => {
    try {
      await productActions.deleteImage(id, imageId);
      setMessageType("success");
      setMessage("Image removed successfully.");
      await refetch();
      return true;
    } catch {
      setMessageType("error");
      setMessage("Failed to remove image.");
      return false;
    }
  };

  const editingProduct = useMemo(
    () => editingProductDetails ?? products.find((item) => item.id === editingId) ?? null,
    [editingProductDetails, products, editingId],
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((item) => {
        const categoryLabel =
          categoryOptions.find((category) => category.value === String(item.category_id ?? item.category ?? ""))?.label ??
          item.category;
        const text = `${item.name} ${categoryLabel} ${item.slug}`.toLowerCase();
        return text.includes(query.trim().toLowerCase());
      }),
    [products, query, categoryOptions],
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PAGE_SIZE)),
    [filteredProducts.length],
  );

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PRODUCTS_PAGE_SIZE;
    return filteredProducts.slice(start, start + PRODUCTS_PAGE_SIZE);
  }, [filteredProducts, page]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <Stack spacing={3}>
      <AdminFeedbackSnackbar
        open={Boolean(message)}
        message={message}
        severity={messageType}
        onClose={() => setMessage("")}
      />
      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 1.5, border: "1px solid", borderColor: "divider", boxShadow: "none", bgcolor: "background.paper" }}>
        <Stack spacing={2.5}>
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
            {!isAdding && (
              <Tooltip title="Add Product" arrow>
                <IconButton
                  onClick={() => setIsAdding(true)}
                  aria-label="Add Product"
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
            )}
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <TextField
              placeholder="Search products..."
              value={query}
              size="small"
              onChange={(event) => setQuery(event.target.value)}
              sx={{
                width: { xs: "100%", md: 275 },
                mb: 1,
                bgcolor: "background.default",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 0,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ flex: 1 }} />
          </Stack>
        </Stack>

        <ProductCreateDialog
          open={isAdding}
          categoryOptions={categoryOptions}
          onClose={() => setIsAdding(false)}
          onSubmit={async (values) => {
            const created = await createProduct(values);
            if (created) {
              setIsAdding(false);
            }
            return created;
          }}
        />

        {isLoading ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>Loading products...</Typography>
        ) : isError ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography color="error.main">Failed to load products.</Typography>
          </Box>
        ) : filteredProducts.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography color="text.secondary">No products yet.</Typography>
            <Typography variant="caption" color="text.secondary">Use the add icon on the top right to create your first product.</Typography>
          </Box>
        ) : (
          <>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: "block", md: "none" }, mb: 1 }}
            >
              Swipe left/right to view full table.
            </Typography>
            <ProductsTable
              products={paginatedProducts}
              categoryOptions={categoryOptions}
              onEdit={(id) => setEditingId((current) => (current === id ? null : id))}
              onDuplicate={duplicateProduct}
              onDelete={deleteProduct}
              onUploadImages={uploadProductImages}
              onDeleteImage={deleteProductImage}
            />
            {filteredProducts.length > PRODUCTS_PAGE_SIZE ? (
              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
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

        <ProductEditDialog
          product={editingProduct}
          categoryOptions={categoryOptions}
          onClose={() => setEditingId(null)}
          onSubmit={async (productId, values) => {
            const updated = await saveProduct(productId, values);
            if (updated) {
              setEditingId(null);
            }
            return updated;
          }}
        />
      </Paper>
    </Stack>
  );
};
