"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClone, faTrash } from "@fortawesome/free-solid-svg-icons";
import { productService } from "@/services/products/product.service";

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  sale_price?: number | null;
  sku?: string;
  status?: "draft" | "published" | "out_of_stock" | "archived";
  material?: string;
  seo_title?: string;
  seo_description?: string;
  featured_image_url?: string;
  category: string;
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  in_stock: boolean;
  stock_count: number;
  colors: Array<{ name: string; hex: string }>;
  sizes: string[];
  specifications: string[];
  product_images: Array<{
    id: string;
    url: string;
    alt_text: string;
    is_primary: boolean;
  }>;
};

type ProductFormState = {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  salePrice: number;
  sku: string;
  status: "draft" | "published" | "out_of_stock" | "archived";
  material: string;
  seoTitle: string;
  seoDescription: string;
  featuredImageUrl: string;
  category: string;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  inStock: boolean;
  stockCount: number;
  imageUrlsText: string;
  colorsText: string;
  sizesText: string;
  specificationsText: string;
};

const emptyFormState: ProductFormState = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  price: 0,
  salePrice: 0,
  sku: "",
  status: "draft",
  material: "",
  seoTitle: "",
  seoDescription: "",
  featuredImageUrl: "",
  category: "handbags",
  featured: false,
  bestSeller: false,
  newArrival: false,
  inStock: true,
  stockCount: 1,
  imageUrlsText: "",
  colorsText: "Black|#111111",
  sizesText: "One Size",
  specificationsText: "Premium finish",
};

type ProductEdits = Record<string, ProductFormState>;

const parseList = (value: string) =>
  value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const parseImageUrls = (value: string) => parseList(value);

const parseColors = (value: string) => {
  const colors = parseList(value)
    .map((item) => {
      const [nameRaw, hexRaw] = item.split("|");
      const name = (nameRaw ?? "").trim();
      const hex = (hexRaw ?? "").trim();
      if (!name || !hex) return null;
      return { name, hex };
    })
    .filter((item): item is { name: string; hex: string } => item !== null);

  return colors.length ? colors : [{ name: "Black", hex: "#111111" }];
};

const toFormState = (product: AdminProduct): ProductFormState => ({
  name: product.name,
  slug: product.slug,
  description: product.description,
  shortDescription: product.short_description ?? "",
  price: product.price,
  salePrice: product.sale_price ?? 0,
  sku: product.sku ?? "",
  status: product.status ?? "published",
  material: product.material ?? "",
  seoTitle: product.seo_title ?? "",
  seoDescription: product.seo_description ?? "",
  featuredImageUrl: product.featured_image_url ?? "",
  category: product.category,
  featured: product.featured,
  bestSeller: product.best_seller,
  newArrival: product.new_arrival,
  inStock: product.in_stock,
  stockCount: product.stock_count,
  imageUrlsText: product.product_images.map((item) => item.url).join("\n"),
  colorsText: product.colors.map((item) => `${item.name}|${item.hex}`).join("\n"),
  sizesText: product.sizes.join(", "),
  specificationsText: product.specifications.join("\n"),
});

const toPayload = (state: ProductFormState) => ({
  name: state.name.trim(),
  slug: state.slug.trim(),
  description: state.description.trim(),
  shortDescription: state.shortDescription.trim(),
  price: Number(state.price),
  salePrice: Number(state.salePrice) > 0 ? Number(state.salePrice) : null,
  sku: state.sku.trim(),
  status: state.status,
  material: state.material.trim(),
  seoTitle: state.seoTitle.trim(),
  seoDescription: state.seoDescription.trim(),
  featuredImageUrl: state.featuredImageUrl.trim() || undefined,
  category: state.category.trim(),
  featured: state.featured,
  bestSeller: state.bestSeller,
  newArrival: state.newArrival,
  inStock: state.inStock,
  stockCount: Number(state.stockCount),
  colors: parseColors(state.colorsText),
  sizes: parseList(state.sizesText),
  specifications: parseList(state.specificationsText),
  imageUrls: parseImageUrls(state.imageUrlsText),
});

export const AdminProductsClient = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [edits, setEdits] = useState<ProductEdits>({});
  const [isLoading, setIsLoading] = useState(true);
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<ProductFormState>(emptyFormState);

  const loadProducts = async () => {
    const productList = (await productService.listAdminProducts()) as AdminProduct[];
    setProducts(productList);
    setEdits(
      Object.fromEntries(productList.map((item) => [item.id, toFormState(item)])),
    );
    setIsLoading(false);
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const createProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await productService.createProduct(toPayload(form));
      setForm(emptyFormState);
      setMessageType("success");
      setMessage("Product created.");
      await loadProducts();
    } catch {
      setMessageType("error");
      setMessage("Failed to create product.");
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.deleteProduct(id);
      setMessageType("success");
      setMessage("Product removed.");
    } catch {
      setMessageType("error");
      setMessage("Failed to remove product.");
    }
    await loadProducts();
  };

  const saveProduct = async (id: string) => {
    const edit = edits[id];
    if (!edit) return;

    try {
      await productService.updateProduct(id, toPayload(edit));
      setMessageType("success");
      setMessage("Product updated.");
    } catch {
      setMessageType("error");
      setMessage("Failed to update product.");
    }
    await loadProducts();
  };

  const duplicateProduct = async (id: string) => {
    try {
      await productService.duplicateProduct(id);
      setMessageType("success");
      setMessage("Product duplicated.");
    } catch {
      setMessageType("error");
      setMessage("Failed to duplicate product.");
    }
    await loadProducts();
  };

  const updateEditField = <K extends keyof ProductFormState>(
    id: string,
    key: K,
    value: ProductFormState[K],
  ) => {
    setEdits((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? emptyFormState),
        [key]: value,
      },
    }));
  };

  return (
    <Stack spacing={3}>
      {message ? <Alert severity={messageType}>{message}</Alert> : null}

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add Product (Future Dynamic Catalog)
          </Typography>
          <Box component="form" onSubmit={createProduct}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Slug"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, slug: e.target.value }))
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  fullWidth
                  multiline
                  minRows={3}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Short Description"
                  value={form.shortDescription}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, shortDescription: e.target.value }))
                  }
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Price"
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, price: Number(e.target.value) }))
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Sale Price"
                  type="number"
                  value={form.salePrice}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, salePrice: Number(e.target.value) }))
                  }
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="SKU"
                  value={form.sku}
                  onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Category"
                  value={form.category}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, category: e.target.value }))
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Status"
                  select
                  value={form.status}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, status: e.target.value as ProductFormState["status"] }))
                  }
                  fullWidth
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Material"
                  value={form.material}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, material: e.target.value }))
                  }
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Stock Count"
                  type="number"
                  value={form.stockCount}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      stockCount: Number(e.target.value),
                    }))
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Featured Image URL"
                  value={form.featuredImageUrl}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, featuredImageUrl: e.target.value }))
                  }
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Image URLs (new line separated)"
                  value={form.imageUrlsText}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, imageUrlsText: e.target.value }))
                  }
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="SEO Title"
                  value={form.seoTitle}
                  onChange={(e) => setForm((p) => ({ ...p, seoTitle: e.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="SEO Description"
                  value={form.seoDescription}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, seoDescription: e.target.value }))
                  }
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Colors (Name|#Hex)"
                  value={form.colorsText}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, colorsText: e.target.value }))
                  }
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Sizes (comma/new line)"
                  value={form.sizesText}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sizesText: e.target.value }))
                  }
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Specifications (comma/new line)"
                  value={form.specificationsText}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, specificationsText: e.target.value }))
                  }
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={2}>
                  <Stack direction="row" alignItems="center">
                    <Checkbox
                      checked={form.featured}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, featured: e.target.checked }))
                      }
                    />
                    <Typography>Featured</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center">
                    <Checkbox
                      checked={form.bestSeller}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, bestSeller: e.target.checked }))
                      }
                    />
                    <Typography>Best Seller</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center">
                    <Checkbox
                      checked={form.newArrival}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, newArrival: e.target.checked }))
                      }
                    />
                    <Typography>New Arrival</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center">
                    <Checkbox
                      checked={form.inStock}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, inStock: e.target.checked }))
                      }
                    />
                    <Typography>In Stock</Typography>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Create Product
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Edit Existing Products
          </Typography>
          <Stack spacing={2}>
            {isLoading ? <Alert severity="info">Loading products...</Alert> : null}
            {!isLoading && products.length === 0 ? (
              <Alert severity="info">No products yet.</Alert>
            ) : null}
            {products.map((item) => {
              const edit = edits[item.id] ?? toFormState(item);

              return (
                <Box
                  key={item.id}
                  sx={{ border: "1px solid #ece5da", borderRadius: 3, p: 2 }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1}
                    sx={{ mb: 1.8 }}
                  >
                    <Box>
                      <Typography fontWeight={700}>{item.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {item.id}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        color="primary"
                        onClick={() => duplicateProduct(item.id)}
                        aria-label="Duplicate product"
                      >
                        <FontAwesomeIcon icon={faClone} />
                      </IconButton>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => saveProduct(item.id)}
                      >
                        Save Changes
                      </Button>
                      <IconButton
                        color="error"
                        onClick={() => deleteProduct(item.id)}
                        aria-label="Delete product"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Grid container spacing={1.4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Name"
                        value={edit.name}
                        onChange={(event) =>
                          updateEditField(item.id, "name", event.target.value)
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Slug"
                        value={edit.slug}
                        onChange={(event) =>
                          updateEditField(item.id, "slug", event.target.value)
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Description"
                        value={edit.description}
                        onChange={(event) =>
                          updateEditField(item.id, "description", event.target.value)
                        }
                        fullWidth
                        multiline
                        minRows={2}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Short Description"
                        value={edit.shortDescription}
                        onChange={(event) =>
                          updateEditField(item.id, "shortDescription", event.target.value)
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        label="Price"
                        type="number"
                        value={edit.price}
                        onChange={(event) =>
                          updateEditField(item.id, "price", Number(event.target.value))
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        label="Sale Price"
                        type="number"
                        value={edit.salePrice}
                        onChange={(event) =>
                          updateEditField(item.id, "salePrice", Number(event.target.value))
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        label="SKU"
                        value={edit.sku}
                        onChange={(event) =>
                          updateEditField(item.id, "sku", event.target.value)
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        label="Stock"
                        type="number"
                        value={edit.stockCount}
                        onChange={(event) =>
                          updateEditField(item.id, "stockCount", Number(event.target.value))
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Status"
                        select
                        value={edit.status}
                        onChange={(event) =>
                          updateEditField(item.id, "status", event.target.value as ProductFormState["status"])
                        }
                        fullWidth
                      >
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                        <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                        <MenuItem value="archived">Archived</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Material"
                        value={edit.material}
                        onChange={(event) =>
                          updateEditField(item.id, "material", event.target.value)
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Category"
                        value={edit.category}
                        onChange={(event) =>
                          updateEditField(item.id, "category", event.target.value)
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Featured Image URL"
                        value={edit.featuredImageUrl}
                        onChange={(event) =>
                          updateEditField(item.id, "featuredImageUrl", event.target.value)
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Image URLs (new line separated)"
                        value={edit.imageUrlsText}
                        onChange={(event) =>
                          updateEditField(item.id, "imageUrlsText", event.target.value)
                        }
                        fullWidth
                        multiline
                        minRows={3}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="SEO Title"
                        value={edit.seoTitle}
                        onChange={(event) =>
                          updateEditField(item.id, "seoTitle", event.target.value)
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="SEO Description"
                        value={edit.seoDescription}
                        onChange={(event) =>
                          updateEditField(item.id, "seoDescription", event.target.value)
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        label="Colors (Name|#Hex)"
                        value={edit.colorsText}
                        onChange={(event) =>
                          updateEditField(item.id, "colorsText", event.target.value)
                        }
                        fullWidth
                        multiline
                        minRows={3}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        label="Sizes (comma/new line)"
                        value={edit.sizesText}
                        onChange={(event) =>
                          updateEditField(item.id, "sizesText", event.target.value)
                        }
                        fullWidth
                        multiline
                        minRows={3}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        label="Specifications (comma/new line)"
                        value={edit.specificationsText}
                        onChange={(event) =>
                          updateEditField(item.id, "specificationsText", event.target.value)
                        }
                        fullWidth
                        multiline
                        minRows={3}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                        <Stack direction="row" alignItems="center">
                          <Checkbox
                            checked={edit.featured}
                            onChange={(event) =>
                              updateEditField(item.id, "featured", event.target.checked)
                            }
                          />
                          <Typography variant="caption">Featured</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center">
                          <Checkbox
                            checked={edit.bestSeller}
                            onChange={(event) =>
                              updateEditField(item.id, "bestSeller", event.target.checked)
                            }
                          />
                          <Typography variant="caption">Best Seller</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center">
                          <Checkbox
                            checked={edit.newArrival}
                            onChange={(event) =>
                              updateEditField(item.id, "newArrival", event.target.checked)
                            }
                          />
                          <Typography variant="caption">New Arrival</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center">
                          <Checkbox
                            checked={edit.inStock}
                            onChange={(event) =>
                              updateEditField(item.id, "inStock", event.target.checked)
                            }
                          />
                          <Typography variant="caption">In Stock</Typography>
                        </Stack>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};
