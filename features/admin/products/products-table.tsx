"use client";

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
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useMediaQuery,
  Paper,
  Alert,
  Snackbar,
  IconButton,
} from "@mui/material";
import React, { useState } from "react";
import Image from "next/image";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClone,
  faImage,
  faPencil,
  faTrash,
  faStar,
  faFire,
  faCircle,
  faExclamationTriangle,
  faChevronDown,
  faCopy,
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
  onDeleteImage,
}: ProductsTableProps) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    null,
  );

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(
    null,
  );
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [productToDuplicate, setProductToDuplicate] =
    useState<AdminProduct | null>(null);
  const [deleteImageDialogOpen, setDeleteImageDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{
    productId: string;
    imageId: string;
    imageUrl: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  const categoryLabelByValue = new Map(
    categoryOptions.map((item) => [item.value, item.label]),
  );

  // Dynamic styles based on dark mode
  const getBorderColor = () =>
    isDarkMode ? "rgba(255,255,255,0.12)" : "#e9e2d8";
  const getBackgroundColor = () =>
    isDarkMode ? "rgba(255,255,255,0.03)" : "#f8f6f2";
  const getTextColor = () => (isDarkMode ? "#ffffff" : "#171512");
  const getSecondaryTextColor = () =>
    isDarkMode ? "rgba(255,255,255,0.6)" : "text.secondary";
  const getChipBackgroundColor = () =>
    isDarkMode ? "rgba(255,255,255,0.08)" : "#f0ebe3";
  const getChipTextColor = () => (isDarkMode ? "#ffffff" : "#171512");
  const getIconColor = () =>
    isDarkMode ? "rgba(255,255,255,0.6)" : "text.secondary";
  const getHoverIconColor = () => (isDarkMode ? "#ffffff" : "#171512");
  const getPriceColor = () => (isDarkMode ? "#ffffff" : "inherit");
  const getCardBackground = () =>
    isDarkMode ? "rgba(255,255,255,0.03)" : "background.paper";
  const getHoverBackgroundColor = () =>
    isDarkMode ? "rgba(255,255,255,0.06)" : "action.hover";
  const getDialogBackground = () => (isDarkMode ? "#1e1e1e" : "#ffffff");

  const getStockLabel = (item: AdminProduct) => {
    const status =
      item.stockStatus ??
      item.stock_status ??
      (item.in_stock ? "IN_STOCK" : "OUT_OF_STOCK");
    if (status === "LOW_STOCK") return "Low Stock";
    if (status === "OUT_OF_STOCK") return "Out of Stock";
    return "In Stock";
  };

  const getStockColor = (item: AdminProduct) => {
    const status =
      item.stockStatus ??
      item.stock_status ??
      (item.in_stock ? "IN_STOCK" : "OUT_OF_STOCK");
    if (status === "LOW_STOCK") return "warning";
    if (status === "OUT_OF_STOCK") return "error";
    return "success";
  };

  const getStockQuantity = (item: AdminProduct) => {
    return item.quantity ?? item.stockCount ?? item.stock_count ?? 0;
  };

  const getProductImageUrls = (item: AdminProduct) => {
    const urls = [
      ...(item.images ?? []).map((image) => image.url),
      ...(item.imageUrls ?? []),
      ...(item.product_images ?? []).map((image) => image.url),
    ].filter((url): url is string => Boolean(url));

    if (urls.length) return urls;
    return [item.featuredImageUrl ?? item.featured_image_url].filter(
      (url): url is string => Boolean(url),
    );
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
      case "published":
        return "success";
      case "draft":
        return "warning";
      case "archived":
        return "error";
      default:
        return "default";
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning",
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Handle delete product click
  const handleDeleteClick = (product: AdminProduct) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  // Handle confirm delete product
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(String(productToDelete.id));
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      showSnackbar(
        `Product "${productToDelete.name}" deleted successfully.`,
        "success",
      );
    } catch (error) {
      console.error("Failed to delete product:", error);
      showSnackbar("Failed to delete product. Please try again.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle duplicate product click
  const handleDuplicateClick = (product: AdminProduct) => {
    setProductToDuplicate(product);
    setDuplicateDialogOpen(true);
  };

  // Handle confirm duplicate product
  const handleConfirmDuplicate = async () => {
    if (!productToDuplicate) return;
    setIsDuplicating(true);
    try {
      await onDuplicate(String(productToDuplicate.id));
      setDuplicateDialogOpen(false);
      setProductToDuplicate(null);
      showSnackbar(
        `Product "${productToDuplicate.name}" duplicated successfully.`,
        "success",
      );
    } catch (error) {
      console.error("Failed to duplicate product:", error);
      showSnackbar("Failed to duplicate product. Please try again.", "error");
    } finally {
      setIsDuplicating(false);
    }
  };

  // Handle delete image click
  const handleDeleteImageClick = (
    productId: string,
    imageId: string,
    imageUrl: string,
  ) => {
    setImageToDelete({ productId, imageId, imageUrl });
    setDeleteImageDialogOpen(true);
  };

  // Handle confirm delete image
  const handleConfirmDeleteImage = async () => {
    if (!imageToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteImage(imageToDelete.productId, imageToDelete.imageId);
      setDeleteImageDialogOpen(false);
      setImageToDelete(null);
      showSnackbar("Image removed successfully.", "success");
    } catch (error) {
      console.error("Failed to delete image:", error);
      showSnackbar("Failed to remove image. Please try again.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Mobile card view
  if (isMobile) {
    return (
      <>
        <Stack spacing={2}>
          {products.map((item) => {
            const categoryKey = String(
              (item as AdminProduct & { categoryId?: string }).categoryId ??
                item.category_id ??
                "",
            );
            const categoryLabel =
              categoryLabelByValue.get(categoryKey) ?? "Uncategorized";
            const imageUrls = getProductImageUrls(item);
            const imageEntries = getProductImageEntries(item);
            const productId = String(item.id);
            const isExpanded = expandedProductId === productId;

            return (
              <Paper
                key={item.id}
                sx={{
                  p: 2,
                  border: `1px solid ${getBorderColor()}`,
                  bgcolor: getCardBackground(),
                  borderRadius: 1,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: getTextColor(),
                    bgcolor: getHoverBackgroundColor(),
                  },
                }}
              >
                <Stack spacing={1.5}>
                  {/* Product Header */}
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 1,
                        overflow: "hidden",
                        bgcolor: getBackgroundColor(),
                        border: `1px solid ${getBorderColor()}`,
                        position: "relative",
                        flexShrink: 0,
                      }}
                    >
                      <Image
                        src={imageUrls[0] ?? "/images/products/fallback.png"}
                        alt={item.name}
                        fill
                        sizes="56px"
                        style={{ objectFit: "cover" }}
                        priority={false}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        fontWeight={600}
                        sx={{ color: getTextColor(), fontSize: "0.9rem" }}
                        noWrap
                      >
                        {item.name}
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography
                          variant="caption"
                          sx={{
                            color: getSecondaryTextColor(),
                            fontSize: "0.55rem",
                          }}
                        >
                          {item.slug}
                        </Typography>
                        <Chip
                          label={item.status ?? "draft"}
                          size="small"
                          color={getStatusColor(item.status ?? "draft")}
                          sx={{
                            fontSize: "0.45rem",
                            height: 16,
                            fontWeight: 500,
                          }}
                        />
                      </Stack>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setExpandedProductId((current) =>
                          current === productId ? null : productId,
                        )
                      }
                      sx={{
                        transform: isExpanded
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                        color: getSecondaryTextColor(),
                      }}
                    >
                      <FontAwesomeIcon icon={faChevronDown} size="sm" />
                    </IconButton>
                  </Stack>

                  {/* Quick Info */}
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 6 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: getSecondaryTextColor(),
                          fontSize: "0.55rem",
                        }}
                      >
                        Category
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: getTextColor(),
                          fontWeight: 500,
                          fontSize: "0.8rem",
                        }}
                      >
                        {categoryLabel}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: getSecondaryTextColor(),
                          fontSize: "0.55rem",
                        }}
                      >
                        Price
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: getTextColor(),
                          fontWeight: 600,
                          fontSize: "0.8rem",
                        }}
                      >
                        {formatBaseCurrencyInCurrency(
                          item.price,
                          currency,
                          rates,
                        )}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: getSecondaryTextColor(),
                          fontSize: "0.55rem",
                        }}
                      >
                        Stock
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Chip
                          label={getStockLabel(item)}
                          size="small"
                          color={getStockColor(item)}
                          sx={{
                            fontSize: "0.45rem",
                            height: 16,
                            fontWeight: 500,
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: getSecondaryTextColor(),
                            fontSize: "0.55rem",
                          }}
                        >
                          Qty: {getStockQuantity(item)}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: getSecondaryTextColor(),
                          fontSize: "0.55rem",
                        }}
                      >
                        Flags
                      </Typography>
                      <Stack direction="row" spacing={0.3} flexWrap="wrap">
                        {item.featured && (
                          <Chip
                            icon={<FontAwesomeIcon icon={faStar} size="xs" />}
                            label="Featured"
                            size="small"
                            sx={{
                              fontSize: "0.4rem",
                              height: 16,
                              bgcolor: isDarkMode
                                ? "rgba(255,152,0,0.2)"
                                : "#fff3e0",
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
                              fontSize: "0.4rem",
                              height: 16,
                              bgcolor: isDarkMode
                                ? "rgba(244,67,54,0.2)"
                                : "#fce4ec",
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
                              fontSize: "0.4rem",
                              height: 16,
                              bgcolor: isDarkMode
                                ? "rgba(76,175,80,0.2)"
                                : "#e8f5e9",
                              fontWeight: 500,
                            }}
                          />
                        )}
                      </Stack>
                    </Grid>
                  </Grid>

                  {/* Actions */}
                  <Divider sx={{ borderColor: getBorderColor() }} />
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onEdit(String(productId))}
                      startIcon={<FontAwesomeIcon icon={faPencil} size="sm" />}
                      sx={{
                        textTransform: "none",
                        borderRadius: 1,
                        borderColor: getBorderColor(),
                        color: getTextColor(),
                        fontSize: "0.55rem",
                        flex: 1,
                        "&:hover": {
                          borderColor: getTextColor(),
                          bgcolor: getHoverBackgroundColor(),
                        },
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleDuplicateClick(item)}
                      startIcon={<FontAwesomeIcon icon={faCopy} size="sm" />}
                      sx={{
                        textTransform: "none",
                        borderRadius: 1,
                        borderColor: getBorderColor(),
                        color: getTextColor(),
                        fontSize: "0.55rem",
                        flex: 1,
                        "&:hover": {
                          borderColor: getTextColor(),
                          bgcolor: getHoverBackgroundColor(),
                        },
                      }}
                    >
                      Duplicate
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteClick(item)}
                      startIcon={<FontAwesomeIcon icon={faTrash} size="sm" />}
                      sx={{
                        textTransform: "none",
                        borderRadius: 1,
                        borderColor: getBorderColor(),
                        color: getSecondaryTextColor(),
                        fontSize: "0.55rem",
                        flex: 1,
                        "&:hover": {
                          borderColor: "#d32f2f",
                          color: "#d32f2f",
                          bgcolor: isDarkMode
                            ? "rgba(244,67,54,0.15)"
                            : "#fce4ec",
                        },
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>

                  {/* Expanded Images */}
                  {isExpanded && (
                    <>
                      <Divider sx={{ borderColor: getBorderColor() }} />
                      <Stack spacing={1}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: getSecondaryTextColor(),
                              fontWeight: 500,
                            }}
                          >
                            Images ({imageEntries.length})
                          </Typography>
                          <Button
                            component="label"
                            size="small"
                            variant="outlined"
                            startIcon={
                              <FontAwesomeIcon icon={faImage} size="sm" />
                            }
                            sx={{
                              borderRadius: 1,
                              textTransform: "none",
                              borderColor: getBorderColor(),
                              color: getTextColor(),
                              fontSize: "0.55rem",
                              "&:hover": {
                                borderColor: getTextColor(),
                                bgcolor: getHoverBackgroundColor(),
                              },
                            }}
                          >
                            Upload
                            <input
                              hidden
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(event) => {
                                const files = Array.from(
                                  event.target.files ?? [],
                                );
                                if (!files.length) return;
                                void onUploadImages(productId, files);
                                event.target.value = "";
                              }}
                            />
                          </Button>
                        </Stack>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {imageEntries.length ? (
                            imageEntries.map((imageEntry, index) => (
                              <Box
                                key={`${imageEntry.id || imageEntry.url}-${index}`}
                                sx={{
                                  width: 64,
                                  height: 64,
                                  borderRadius: 1,
                                  overflow: "hidden",
                                  border: `1px solid ${getBorderColor()}`,
                                  position: "relative",
                                  bgcolor: isDarkMode
                                    ? "rgba(255,255,255,0.05)"
                                    : "#ffffff",
                                }}
                              >
                                <Image
                                  src={imageEntry.url}
                                  alt={`${item.name} image ${index + 1}`}
                                  fill
                                  sizes="64px"
                                  style={{ objectFit: "cover" }}
                                  priority={false}
                                />
                                {imageEntry.id && (
                                  <Box
                                    component="span"
                                    onClick={() =>
                                      handleDeleteImageClick(
                                        productId,
                                        imageEntry.id,
                                        imageEntry.url,
                                      )
                                    }
                                    sx={{
                                      position: "absolute",
                                      top: 2,
                                      right: 2,
                                      bgcolor: isDarkMode
                                        ? "rgba(0,0,0,0.7)"
                                        : "rgba(0,0,0,0.55)",
                                      color: "common.white",
                                      width: 18,
                                      height: 18,
                                      borderRadius: 0.5,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      transition: "all 0.2s ease",
                                      "&:hover": {
                                        bgcolor: "rgba(211, 47, 47, 0.85)",
                                      },
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faTrash} size="xs" />
                                  </Box>
                                )}
                              </Box>
                            ))
                          ) : (
                            <Typography
                              variant="caption"
                              sx={{ color: getSecondaryTextColor() }}
                            >
                              No images
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </>
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Stack>

        {/* Dialogs */}
        <DeleteProductDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
          productName={productToDelete?.name}
          isDarkMode={isDarkMode}
        />
        <DuplicateProductDialog
          open={duplicateDialogOpen}
          onClose={() => setDuplicateDialogOpen(false)}
          onConfirm={handleConfirmDuplicate}
          isDuplicating={isDuplicating}
          productName={productToDuplicate?.name}
          isDarkMode={isDarkMode}
        />
        <DeleteImageDialog
          open={deleteImageDialogOpen}
          onClose={() => setDeleteImageDialogOpen(false)}
          onConfirm={handleConfirmDeleteImage}
          isDeleting={isDeleting}
          isDarkMode={isDarkMode}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // Tablet and Desktop view - Accordion
  return (
    <>
      <Box sx={{ width: "100%" }} mt={1}>
        {products.map((item) => {
          const categoryKey = String(
            (item as AdminProduct & { categoryId?: string }).categoryId ??
              item.category_id ??
              "",
          );
          const categoryLabel =
            categoryLabelByValue.get(categoryKey) ?? "Uncategorized";
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
                borderColor: getBorderColor(),
                mb: 1.5,
                bgcolor: isDarkMode
                  ? "rgba(255,255,255,0.03)"
                  : "background.paper",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: isDarkMode
                    ? "rgba(255,255,255,0.06)"
                    : "action.hover",
                },
                "&.Mui-expanded": {
                  bgcolor: isDarkMode
                    ? "rgba(255,255,255,0.05)"
                    : "background.paper",
                },
              }}
              onChange={() =>
                setExpandedProductId((current) =>
                  current === productId ? null : productId,
                )
              }
            >
              <AccordionSummary
                expandIcon={isExpanded ? <RemoveIcon /> : <AddIcon />}
                sx={{
                  px: 3,
                  py: 1,
                  flexDirection: "row-reverse",
                  "& .MuiAccordionSummary-content": {
                    alignItems: "center",
                    cursor: "pointer",
                    "&.Mui-expanded": {
                      margin: "12px 0",
                    },
                  },
                  "& .MuiAccordionSummary-expandIconWrapper": {
                    borderRadius: 1,
                    border: 1,
                    borderColor: getBorderColor(),
                    color: isDarkMode
                      ? "rgba(255,255,255,0.6)"
                      : "text.secondary",
                    transform: "none",
                    mr: 1,
                    transition: "all 0.3s ease",
                    "&.Mui-expanded": {
                      transform: "none",
                      color: isDarkMode ? "#ffffff" : "primary.main",
                      borderColor: isDarkMode ? "#ffffff" : "primary.main",
                    },
                    "& svg": {
                      fontSize: "1.25rem",
                    },
                  },
                }}
              >
                <Grid
                  container
                  alignItems="center"
                  spacing={1}
                  sx={{
                    width: "100%",
                  }}
                  paddingLeft={2}
                  paddingRight={2}
                >
                  {/* Product Image */}
                  <Grid size={{ xs: 3, md: 1.5 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        overflow: "hidden",
                        bgcolor: getBackgroundColor(),
                        border: `1px solid ${getBorderColor()}`,
                        position: "relative",
                      }}
                    >
                      <Image
                        src={imageUrls[0] ?? "/images/products/fallback.png"}
                        alt={item.name}
                        fill
                        sizes="48px"
                        style={{ objectFit: "cover" }}
                        priority={false}
                      />
                    </Box>
                  </Grid>

                  {/* Product Name */}
                  <Grid size={{ xs: 9, md: 2.5 }}>
                    <Tooltip title="Product Name">
                      <Typography
                        variant="h5"
                        fontSize={14}
                        lineHeight={1.25}
                        mb={0}
                        noWrap
                        fontWeight={600}
                        color={getTextColor()}
                      >
                        {item.name}
                      </Typography>
                    </Tooltip>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      sx={{ mt: 0.3 }}
                    >
                      <Typography
                        variant="caption"
                        color={getSecondaryTextColor()}
                        sx={{ fontSize: "0.6rem" }}
                      >
                        {item.slug}
                      </Typography>
                      <Chip
                        label={item.status ?? "draft"}
                        size="small"
                        color={getStatusColor(item.status ?? "draft")}
                        sx={{
                          fontSize: "0.5rem",
                          height: 16,
                          fontWeight: 500,
                          color: isDarkMode ? "#ffffff" : undefined,
                        }}
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
                          fontSize: "0.6rem",
                          bgcolor: getChipBackgroundColor(),
                          color: getChipTextColor(),
                          fontWeight: 500,
                          height: 22,
                        }}
                      />
                    </Tooltip>
                  </Grid>

                  {/* Price */}
                  <Grid size={{ xs: 6, md: 2 }}>
                    <Tooltip title="Price">
                      <Typography
                        fontWeight={600}
                        sx={{ fontSize: "0.85rem", color: getPriceColor() }}
                      >
                        {formatBaseCurrencyInCurrency(
                          item.price,
                          currency,
                          rates,
                        )}
                      </Typography>
                    </Tooltip>
                    {(item.salePrice ??
                      item.sale_price ??
                      item.compareAtPrice ??
                      item.compare_at_price) && (
                      <Typography
                        component="span"
                        sx={{
                          ml: 0.5,
                          fontSize: "0.6rem",
                          color: getSecondaryTextColor(),
                          textDecoration: "line-through",
                        }}
                      >
                        {formatBaseCurrencyInCurrency(
                          item.salePrice ??
                            item.sale_price ??
                            item.compareAtPrice ??
                            item.compare_at_price ??
                            0,
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
                          sx={{
                            fontSize: "0.5rem",
                            height: 18,
                            fontWeight: 500,
                            color: isDarkMode ? "#ffffff" : undefined,
                          }}
                        />
                        <Typography
                          variant="caption"
                          color={getSecondaryTextColor()}
                          sx={{ fontSize: "0.6rem" }}
                        >
                          Qty: {getStockQuantity(item)}
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
                          sx={{
                            fontSize: "0.45rem",
                            height: 18,
                            bgcolor: isDarkMode
                              ? "rgba(255,152,0,0.2)"
                              : "#fff3e0",
                            color: isDarkMode ? "#ffb74d" : "#e65100",
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
                            fontSize: "0.45rem",
                            height: 18,
                            bgcolor: isDarkMode
                              ? "rgba(244,67,54,0.2)"
                              : "#fce4ec",
                            color: isDarkMode ? "#ef9a9a" : "#c62828",
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
                            fontSize: "0.45rem",
                            height: 18,
                            bgcolor: isDarkMode
                              ? "rgba(76,175,80,0.2)"
                              : "#e8f5e9",
                            color: isDarkMode ? "#81c784" : "#2e7d32",
                            fontWeight: 500,
                          }}
                        />
                      )}
                    </Stack>
                  </Grid>
                </Grid>
                <Divider sx={{ borderColor: getBorderColor() }} />
              </AccordionSummary>

              {/* Expanded Section - Actions and Images */}
              <AccordionDetails
                sx={{
                  backgroundColor: isDarkMode
                    ? "rgba(255,255,255,0.02)"
                    : "background.paper",
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
                            onEdit(String(productId));
                          }}
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            color: getIconColor(),
                            cursor: "pointer",
                            border: `1px solid ${getBorderColor()}`,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: isDarkMode
                                ? "rgba(255,255,255,0.08)"
                                : "#f0ebe3",
                              color: getHoverIconColor(),
                              borderColor: getHoverIconColor(),
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
                            handleDuplicateClick(item);
                          }}
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            color: getIconColor(),
                            cursor: "pointer",
                            border: `1px solid ${getBorderColor()}`,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: isDarkMode
                                ? "rgba(255,255,255,0.08)"
                                : "#f0ebe3",
                              color: getHoverIconColor(),
                              borderColor: getHoverIconColor(),
                            },
                          }}
                        >
                          <FontAwesomeIcon icon={faCopy} size="sm" />
                        </Box>
                      </Tooltip>
                      <Tooltip title="Delete Product">
                        <Box
                          component="span"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(item);
                          }}
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            color: getIconColor(),
                            cursor: "pointer",
                            border: `1px solid ${getBorderColor()}`,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: isDarkMode
                                ? "rgba(244,67,54,0.15)"
                                : "#fce4ec",
                              color: "#d32f2f",
                              borderColor: "#d32f2f",
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
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          sx={{ color: getTextColor() }}
                        >
                          Images
                        </Typography>
                        <Chip
                          label={`${imageEntries.length} images`}
                          size="small"
                          sx={{
                            bgcolor: getChipBackgroundColor(),
                            color: getChipTextColor(),
                            fontSize: "0.6rem",
                          }}
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
                          borderColor: getBorderColor(),
                          color: getTextColor(),
                          "&:hover": {
                            bgcolor: isDarkMode
                              ? "rgba(255,255,255,0.05)"
                              : "#f0ebe3",
                            borderColor: getTextColor(),
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
                              border: `1px solid ${getBorderColor()}`,
                              position: "relative",
                              bgcolor: isDarkMode
                                ? "rgba(255,255,255,0.05)"
                                : "#ffffff",
                            }}
                          >
                            <Image
                              src={imageEntry.url}
                              alt={`${item.name} image ${index + 1}`}
                              fill
                              sizes="100px"
                              style={{ objectFit: "cover" }}
                              priority={false}
                            />
                            {imageEntry.id && (
                              <Tooltip title="Remove Image">
                                <Box
                                  component="span"
                                  onClick={() =>
                                    handleDeleteImageClick(
                                      productId,
                                      imageEntry.id,
                                      imageEntry.url,
                                    )
                                  }
                                  sx={{
                                    position: "absolute",
                                    top: 4,
                                    right: 4,
                                    bgcolor: isDarkMode
                                      ? "rgba(0,0,0,0.7)"
                                      : "rgba(0,0,0,0.55)",
                                    color: "common.white",
                                    width: 24,
                                    height: 24,
                                    borderRadius: 1,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                      bgcolor: "rgba(211, 47, 47, 0.85)",
                                    },
                                  }}
                                >
                                  <FontAwesomeIcon icon={faTrash} size="xs" />
                                </Box>
                              </Tooltip>
                            )}
                          </Box>
                        ))
                      ) : (
                        <Box
                          sx={{
                            py: 3,
                            px: 4,
                            border: `2px dashed ${getBorderColor()}`,
                            borderRadius: 2,
                            textAlign: "center",
                            width: "100%",
                            color: getSecondaryTextColor(),
                          }}
                        >
                          <Typography
                            variant="body2"
                            color={getSecondaryTextColor()}
                          >
                            No images attached yet. Click &quot;Upload
                            Images&quot; to add product images.
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

      {/* Dialogs */}
      <DeleteProductDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        productName={productToDelete?.name}
        isDarkMode={isDarkMode}
      />
      <DuplicateProductDialog
        open={duplicateDialogOpen}
        onClose={() => setDuplicateDialogOpen(false)}
        onConfirm={handleConfirmDuplicate}
        isDuplicating={isDuplicating}
        productName={productToDuplicate?.name}
        isDarkMode={isDarkMode}
      />
      <DeleteImageDialog
        open={deleteImageDialogOpen}
        onClose={() => setDeleteImageDialogOpen(false)}
        onConfirm={handleConfirmDeleteImage}
        isDeleting={isDeleting}
        isDarkMode={isDarkMode}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

// Delete Product Dialog Component
const DeleteProductDialog = ({
  open,
  onClose,
  onConfirm,
  isDeleting,
  productName,
  isDarkMode,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  productName?: string;
  isDarkMode: boolean;
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: 2,
        p: 1,
        bgcolor: isDarkMode ? "#1e1e1e" : "#ffffff",
        border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.12)" : "#e9e2d8"}`,
      },
    }}
  >
    <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          bgcolor: isDarkMode ? "rgba(211,47,47,0.15)" : "#fce4ec",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#d32f2f",
        }}
      >
        <FontAwesomeIcon icon={faExclamationTriangle} size="lg" />
      </Box>
      <Typography
        component="span"
        variant="h6"
        fontWeight={600}
        sx={{ color: isDarkMode ? "#ffffff" : "#171512" }}
      >
        Delete Product
      </Typography>
    </DialogTitle>
    <DialogContent>
      <DialogContentText
        sx={{
          mb: 2,
          color: isDarkMode ? "rgba(255,255,255,0.6)" : "text.secondary",
        }}
      >
        Are you sure you want to delete{" "}
        <strong style={{ color: isDarkMode ? "#ffffff" : "#171512" }}>
          {productName || "this product"}
        </strong>
        ? This action cannot be undone and will permanently remove the product
        from your store.
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ p: 2, pt: 0 }}>
      <Button
        onClick={onClose}
        sx={{
          textTransform: "none",
          color: isDarkMode ? "rgba(255,255,255,0.6)" : "text.secondary",
          "&:hover": {
            bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "action.hover",
          },
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        disabled={isDeleting}
        variant="contained"
        color="error"
        sx={{
          textTransform: "none",
          "&:disabled": {
            opacity: 0.6,
          },
        }}
      >
        {isDeleting ? "Deleting..." : "Delete Product"}
      </Button>
    </DialogActions>
  </Dialog>
);

// Duplicate Product Dialog Component
const DuplicateProductDialog = ({
  open,
  onClose,
  onConfirm,
  isDuplicating,
  productName,
  isDarkMode,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDuplicating: boolean;
  productName?: string;
  isDarkMode: boolean;
}) => {
  const getBorderColor = () =>
    isDarkMode ? "rgba(255,255,255,0.12)" : "#e9e2d8";
  const getDialogBackground = () => (isDarkMode ? "#1e1e1e" : "#ffffff");
  const getTextColor = () => (isDarkMode ? "#ffffff" : "#171512");
  const getSecondaryTextColor = () =>
    isDarkMode ? "rgba(255,255,255,0.6)" : "text.secondary";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
          bgcolor: getDialogBackground(),
          border: `1px solid ${getBorderColor()}`,
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            bgcolor: isDarkMode ? "rgba(25,118,210,0.15)" : "#e3f2fd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1976d2",
          }}
        >
          <FontAwesomeIcon icon={faCopy} size="lg" />
        </Box>
        <Typography
          component="span"
          variant="h6"
          fontWeight={600}
          sx={{ color: getTextColor() }}
        >
          Duplicate Product
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2, color: getSecondaryTextColor() }}>
          Are you sure you want to duplicate{" "}
          <strong style={{ color: getTextColor() }}>
            {productName || "this product"}
          </strong>
          ?
        </DialogContentText>
        <Box
          sx={{
            p: 2,
            bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8f6f2",
            borderRadius: 1,
            border: `1px solid ${getBorderColor()}`,
          }}
        >
          <Typography variant="body2" sx={{ color: getTextColor() }}>
            <strong>What will be duplicated:</strong>
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: getSecondaryTextColor(), display: "block", mt: 1 }}
          >
            • Product name, description, and specifications
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: getSecondaryTextColor(), display: "block" }}
          >
            • Pricing and inventory settings
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: getSecondaryTextColor(), display: "block" }}
          >
            • Category assignment and flags (Featured, Best Seller, etc.)
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: getSecondaryTextColor(), display: "block" }}
          >
            • Product images (copied to the new product)
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: getSecondaryTextColor(), display: "block", mt: 0.5 }}
          >
            ⚠️ The duplicate will be created as a{" "}
            <strong style={{ color: getTextColor() }}>Draft</strong> status.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            color: getSecondaryTextColor(),
            "&:hover": {
              bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "action.hover",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isDuplicating}
          variant="contained"
          color="primary"
          sx={{
            textTransform: "none",
            "&:disabled": {
              opacity: 0.6,
            },
          }}
        >
          {isDuplicating ? "Duplicating..." : "Duplicate Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Delete Image Dialog Component
const DeleteImageDialog = ({
  open,
  onClose,
  onConfirm,
  isDeleting,
  isDarkMode,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  isDarkMode: boolean;
}) => {
  const getBorderColor = () =>
    isDarkMode ? "rgba(255,255,255,0.12)" : "#e9e2d8";
  const getDialogBackground = () => (isDarkMode ? "#1e1e1e" : "#ffffff");
  const getTextColor = () => (isDarkMode ? "#ffffff" : "#171512");
  const getSecondaryTextColor = () =>
    isDarkMode ? "rgba(255,255,255,0.6)" : "text.secondary";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
          bgcolor: getDialogBackground(),
          border: `1px solid ${getBorderColor()}`,
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            bgcolor: isDarkMode ? "rgba(211,47,47,0.15)" : "#fce4ec",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#d32f2f",
          }}
        >
          <FontAwesomeIcon icon={faExclamationTriangle} size="lg" />
        </Box>
        <Typography
          component="span"
          variant="h6"
          fontWeight={600}
          sx={{ color: getTextColor() }}
        >
          Remove Image
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2, color: getSecondaryTextColor() }}>
          Are you sure you want to remove this image? This action cannot be
          undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            color: getSecondaryTextColor(),
            "&:hover": {
              bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "action.hover",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isDeleting}
          variant="contained"
          color="error"
          sx={{
            textTransform: "none",
            "&:disabled": {
              opacity: 0.6,
            },
          }}
        >
          {isDeleting ? "Removing..." : "Remove Image"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
