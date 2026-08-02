"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import {
  emptyFormState,
  productActions,
  ProductCreateDialog,
  ProductEditDialog,
  ProductsTable,
  toFormState,
  type AdminProduct,
  type ProductEdits,
  type ProductFormState,
} from "@/features/admin/products";

export const AdminProductsClient = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [edits, setEdits] = useState<ProductEdits>({});
  const [isLoading, setIsLoading] = useState(true);
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<ProductFormState>(emptyFormState);
  const [isAdding, setIsAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      const productList = await productActions.list();
      setProducts(productList);
      setEdits(Object.fromEntries(productList.map((item) => [item.id, toFormState(item)])));
    } catch {
      setMessage("Failed to load products");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const createProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await productActions.create(form);
      setForm(emptyFormState);
      setMessageType("success");
      setMessage("Product created successfully.");
      await loadProducts();
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
      await loadProducts();
    } catch {
      setMessageType("error");
      setMessage("Failed to remove product.");
    }
  };

  const saveProduct = async (id: string) => {
    const edit = edits[id];
    if (!edit) return false;

    try {
      await productActions.update(id, edit);
      setMessageType("success");
      setMessage("Product updated successfully.");
      await loadProducts();
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
      await loadProducts();
    } catch {
      setMessageType("error");
      setMessage("Failed to duplicate product.");
    }
  };

  const updateEditField = <K extends keyof ProductFormState>(id: string, key: K, value: ProductFormState[K]) => {
    setEdits((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? emptyFormState),
        [key]: value,
      },
    }));
  };

  const filteredProducts = products.filter((item) => {
    const text = `${item.name} ${item.category} ${item.slug}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  });

  return (
    <Stack spacing={3}>
      {message ? <Alert severity={messageType} onClose={() => setMessage("")}>{message}</Alert> : null}

      <Paper sx={{ p: 3, borderRadius: 1.5, border: "1px solid", borderColor: "divider", boxShadow: "none", bgcolor: "background.paper" }}>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="overline" sx={{ letterSpacing: "0.24em", color: "primary.main" }}>Dashboard</Typography>
              <Typography variant="h6" sx={{ color: "text.primary" }}>Products</Typography>
            </Stack>
            {!isAdding && (
              <Button
                variant="contained"
                startIcon={<FontAwesomeIcon icon={faPlus} size="sm" />}
                onClick={() => setIsAdding(true)}
                sx={{
                  borderRadius: 1,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  fontSize: "0.72rem",
                  bgcolor: "text.primary",
                  px: 2.5,
                  "&:hover": { bgcolor: "text.secondary" },
                }}
              >
                Add Product
              </Button>
            )}
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <TextField
              placeholder="Search products..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              sx={{
                width: { xs: "100%", md: 275 },
                bgcolor: "background.default",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 0,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FontAwesomeIcon icon={faSearch} size="sm" style={{ color: "currentColor" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ flex: 1 }} />
          </Stack>
        </Stack>

        <ProductCreateDialog
          open={isAdding}
          form={form}
          onClose={() => setIsAdding(false)}
          onChange={(key, value) => setForm((prev) => ({ ...prev, [key]: value }))}
          onSubmit={async (event) => {
            const created = await createProduct(event);
            if (created) {
              setIsAdding(false);
            }
          }}
        />

        {isLoading ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>Loading products...</Typography>
        ) : filteredProducts.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography color="text.secondary">No products yet.</Typography>
            <Typography variant="caption" color="text.secondary">Click the &quot;Add Product&quot; button to create your first product.</Typography>
          </Box>
        ) : (
          <ProductsTable
            products={filteredProducts}
            onEdit={(id) => setEditingId((current) => (current === id ? null : id))}
            onDuplicate={duplicateProduct}
            onDelete={deleteProduct}
          />
        )}

        <ProductEditDialog
          editingId={editingId}
          edits={edits}
          onClose={() => setEditingId(null)}
          onChange={updateEditField}
          onSubmit={async (event) => {
            event.preventDefault();
            if (!editingId) return;

            const updated = await saveProduct(editingId);
            if (updated) {
              setEditingId(null);
            }
          }}
        />
      </Paper>
    </Stack>
  );
};
