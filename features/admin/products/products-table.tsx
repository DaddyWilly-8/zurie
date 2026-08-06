'use client';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Divider,
  Grid,
  Stack,
  Tooltip,
  Typography,
  Box,
  Button,
} from '@mui/material';
import React, { useState } from 'react';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClone, 
  faImage, 
  faPencil, 
  faTrash,
  faStar,
  faFire,
  faCircle,
} from '@fortawesome/free-solid-svg-icons';
import { useCurrencyStore } from '@/hooks/use-currency-store';
import { formatBaseCurrencyInCurrency } from '@/utils/currency';
import type { AdminProduct } from './types';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "success";
      case "draft": return "warning";
      case "archived": return "error";
      default: return "default";
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
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
          <Accordion
            key={item.id}
            expanded={isExpanded}
            square
            sx={{ 
              borderRadius: 2, 
              borderTop: 2,
              borderColor: 'divider',
              mb: 1.5,
              '&:hover': {
                bgcolor: 'action.hover',
              },
              '&.Mui-expanded': {
                bgcolor: 'background.paper',
              },
            }}
            onChange={() => setExpandedProductId((current) => (current === productId ? null : productId))}
          >
            <AccordionSummary
              expandIcon={isExpanded ? <RemoveIcon /> : <AddIcon />}
              sx={{
                px: 3,
                py: 1,
                flexDirection: 'row-reverse',
                '.MuiAccordionSummary-content': {
                  alignItems: 'center',
                  '&.Mui-expanded': {
                    margin: '12px 0',
                  }
                },
                '.MuiAccordionSummary-expandIconWrapper': {
                  borderRadius: 1,
                  border: 1,
                  color: 'text.secondary',  
                  transform: 'none',
                  mr: 1,
                  '&.Mui-expanded': {
                    transform: 'none',
                    color: 'primary.main',
                    borderColor: 'primary.main',
                  },
                  '& svg': {
                    fontSize: '1.25rem',
                  },
                },
              }}
            >
              <Grid 
                container 
                alignItems="center" 
                spacing={1}
                sx={{
                  cursor: 'pointer',
                  width: '100%',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
                paddingLeft={2}
                paddingRight={2}
              >
                {/* Product Image */}
                <Grid size={{ xs: 4, md: 1.5 }}>
                  <Box 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 1.5, 
                      overflow: "hidden", 
                      bgcolor: "#f8f6f2", 
                      border: "1px solid #e9e2d8",
                    }}
                  >
                    <img
                      src={imageUrls[0] ?? "/images/products/fallback.png"}
                      alt={item.name}
                      width={48}
                      height={48}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                </Grid>

                {/* Product Name */}
                <Grid size={{ xs: 8, md: 2.5 }}>
                  <Tooltip title="Product Name">
                    <Typography variant="h5" fontSize={14} lineHeight={1.25} mb={0} noWrap fontWeight={600}>
                      {item.name}
                    </Typography>
                  </Tooltip>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                      {item.slug}
                    </Typography>
                    <Chip
                      label={item.status ?? "draft"}
                      size="small"
                      color={getStatusColor(item.status ?? "draft")}
                      sx={{ fontSize: '0.5rem', height: 16, fontWeight: 500 }}
                    />
                  </Stack>
                </Grid>

                {/* Category */}
                <Grid size={{ xs: 6, md: 2 }}>
                  <Tooltip title="Category">
                    <Chip 
                      label={categoryLabel} 
                      size="small" 
                      sx={{ 
                        fontSize: '0.6rem', 
                        bgcolor: "#f0ebe3", 
                        color: "#171512",
                        fontWeight: 500,
                        height: 22,
                      }} 
                    />
                  </Tooltip>
                </Grid>

                {/* Price */}
                <Grid size={{ xs: 6, md: 2 }}>
                  <Tooltip title="Price">
                    <Typography fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                      {formatBaseCurrencyInCurrency(item.price, currency, rates)}
                    </Typography>
                  </Tooltip>
                  {(item.salePrice ?? item.sale_price ?? item.compareAtPrice ?? item.compare_at_price) && (
                    <Typography 
                      component="span" 
                      sx={{ 
                        ml: 0.5, 
                        fontSize: '0.6rem', 
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
                </Grid>

                {/* Stock */}
                <Grid size={{ xs: 6, md: 2 }}>
                  <Tooltip title="Stock Status">
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Chip
                        label={getStockLabel(item)}
                        size="small"
                        color={getStockColor(item)}
                        sx={{ fontSize: '0.5rem', height: 18, fontWeight: 500 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                        Qty: {item.stock_count}
                      </Typography>
                    </Stack>
                  </Tooltip>
                </Grid>

                {/* Flags */}
                <Grid size={{ xs: 6, md: 1.5 }}>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {item.featured && (
                      <Chip
                        icon={<FontAwesomeIcon icon={faStar} size="xs" />}
                        label="Featured"
                        size="small"
                        sx={{ fontSize: '0.45rem', height: 18, bgcolor: "#fff3e0", color: "#e65100", fontWeight: 500 }}
                      />
                    )}
                    {item.best_seller && (
                      <Chip
                        icon={<FontAwesomeIcon icon={faFire} size="xs" />}
                        label="Best Seller"
                        size="small"
                        sx={{ fontSize: '0.45rem', height: 18, bgcolor: "#fce4ec", color: "#c62828", fontWeight: 500 }}
                      />
                    )}
                    {item.new_arrival && (
                      <Chip
                        icon={<FontAwesomeIcon icon={faCircle} size="xs" />}
                        label="New"
                        size="small"
                        sx={{ fontSize: '0.45rem', height: 18, bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 500 }}
                      />
                    )}
                  </Stack>
                </Grid>
              </Grid>
              <Divider />
            </AccordionSummary>

            {/* Expanded Section - Actions and Images */}
            <AccordionDetails
              sx={{ 
                backgroundColor: 'background.paper',
                marginBottom: 3,
                px: 3,
                py: 2,
              }}
            >
              <Grid container spacing={2}>
                {/* Actions Row - Top Right */}
                <Grid size={{ xs: 12 }}>
                  <Stack 
                    direction="row" 
                    justifyContent="flex-end" 
                    alignItems="center" 
                    spacing={1.5}
                    sx={{ mb: 2 }}
                  >
                    <Tooltip title="Edit Product">
                      <Box
                        component="span"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(productId);
                        }}
                        sx={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 36,
                          height: 36,
                          borderRadius: 1.5,
                          color: 'text.secondary',
                          cursor: 'pointer',
                          border: '1px solid #e9e2d8',
                          transition: 'all 0.2s ease',
                          '&:hover': { 
                            bgcolor: '#f0ebe3', 
                            color: '#171512',
                            borderColor: '#171512',
                          },
                        }}
                      >
                        <FontAwesomeIcon icon={faPencil} size="sm" />
                      </Box>
                    </Tooltip>
                    <Tooltip title="Duplicate Product">
                      <Box
                        component="span"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(productId);
                        }}
                        sx={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 36,
                          height: 36,
                          borderRadius: 1.5,
                          color: 'text.secondary',
                          cursor: 'pointer',
                          border: '1px solid #e9e2d8',
                          transition: 'all 0.2s ease',
                          '&:hover': { 
                            bgcolor: '#f0ebe3', 
                            color: '#171512',
                            borderColor: '#171512',
                          },
                        }}
                      >
                        <FontAwesomeIcon icon={faClone} size="sm" />
                      </Box>
                    </Tooltip>
                    <Tooltip title="Delete Product">
                      <Box
                        component="span"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(productId);
                        }}
                        sx={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 36,
                          height: 36,
                          borderRadius: 1.5,
                          color: 'text.secondary',
                          cursor: 'pointer',
                          border: '1px solid #e9e2d8',
                          transition: 'all 0.2s ease',
                          '&:hover': { 
                            bgcolor: '#fce4ec', 
                            color: '#d32f2f',
                            borderColor: '#d32f2f',
                          },
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} size="sm" />
                      </Box>
                    </Tooltip>
                  </Stack>
                </Grid>

                {/* Images Section */}
                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
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
                </Grid>

                <Grid size={{ xs: 12 }}>
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
                            <Tooltip title="Remove Image">
                              <Box
                                component="span"
                                onClick={() => void onDeleteImage(productId, imageEntry.id)}
                                sx={{ 
                                  position: "absolute", 
                                  top: 4, 
                                  right: 4, 
                                  bgcolor: "rgba(0,0,0,0.55)", 
                                  color: "common.white",
                                  width: 24,
                                  height: 24,
                                  borderRadius: 1,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  '&:hover': { bgcolor: "rgba(211, 47, 47, 0.85)" },
                                }}
                              >
                                <FontAwesomeIcon icon={faTrash} size="xs" />
                              </Box>
                            </Tooltip>
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
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};