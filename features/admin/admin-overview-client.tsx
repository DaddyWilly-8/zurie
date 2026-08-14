"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Divider,
  LinearProgress,
  Chip,
  Skeleton,
  Paper,
  useTheme,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowRight,
  faBoxArchive,
  faCircleCheck,
  faCircleXmark,
  faComment,
  faTags,
  faPlus,
  faChartLine,
  faArrowUp,
  faArrowDown,
  faEye,
  faShoppingCart,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import {
  dashboardService,
  type DashboardOverview,
} from "@/services/dashboard/dashboard.service";

type StatCardProps = {
  label: string;
  value: number;
  icon: IconProp;
  href: string;
  color?: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  isDarkMode: boolean;
};

const StatCard = ({
  label,
  value,
  icon,
  href,
  color,
  subtitle,
  trend,
  trendLabel,
  isDarkMode,
}: StatCardProps) => {
  // Adjust colors for dark mode
  const getIconBgColor = () => {
    if (isDarkMode) {
      return color ? `${color}25` : "rgba(255,255,255,0.08)";
    }
    return color ? `${color}15` : "primary.light";
  };

  const getIconColor = () => {
    if (isDarkMode) {
      return color || "#ffffff";
    }
    return color || "primary.main";
  };

  const getBorderColor = () => {
    return isDarkMode ? "rgba(255,255,255,0.12)" : "divider";
  };

  const getHoverBgColor = () => {
    return isDarkMode ? "rgba(255,255,255,0.05)" : "action.hover";
  };

  // Get trend icon
  const getTrendIcon = (): IconProp => {
    if (trend === "up") return faArrowUp;
    if (trend === "down") return faArrowDown;
    return faChartLine;
  };

  // Get trend color
  const getTrendColor = () => {
    if (trend === "up") return isDarkMode ? "#66bb6a" : "#2e7d32";
    if (trend === "down") return isDarkMode ? "#ef5350" : "#d32f2f";
    return isDarkMode ? "rgba(255,255,255,0.5)" : "text.secondary";
  };

  return (
    <Card
      component={Link}
      href={href}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: getBorderColor(),
        boxShadow: "none",
        borderRadius: 2,
        bgcolor: isDarkMode ? "rgba(255,255,255,0.03)" : "background.paper",
        p: 2.5,
        textDecoration: "none",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: color || (isDarkMode ? "#ffffff" : "primary.main"),
          opacity: 0.7,
        },
        "&:hover": {
          borderColor: isDarkMode ? "rgba(255,255,255,0.3)" : "text.primary",
          bgcolor: getHoverBgColor(),
          transform: "translateY(-4px)",
          boxShadow: isDarkMode
            ? "0 8px 24px rgba(0,0,0,0.4)"
            : "0 8px 24px rgba(0,0,0,0.08)",
          "&::before": {
            opacity: 1,
          },
        },
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: getIconBgColor(),
              color: getIconColor(),
            }}
          >
            <FontAwesomeIcon icon={icon} size="lg" />
          </Box>
          {trend && (
            <Chip
              icon={
                <FontAwesomeIcon
                  icon={getTrendIcon()}
                  size="xs"
                  style={{ color: getTrendColor() }}
                />
              }
              label={trendLabel || `${trend === "up" ? "+" : ""}12%`}
              size="small"
              sx={{
                fontSize: "0.6rem",
                height: 22,
                fontWeight: 500,
                bgcolor: isDarkMode ? "rgba(255,255,255,0.08)" : undefined,
                color: getTrendColor(),
                borderColor: getTrendColor(),
                "& .MuiChip-icon": {
                  color: getTrendColor(),
                },
              }}
              variant="outlined"
            />
          )}
        </Stack>

        <Typography
          sx={{
            fontSize: "2rem",
            lineHeight: 1,
            color: isDarkMode ? "#ffffff" : "text.primary",
            fontWeight: 600,
          }}
        >
          {value ?? 0}
        </Typography>

        <Typography
          sx={{
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            fontSize: "0.7rem",
            color: isDarkMode ? "rgba(255,255,255,0.6)" : "text.secondary",
            fontWeight: 500,
          }}
        >
          {label}
        </Typography>

        {subtitle && (
          <Typography
            sx={{
              fontSize: "0.7rem",
              color: isDarkMode ? "rgba(255,255,255,0.5)" : "text.secondary",
              mt: -0.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Stack>
    </Card>
  );
};

type StatItem = {
  label: string;
  value: number;
  icon: IconProp;
  href: string;
  color?: string;
  subtitle: string;
  trend: "up" | "down" | "neutral";
  trendLabel: string;
};

const emptyOverview: DashboardOverview = {
  totalProducts: 0,
  productsInStock: 0,
  productsOutOfStock: 0,
  totalCategories: 0,
  completedOrders: 0,
  newOrders: 0,
  recentProducts: [],
  lowStockProducts: [],
};

export const AdminOverviewClient = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const {
    data: overview = emptyOverview,
    isLoading,
    isError,
  } = useQuery<DashboardOverview>({
    queryKey: ["admin-overview"],
    queryFn: () => dashboardService.getOverview(),
  });

  // Dynamic styles for dark mode
  const getBorderColor = () =>
    isDarkMode ? "rgba(255,255,255,0.12)" : "#e9e2d8";
  const getBgColor = () =>
    isDarkMode ? "rgba(255,255,255,0.03)" : "background.paper";
  const getTextColor = () => (isDarkMode ? "#ffffff" : "text.primary");
  const getSecondaryTextColor = () =>
    isDarkMode ? "rgba(255,255,255,0.6)" : "text.secondary";
  const getCardBgColor = () =>
    isDarkMode ? "rgba(255,255,255,0.02)" : "background.paper";
  const getHoverBgColor = () =>
    isDarkMode ? "rgba(255,255,255,0.05)" : "action.hover";

  const stats: StatItem[] = [
    {
      label: "Total Products",
      value: overview?.totalProducts ?? 0,
      icon: faBoxArchive,
      href: "/admin/products",
      subtitle: `${overview?.productsInStock ?? 0} in stock`,
      trend: "up",
      trendLabel: "+12%",
    },
    {
      label: "In Stock",
      value: overview?.productsInStock ?? 0,
      icon: faCircleCheck,
      href: "/admin/products?status=published",
      color: "#4caf50",
      subtitle: `${overview?.totalProducts > 0 ? Math.round(((overview.productsInStock ?? 0) / (overview.totalProducts ?? 1)) * 100) : 0}% of products`,
      trend: "up",
      trendLabel: "+5%",
    },
    {
      label: "Out of Stock",
      value: overview?.productsOutOfStock ?? 0,
      icon: faCircleXmark,
      href: "/admin/products?status=out_of_stock",
      color: "#ef5350",
      subtitle: "Need restock",
      trend: "down",
      trendLabel: "-3%",
    },
    {
      label: "Categories",
      value: overview?.totalCategories ?? 0,
      icon: faTags,
      href: "/admin/categories",
      subtitle: "Product categories",
      trend: "neutral",
      trendLabel: "Stable",
    },
    {
      label: "New Orders",
      value: overview?.newOrders ?? 0,
      icon: faComment,
      href: "/admin/orders?status=new",
      color: "#42a5f5",
      subtitle: "Awaiting processing",
      trend: "up",
      trendLabel: "+8%",
    },
  ];

  const actionButtonSx = {
    borderRadius: 1.5,
    borderColor: getBorderColor(),
    color: getTextColor(),
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    fontSize: "0.7rem",
    px: 2.4,
    py: 1.1,
    justifyContent: "center",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: getTextColor(),
      bgcolor: getHoverBgColor(),
      transform: "translateY(-2px)",
    },
  } as const;

  const recentProducts = overview?.recentProducts ?? [];
  const lowStockProducts = overview?.lowStockProducts ?? [];

  // Calculate stock percentage for progress bar
  const stockPercentage =
    (overview?.totalProducts ?? 0) > 0
      ? Math.round(
          ((overview?.productsInStock ?? 0) / (overview?.totalProducts ?? 1)) *
            100,
        )
      : 0;

  return (
    <Stack spacing={4} sx={{ pb: 2 }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
      >
        <Box>
          <Typography
            sx={{
              color: getTextColor(),
              fontSize: { xs: "1.8rem", md: "2.2rem" },
              fontWeight: 600,
            }}
          >
            Dashboard
          </Typography>
          <Typography
            sx={{
              color: getSecondaryTextColor(),
              fontSize: "0.9rem",
            }}
          >
            Welcome back! Here&apos;s what&apos;s happening with your store
            today.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            component={Link}
            href="/admin/products"
            variant="contained"
            startIcon={<FontAwesomeIcon icon={faPlus} size="sm" />}
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              bgcolor: isDarkMode ? "#ffffff" : "#171512",
              color: isDarkMode ? "#171512" : "#ffffff",
              "&:hover": {
                bgcolor: isDarkMode ? "rgba(255,255,255,0.9)" : "#2d2a26",
              },
              boxShadow: "none",
            }}
          >
            Add Product
          </Button>
          <Button
            component={Link}
            href="/admin/orders"
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faEye} size="sm" />}
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              borderColor: getBorderColor(),
              color: getTextColor(),
              "&:hover": {
                borderColor: getTextColor(),
                bgcolor: getHoverBgColor(),
              },
            }}
          >
            View Orders
          </Button>
        </Stack>
      </Stack>

      {/* Stats Grid */}
      {isError ? (
        <Typography color="error.main">Failed to load overview.</Typography>
      ) : isLoading ? (
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4, 5].map((index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <Card
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: `1px solid ${getBorderColor()}`,
                  bgcolor: getBgColor(),
                }}
              >
                <Stack spacing={1.5}>
                  <Skeleton
                    variant="circular"
                    width={44}
                    height={44}
                    sx={{
                      bgcolor: isDarkMode
                        ? "rgba(255,255,255,0.08)"
                        : undefined,
                    }}
                  />
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={40}
                    sx={{
                      bgcolor: isDarkMode
                        ? "rgba(255,255,255,0.08)"
                        : undefined,
                    }}
                  />
                  <Skeleton
                    variant="text"
                    width="80%"
                    height={20}
                    sx={{
                      bgcolor: isDarkMode
                        ? "rgba(255,255,255,0.08)"
                        : undefined,
                    }}
                  />
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
              lg: "repeat(5, minmax(0, 1fr))",
            },
            gap: 2.5,
          }}
        >
          {stats.map((item) => (
            <StatCard
              key={item.label}
              label={item.label}
              value={item.value}
              icon={item.icon}
              href={item.href}
              color={item.color}
              subtitle={item.subtitle}
              trend={item.trend}
              trendLabel={item.trendLabel}
              isDarkMode={isDarkMode}
            />
          ))}
        </Box>
      )}

      {/* Quick Actions */}
      <Paper
        sx={{
          p: 2.5,
          border: `1px solid ${getBorderColor()}`,
          borderRadius: 2,
          boxShadow: "none",
          bgcolor: getBgColor(),
        }}
      >
        <Typography
          variant="overline"
          sx={{
            letterSpacing: "0.38em",
            color: getSecondaryTextColor(),
            fontSize: "0.7rem",
            fontWeight: 600,
            mb: 2,
            display: "block",
          }}
        >
          Quick Actions
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
            gap: 1.5,
          }}
        >
          <Button
            component={Link}
            href="/admin/products"
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faBoxArchive} size="sm" />}
            sx={actionButtonSx}
          >
            View Products
          </Button>
          <Button
            component={Link}
            href="/admin/categories"
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faTags} size="sm" />}
            sx={actionButtonSx}
          >
            View Categories
          </Button>
          <Button
            component={Link}
            href="/admin/homepage"
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faEye} size="sm" />}
            sx={actionButtonSx}
          >
            Manage Homepage
          </Button>
          <Button
            component={Link}
            href="/admin/orders"
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faShoppingCart} size="sm" />}
            sx={actionButtonSx}
          >
            View Orders
          </Button>
        </Box>
      </Paper>

      {/* Recent Activity Section */}
      <Grid container spacing={3}>
        {/* Recently Added Products */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              border: `1px solid ${getBorderColor()}`,
              borderRadius: 2,
              boxShadow: "none",
              bgcolor: getCardBgColor(),
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      bgcolor: isDarkMode
                        ? "rgba(255,255,255,0.08)"
                        : "primary.light",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isDarkMode ? "#ffffff" : "primary.main",
                    }}
                  >
                    <FontAwesomeIcon icon={faBoxArchive} size="sm" />
                  </Box>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ color: getTextColor(), fontSize: "1rem" }}
                  >
                    Recently Added Products
                  </Typography>
                </Stack>
                <Button
                  component={Link}
                  href="/admin/products"
                  size="small"
                  endIcon={<FontAwesomeIcon icon={faArrowRight} size="xs" />}
                  sx={{
                    textTransform: "none",
                    color: getSecondaryTextColor(),
                    fontSize: "0.7rem",
                    "&:hover": { color: getTextColor() },
                  }}
                >
                  View All
                </Button>
              </Stack>

              <Divider sx={{ borderColor: getBorderColor(), mb: 2 }} />

              {recentProducts.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <Typography
                    sx={{ color: getSecondaryTextColor(), fontSize: "0.9rem" }}
                  >
                    No products added yet.
                  </Typography>
                  <Button
                    component={Link}
                    href="/admin/products"
                    size="small"
                    startIcon={<FontAwesomeIcon icon={faPlus} size="sm" />}
                    sx={{
                      mt: 1.5,
                      textTransform: "none",
                      borderRadius: 1.5,
                      bgcolor: isDarkMode ? "#ffffff" : "#171512",
                      color: isDarkMode ? "#171512" : "#ffffff",
                      "&:hover": {
                        bgcolor: isDarkMode
                          ? "rgba(255,255,255,0.9)"
                          : "#2d2a26",
                      },
                    }}
                  >
                    Add Your First Product
                  </Button>
                </Box>
              ) : (
                <Stack spacing={1}>
                  {recentProducts.map((item, index) => (
                    <Stack
                      key={item.id}
                      component={Link}
                      href={`/admin/products/${item.id}`}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        textDecoration: "none",
                        color: "inherit",
                        px: 1.5,
                        py: 1.2,
                        borderRadius: 1.5,
                        border: `1px solid transparent`,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: getHoverBgColor(),
                          borderColor: getBorderColor(),
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            bgcolor: isDarkMode
                              ? "rgba(255,255,255,0.08)"
                              : "primary.light",
                            color: getTextColor(),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Box>
                          <Typography
                            sx={{
                              color: getTextColor(),
                              fontWeight: 500,
                              fontSize: "0.9rem",
                            }}
                          >
                            {item.name}
                          </Typography>
                          <Typography
                            sx={{
                              color: getSecondaryTextColor(),
                              fontSize: "0.75rem",
                            }}
                          >
                            Stock: {item.stock_count ?? 0}
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip
                        label={
                          item.stock_count && item.stock_count > 0
                            ? "In Stock"
                            : "Out of Stock"
                        }
                        size="small"
                        color={
                          item.stock_count && item.stock_count > 0
                            ? "success"
                            : "error"
                        }
                        sx={{
                          fontSize: "0.55rem",
                          height: 20,
                          fontWeight: 500,
                        }}
                      />
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Products */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              border: `1px solid ${getBorderColor()}`,
              borderRadius: 2,
              boxShadow: "none",
              bgcolor: getCardBgColor(),
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      bgcolor: isDarkMode ? "rgba(239,83,80,0.15)" : "#fce4ec",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isDarkMode ? "#ef5350" : "#d32f2f",
                    }}
                  >
                    <FontAwesomeIcon icon={faCircleXmark} size="sm" />
                  </Box>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ color: getTextColor(), fontSize: "1rem" }}
                  >
                    Low Stock Alerts
                  </Typography>
                </Stack>
                <Chip
                  label={lowStockProducts.length}
                  size="small"
                  color="error"
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    bgcolor: isDarkMode ? "rgba(239,83,80,0.2)" : undefined,
                    color: isDarkMode ? "#ef5350" : undefined,
                  }}
                />
              </Stack>

              <Divider sx={{ borderColor: getBorderColor(), mb: 2 }} />

              {lowStockProducts.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      bgcolor: isDarkMode ? "rgba(76,175,80,0.15)" : "#e8f5e9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 1.5,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      size="lg"
                      style={{ color: isDarkMode ? "#81c784" : "#2e7d32" }}
                    />
                  </Box>
                  <Typography
                    sx={{ color: getTextColor(), fontSize: "0.9rem" }}
                  >
                    All products have sufficient stock!
                  </Typography>
                  <Typography
                    sx={{ color: getSecondaryTextColor(), fontSize: "0.75rem" }}
                  >
                    No low stock alerts at this time.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1}>
                  {lowStockProducts.map((item) => (
                    <Stack
                      key={item.id}
                      component={Link}
                      href={`/admin/products/${item.id}`}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        textDecoration: "none",
                        color: "inherit",
                        px: 1.5,
                        py: 1.2,
                        borderRadius: 1.5,
                        border: `1px solid ${isDarkMode ? "rgba(239,83,80,0.2)" : "#ffebee"}`,
                        bgcolor: isDarkMode
                          ? "rgba(239,83,80,0.08)"
                          : "#fff5f5",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: isDarkMode
                            ? "rgba(239,83,80,0.15)"
                            : "#ffebee",
                          borderColor: isDarkMode
                            ? "rgba(239,83,80,0.3)"
                            : "#ffcdd2",
                        },
                      }}
                    >
                      <Stack spacing={0.3}>
                        <Typography
                          sx={{
                            color: getTextColor(),
                            fontWeight: 500,
                            fontSize: "0.9rem",
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          sx={{
                            color: isDarkMode ? "#ef9a9a" : "error.main",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                          }}
                        >
                          Only {item.stock_count} left in stock
                        </Typography>
                      </Stack>
                      <Button
                        size="small"
                        component={Link}
                        href={`/admin/products/${item.id}`}
                        sx={{
                          textTransform: "none",
                          borderRadius: 1,
                          borderColor: getBorderColor(),
                          color: getTextColor(),
                          fontSize: "0.65rem",
                          "&:hover": {
                            borderColor: getTextColor(),
                            bgcolor: getHoverBgColor(),
                          },
                        }}
                        variant="outlined"
                      >
                        Restock
                      </Button>
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Stock Overview Progress */}
      <Card
        sx={{
          border: `1px solid ${getBorderColor()}`,
          borderRadius: 2,
          boxShadow: "none",
          bgcolor: getCardBgColor(),
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: isDarkMode
                      ? "rgba(255,255,255,0.08)"
                      : "primary.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isDarkMode ? "#ffffff" : "primary.main",
                  }}
                >
                  <FontAwesomeIcon icon={faStore} size="sm" />
                </Box>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ color: getTextColor(), fontSize: "1rem" }}
                >
                  Inventory Overview
                </Typography>
              </Stack>
              <Typography
                sx={{
                  color: getSecondaryTextColor(),
                  fontSize: "0.85rem",
                  fontWeight: 500,
                }}
              >
                {stockPercentage}% Stocked
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={stockPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: isDarkMode ? "rgba(255,255,255,0.08)" : "#f0ebe3",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  bgcolor:
                    stockPercentage > 70
                      ? isDarkMode
                        ? "#66bb6a"
                        : "#2e7d32"
                      : stockPercentage > 40
                        ? isDarkMode
                          ? "#ffa726"
                          : "#ed6c02"
                        : isDarkMode
                          ? "#ef5350"
                          : "#d32f2f",
                },
              }}
            />

            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mt: 0.5 }}
            >
              <Stack direction="row" spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: isDarkMode ? "#66bb6a" : "#2e7d32",
                    }}
                  />
                  <Typography
                    sx={{ color: getSecondaryTextColor(), fontSize: "0.7rem" }}
                  >
                    In Stock ({overview?.productsInStock ?? 0})
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: isDarkMode ? "#ffa726" : "#ed6c02",
                    }}
                  />
                  <Typography
                    sx={{ color: getSecondaryTextColor(), fontSize: "0.7rem" }}
                  >
                    Low Stock ({lowStockProducts.length})
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: isDarkMode ? "#ef5350" : "#d32f2f",
                    }}
                  />
                  <Typography
                    sx={{ color: getSecondaryTextColor(), fontSize: "0.7rem" }}
                  >
                    Out of Stock ({overview?.productsOutOfStock ?? 0})
                  </Typography>
                </Box>
              </Stack>
              <Typography
                sx={{ color: getSecondaryTextColor(), fontSize: "0.7rem" }}
              >
                Total: {overview?.totalProducts ?? 0}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};
