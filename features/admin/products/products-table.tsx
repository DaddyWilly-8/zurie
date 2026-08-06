import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Collapse,
  Paper,
  Divider,
} from "@mui/material";
import { Fragment, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faChevronRight, 
  faChevronDown, 
  faClone, 
  faImage, 
  faPencil, 
  faTrash,
  faStar,
  faFire,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { formatBaseCurrencyInCurrency } from "@/utils/currency";
import type { AdminProduct } from "./types";

type ProductsTableProps = {
  products: AdminProduct[];
  categoryOptions: Array<{ value: string; label: string }>;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onUploadImages: (id: string, files: File[]) => Promise<boolean>;
  onDeleteImage: (id: string, imageId: string) => Promise<boolean>;
};

export const ProductsTable = ({ 
  products, 
  categoryOptions, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onUploadImages, 
  onDeleteImage 
}: ProductsTableProps) => {
  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [activeImageTab, setActiveImageTab] = useState(0);

  const categoryLabelByValue = new Map(categoryOptions.map((item) => [item.value, item.label]));

  const getStockLabel = (item: AdminProduct) => {
    const status = item.stock_status ?? (item.in_stock ? "IN_STOCK" : "OUT_OF_STOCK");
    if (status === "LOW_STOCK") return "Low Stock";
    if (status === "OUT_OF_STOCK") return "Out of Stock";
    return "In Stock";
  };

  const getStockColor = (item: AdminProduct) => {
    const status = item.stock_status ?? (item.in_stock ? "IN_STOCK" : "OUT_OF_STOCK");
    if (status === "LOW_STOCK") return "warning";
    if (status === "OUT_OF_STOCK") return "error";
    return "success";
  };

  const getProductImageUrls = (item: AdminProduct) => {
    const urls = [
      ...(item.images ?? []).map((image) => image.url),
      ...(item.imageUrls ?? []),
      ...(item.product_images ?? []).map((image) => image.url),
    ].filter((url): url is string => Boolean(url));

    if (urls.length) return urls;
    return [item.featuredImageUrl ?? item.featured_image_url].filter((url): url is string => Boolean(url));
  };

  const getProductImageEntries = (item: AdminProduct) => {
    const managedImages = (item.images ?? []).map((image) => ({
      id: String(image.id),
      url: image.url,
    }));

    if (managedImages.length) return managedImages;
    return (item.imageUrls ?? []).map((url) => ({ id: "", url }));
  };

  const toggleExpand = (productId: string, event?: React.MouseEvent) => {
    // Prevent toggle if clicking on action buttons
    if (event) {
      const target = event.target as HTMLElement;
      const isActionButton = target.closest('[data-action="edit"]') || 
                             target.closest('[data-action="duplicate"]') || 
                             target.closest('[data-action="delete"]') ||
                             target.closest('[data-action="upload"]');
      if (isActionButton) return;
    }
    
    setExpandedProductId((current) => (current === productId ? null : productId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "success";
      case "draft": return "warning";
      case "archived": return "error";
      default: return "default";
    }
  };

  return (
    <Card sx={{ 
      boxShadow: "none", 
      border: "1px solid", 
      borderColor: "divider", 
      bgcolor: "background.paper",
      borderRadius: 2,
    }}>
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <TableContainer
          sx={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            "&::-webkit-scrollbar": { height: 8 },
            "&::-webkit-scrollbar-thumb": { backgroundColor: "divider", borderRadius: 1 },
          }}
        >
          <Table sx={{ minWidth: 860 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f6f2" }}>
                <TableCell sx={{ 
                  whiteSpace: "nowrap", 
                  letterSpacing: "0.24em", 
                  fontSize: "0.65rem", 
                  color: "text.secondary", 
                  fontWeight: 600,
                  py: 1.5,
                }}>
                  Product
                </TableCell>
                <TableCell sx={{ 
                  whiteSpace: "nowrap", 
                  letterSpacing: "0.24em", 
                  fontSize: "0.65rem", 
                  color: "text.secondary", 
                  fontWeight: 600,
                  py: 1.5,
                }}>
                  Category
                </TableCell>
                <TableCell sx={{ 
                  whiteSpace: "nowrap", 
                  letterSpacing: "0.24em", 
                  fontSize: "0.65rem", 
                  color: "text.secondary", 
                  fontWeight: 600,
                  py: 1.5,
                }}>
                  Price
                </TableCell>
                <TableCell sx={{ 
                  whiteSpace: "nowrap", 
                  letterSpacing: "0.24em", 
                  fontSize: "0.65rem", 
                  color: "text.secondary", 
                  fontWeight: 600,
                  py: 1.5,
                }}>
                  Stock
                </TableCell>
                <TableCell sx={{ 
                  whiteSpace: "nowrap", 
                  letterSpacing: "0.24em", 
                  fontSize: "0.65rem", 
                  color: "text.secondary", 
                  fontWeight: 600,
                  py: 1.5,
                }}>
                  Flags
                </TableCell>
                <TableCell align="right" sx={{ 
                  whiteSpace: "nowrap", 
                  letterSpacing: "0.24em", 
                  fontSize: "0.65rem", 
                  color: "text.secondary", 
                  fontWeight: 600,
                  py: 1.5,
                }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((item) => {
                const categoryKey = String(
                  (item as AdminProduct & { categoryId?: string }).categoryId ?? item.category_id ?? item.category ?? "",
                );
                const categoryLabel = categoryLabelByValue.get(categoryKey) ?? item.category ?? "Uncategorized";
                const imageUrls = getProductImageUrls(item);
                const imageEntries = getProductImageEntries(item);
                const productId = String(item.id);
                const isExpanded = expandedProductId === productId;

                return (
                  <Fragment key={item.id}>
                    {/* Clickable Row - Entire row toggles expansion */}
                    <TableRow 
                      onClick={(event) => toggleExpand(productId, event)}
                      sx={{ 
                        cursor: "pointer",
                        "&:hover": { bgcolor: "#faf8f6" },
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      {/* Product Info */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "text.secondary",
                              transition: "transform 0.25s ease",
                              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                              flexShrink: 0,
                            }}
                          >
                            <FontAwesomeIcon icon={faChevronRight} size="sm" />
                          </Box>
                          <Box 
                            sx={{ 
                              width: 44, 
                              height: 44, 
                              borderRadius: 1.5, 
                              overflow: "hidden", 
                              bgcolor: "#f8f6f2", 
                              flexShrink: 0,
                              border: "1px solid #e9e2d8",
                            }}
                          >
                            <img
                              src={imageUrls[0] ?? "/images/products/fallback.png"}
                              alt={item.name}
                              width={44}
                              height={44}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </Box>
                          <Stack spacing={0.3}>
                            <Typography fontWeight={600} sx={{ color: "text.primary", fontSize: "0.9rem" }}>
                              {item.name}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                                {item.slug}
                              </Typography>
                              <Chip
                                label={item.status ?? "draft"}
                                size="small"
                                color={getStatusColor(item.status ?? "draft")}
                                sx={{ 
                                  fontSize: "0.55rem", 
                                  height: 18,
                                  fontWeight: 500,
                                }}
                              />
                            </Stack>
                          </Stack>
                        </Stack>
                      </TableCell>
                      
                      <TableCell sx={{ whiteSpace: "nowrap", fontSize: "0.85rem", py: 1.5 }}>
                        <Chip 
                          label={categoryLabel} 
                          size="small" 
                          sx={{ 
                            fontSize: "0.65rem", 
                            bgcolor: "#f0ebe3", 
                            color: "#171512",
                            fontWeight: 500,
                            height: 24,
                          }} 
                        />
                      </TableCell>
                      
                      <TableCell sx={{ whiteSpace: "nowrap", fontSize: "0.85rem", fontWeight: 600, py: 1.5 }}>
                        {formatBaseCurrencyInCurrency(item.price, currency, rates)}
                        {(item.salePrice ?? item.sale_price ?? item.compareAtPrice ?? item.compare_at_price) && (
                          <Typography 
                            component="span" 
                            sx={{ 
                              ml: 1, 
                              fontSize: "0.7rem", 
                              color: "text.secondary",
                              textDecoration: "line-through",
                            }}
                          >
                            {formatBaseCurrencyInCurrency(
                              (item.salePrice ?? item.sale_price ?? item.compareAtPrice ?? item.compare_at_price) ?? 0,
                              currency,
                              rates,
                            )}
                          </Typography>
                        )}
                      </TableCell>
                      
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={getStockLabel(item)}
                            size="small"
                            color={getStockColor(item)}
                            sx={{ 
                              fontSize: "0.6rem", 
                              height: 22,
                              fontWeight: 500,
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                            Qty: {item.stock_count}
                          </Typography>
                        </Stack>
                      </TableCell>
                      
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack direction="row" spacing={0.5}>
                          {item.featured && (
                            <Chip
                              icon={<FontAwesomeIcon icon={faStar} size="xs" />}
                              label="Featured"
                              size="small"
                              sx={{ 
                                fontSize: "0.55rem", 
                                height: 20,
                                bgcolor: "#fff3e0",
                                color: "#e65100",
                                fontWeight: 500,
                              }}
                            />
                          )}
                          {item.best_seller && (
                            <Chip
                              icon={<FontAwesomeIcon icon={faFire} size="xs" />}
                              label="Best Seller"
                              size="small"
                              sx={{ 
                                fontSize: "0.55rem", 
                                height: 20,
                                bgcolor: "#fce4ec",
                                color: "#c62828",
                                fontWeight: 500,
                              }}
                            />
                          )}
                          {item.new_arrival && (
                            <Chip
                              icon={<FontAwesomeIcon icon={faCircle} size="xs" />}
                              label="New"
                              size="small"
                              sx={{ 
                                fontSize: "0.55rem", 
                                height: 20,
                                bgcolor: "#e8f5e9",
                                color: "#2e7d32",
                                fontWeight: 500,
                              }}
                            />
                          )}
                          {!item.featured && !item.best_seller && !item.new_arrival && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                              —
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      
                      <TableCell align="right" sx={{ py: 1.5 }}>
                        <Stack direction="row" justifyContent="flex-end" spacing={0.5} alignItems="center">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              onEdit(productId);
                            }}
                            data-action="edit"
                            sx={{ 
                              color: "text.secondary",
                              "&:hover": { 
                                bgcolor: "#f0ebe3",
                                color: "#171512",
                              },
                            }}
                          >
                            <FontAwesomeIcon icon={faPencil} size="sm" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              onDuplicate(productId);
                            }}
                            data-action="duplicate"
                            sx={{ 
                              color: "text.secondary",
                              "&:hover": { 
                                bgcolor: "#f0ebe3",
                                color: "#171512",
                              },
                            }}
                          >
                            <FontAwesomeIcon icon={faClone} size="sm" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              onDelete(productId);
                            }}
                            data-action="delete"
                            sx={{ 
                              color: "text.secondary",
                              "&:hover": { 
                                bgcolor: "#fce4ec",
                                color: "#d32f2f",
                              },
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} size="sm" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Row */}
                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0, borderBottom: isExpanded ? "1px solid" : "none", borderColor: "divider" }}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ 
                            bgcolor: "#faf8f6", 
                            px: 3, 
                            py: 2.5,
                            borderTop: "1px solid #e9e2d8",
                          }}>
                            <Stack spacing={2.5}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" spacing={2} alignItems="center">
                                  <Typography variant="subtitle2" fontWeight={600} sx={{ color: "#171512" }}>
                                    Images
                                  </Typography>
                                  <Chip 
                                    label={`${imageEntries.length} images`} 
                                    size="small"
                                    sx={{ bgcolor: "#e9e2d8", color: "#171512", fontSize: "0.6rem" }}
                                  />
                                </Stack>
                                <Button
                                  component="label"
                                  variant="outlined"
                                  size="small"
                                  startIcon={<FontAwesomeIcon icon={faImage} size="sm" />}
                                  data-action="upload"
                                  onClick={(e) => e.stopPropagation()} // Prevent row click
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                    borderColor: "#e9e2d8",
                                    color: "#171512",
                                    "&:hover": { 
                                      bgcolor: "#f0ebe3", 
                                      borderColor: "#171512",
                                    },
                                  }}
                                >
                                  Upload Images
                                  <input
                                    hidden
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(event) => {
                                      const files = Array.from(event.target.files ?? []);
                                      if (!files.length) return;
                                      void onUploadImages(productId, files);
                                      event.target.value = "";
                                    }}
                                  />
                                </Button>
                              </Stack>

                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                                {imageEntries.length ? (
                                  imageEntries.map((imageEntry, index) => (
                                    <Box 
                                      key={`${imageEntry.id || imageEntry.url}-${index}`} 
                                      sx={{ 
                                        width: 100, 
                                        height: 100, 
                                        borderRadius: 1.5, 
                                        overflow: "hidden", 
                                        border: "1px solid #e9e2d8",
                                        position: "relative",
                                        bgcolor: "#ffffff",
                                      }}
                                    >
                                      <img 
                                        src={imageEntry.url} 
                                        alt={`${item.name} image ${index + 1}`} 
                                        width={100} 
                                        height={100} 
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                                      />
                                      {imageEntry.id && (
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            void onDeleteImage(productId, imageEntry.id);
                                          }}
                                          sx={{ 
                                            position: "absolute", 
                                            top: 4, 
                                            right: 4, 
                                            bgcolor: "rgba(0,0,0,0.55)", 
                                            color: "common.white",
                                            width: 24,
                                            height: 24,
                                            "&:hover": { bgcolor: "rgba(211, 47, 47, 0.85)" },
                                          }}
                                        >
                                          <FontAwesomeIcon icon={faTrash} size="xs" />
                                        </IconButton>
                                      )}
                                    </Box>
                                  ))
                                ) : (
                                  <Box sx={{ 
                                    py: 3, 
                                    px: 4, 
                                    border: "2px dashed #e9e2d8", 
                                    borderRadius: 2,
                                    textAlign: "center",
                                    width: "100%",
                                  }}>
                                    <Typography variant="body2" color="text.secondary">
                                      No images attached yet. Click &quot;Upload Images&quot; to add product images.
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Stack>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};