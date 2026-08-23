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
  Chip,
  Skeleton,
  Paper,
  useTheme,
  Avatar,
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
  faClock,
  faUser,
  faUsers,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import {
  dashboardService,
  type DashboardOverview,
  type ApiProduct,
  type ApiOrder,
  type ApiCustomer,
} from "@/services/dashboard/dashboard.service";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { formatBaseCurrencyInCurrency } from "@/utils/currency";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type StatCardProps = {
  label: string;
  value: number | string;
  icon: IconProp;
  href: string;
  color?: string;
  subtitle?: string;
  isDarkMode: boolean;
  loading?: boolean;
};

const StatCard = ({
  label,
  value,
  icon,
  href,
  color,
  subtitle,
  isDarkMode,
  loading = false,
}: StatCardProps) => {
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

  if (loading) {
    return (
      <Card
        sx={{
          height: "100%",
          border: `1px solid ${getBorderColor()}`,
          borderRadius: 2,
          bgcolor: isDarkMode ? "rgba(255,255,255,0.03)" : "background.paper",
          p: 2.5,
        }}
      >
        <Stack spacing={1.5}>
          <Skeleton variant="circular" width={44} height={44} />
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="80%" height={20} />
        </Stack>
      </Card>
    );
  }

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
        {/* Icon pekee yake */}
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

        {/* Label + Value inline, right-aligned */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
          spacing={2}
        >
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

          <Typography
            sx={{
              fontSize: "2rem",
              lineHeight: 1,
              color: isDarkMode ? "#ffffff" : "text.primary",
              fontWeight: 600,
              textAlign: "right",
            }}
          >
            {value ?? 0}
          </Typography>
        </Stack>

        {/* Subtitle (right-aligned) */}
        {subtitle && (
          <Typography
            sx={{
              fontSize: "0.7rem",
              color: isDarkMode ? "rgba(255,255,255,0.5)" : "text.secondary",
              textAlign: "right",
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
};

const emptyOverview: DashboardOverview = {
  totalProducts: 0,
  productsInStock: 0,
  productsOutOfStock: 0,
  totalCategories: 0,
  newOrders: 0,
  recentOrders: [],
  recentProducts: [],
  recentCustomers: [],
};

const getStatusColor = (status: string) => {
  const colors: Record<
    string,
    "primary" | "success" | "warning" | "error" | "info" | "default"
  > = {
    new: "primary",
    confirmed: "info",
    processing: "warning",
    ready_for_delivery: "success",
    delivered: "success",
    cancelled: "error",
    published: "success",
    draft: "warning",
    archived: "error",
  };
  return colors[status] || "default";
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    new: "New",
    confirmed: "Confirmed",
    processing: "Processing",
    ready_for_delivery: "Ready for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    published: "Published",
    draft: "Draft",
    archived: "Archived",
  };
  return labels[status] || status;
};

export const AdminOverviewClient = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);

  const {
    data: overview = emptyOverview,
    isLoading,
    isError,
  } = useQuery<DashboardOverview>({
    queryKey: ["admin-overview"],
    queryFn: () => dashboardService.getOverview(),
  });

  const recentOrders: ApiOrder[] = overview?.recentOrders ?? [];
  const recentProducts: ApiProduct[] = overview?.recentProducts ?? [];
  const recentCustomers: ApiCustomer[] = overview?.recentCustomers ?? [];

  // Calculate additional metrics
  const totalRevenue = recentOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );
  const averageOrderValue =
    recentOrders.length > 0 ? totalRevenue / recentOrders.length : 0;

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
    },
    {
      label: "In Stock",
      value: overview?.productsInStock ?? 0,
      icon: faCircleCheck,
      href: "/admin/products?status=published",
      color: "#4caf50",
      subtitle: `${overview?.totalProducts > 0 ? Math.round(((overview.productsInStock ?? 0) / (overview.totalProducts ?? 1)) * 100) : 0}% of products`,
    },
    {
      label: "Out of Stock",
      value: overview?.productsOutOfStock ?? 0,
      icon: faCircleXmark,
      href: "/admin/products?status=out_of_stock",
      color: "#ef5350",
      subtitle: "Need restock",
    },
    {
      label: "Categories",
      value: overview?.totalCategories ?? 0,
      icon: faTags,
      href: "/admin/categories",
      subtitle: "Product categories",
    },
    {
      label: "New Orders",
      value: overview?.newOrders ?? 0,
      icon: faComment,
      href: "/admin/orders?status=new",
      color: "#42a5f5",
      subtitle: "Awaiting processing",
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

  return (
    <Stack spacing={3} sx={{ pb: 2 }}>
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
      </Stack>

      {/* Stats Grid */}
      {isError ? (
        <Typography color="error.main">Failed to load overview.</Typography>
      ) : isLoading ? (
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4, 5].map((index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <StatCard
                label="Loading"
                value={0}
                icon={faBoxArchive}
                href="#"
                isDarkMode={isDarkMode}
                loading={true}
              />
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
              isDarkMode={isDarkMode}
            />
          ))}
        </Box>
      )}

      {/* Quick Stats Row */}
      {!isLoading && !isError && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                border: `1px solid ${getBorderColor()}`,
                borderRadius: 2,
                boxShadow: "none",
                bgcolor: getCardBgColor(),
                p: 2.5,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: isDarkMode ? "rgba(255,215,0,0.15)" : "#fff8e1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#f9a825",
                  }}
                >
                  <FontAwesomeIcon icon={faDollarSign} size="lg" />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      color: getSecondaryTextColor(),
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.3em",
                    }}
                  >
                    Total Revenue
                  </Typography>
                  <Typography
                    sx={{
                      color: getTextColor(),
                      fontSize: "1.25rem",
                      fontWeight: 600,
                    }}
                  >
                    {formatBaseCurrencyInCurrency(
                      totalRevenue,
                      currency,
                      rates,
                    )}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                border: `1px solid ${getBorderColor()}`,
                borderRadius: 2,
                boxShadow: "none",
                bgcolor: getCardBgColor(),
                p: 2.5,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: isDarkMode ? "rgba(33,150,243,0.15)" : "#e3f2fd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1976d2",
                  }}
                >
                  <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      color: getSecondaryTextColor(),
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.3em",
                    }}
                  >
                    Avg Order Value
                  </Typography>
                  <Typography
                    sx={{
                      color: getTextColor(),
                      fontSize: "1.25rem",
                      fontWeight: 600,
                    }}
                  >
                    {formatBaseCurrencyInCurrency(
                      averageOrderValue,
                      currency,
                      rates,
                    )}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                border: `1px solid ${getBorderColor()}`,
                borderRadius: 2,
                boxShadow: "none",
                bgcolor: getCardBgColor(),
                p: 2.5,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: isDarkMode ? "rgba(76,175,80,0.15)" : "#e8f5e9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#388e3c",
                  }}
                >
                  <FontAwesomeIcon icon={faUsers} size="lg" />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      color: getSecondaryTextColor(),
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.3em",
                    }}
                  >
                    Customers
                  </Typography>
                  <Typography
                    sx={{
                      color: getTextColor(),
                      fontSize: "1.25rem",
                      fontWeight: 600,
                    }}
                  >
                    {recentCustomers.length}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                border: `1px solid ${getBorderColor()}`,
                borderRadius: 2,
                boxShadow: "none",
                bgcolor: getCardBgColor(),
                p: 2.5,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: isDarkMode ? "rgba(255,152,0,0.15)" : "#fff3e0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#e65100",
                  }}
                >
                  <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      color: getSecondaryTextColor(),
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.3em",
                    }}
                  >
                    Total Orders
                  </Typography>
                  <Typography
                    sx={{
                      color: getTextColor(),
                      fontSize: "1.25rem",
                      fontWeight: 600,
                    }}
                  >
                    {recentOrders.length}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Recent Activity Grid */}
      <Grid container spacing={3}>
        {/* Recent Products */}
        <Grid size={{ xs: 12, md: 4 }}>
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
                    Recent Products
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
                    No products yet.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {recentProducts.slice(0, 4).map((item) => (
                    <Stack
                      key={item.id}
                      component={Link}
                      href={`/admin/products/${item.id}`}
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      sx={{
                        textDecoration: "none",
                        color: "inherit",
                        p: 1.5,
                        borderRadius: 1.5,
                        border: `1px solid transparent`,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: getHoverBgColor(),
                          borderColor: getBorderColor(),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1,
                          bgcolor: isDarkMode
                            ? "rgba(255,255,255,0.05)"
                            : "#f8f6f2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        {item.imageUrls && item.imageUrls.length > 0 ? (
                          <Box
                            component="img"
                            src={item.imageUrls[0]}
                            alt={item.name}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faBoxArchive}
                            style={{
                              color: getSecondaryTextColor(),
                              fontSize: 20,
                            }}
                          />
                        )}
                      </Box>
                      <Box flex={1} minWidth={0}>
                        <Typography
                          sx={{
                            color: getTextColor(),
                            fontWeight: 500,
                            fontSize: "0.85rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mt: 0.5 }}
                        >
                          <Chip
                            label={
                              item.quantity && item.quantity > 0
                                ? `${item.quantity} in stock`
                                : "Out of stock"
                            }
                            size="small"
                            color={
                              item.quantity && item.quantity > 0
                                ? "success"
                                : "error"
                            }
                            sx={{
                              fontSize: "0.5rem",
                              height: 18,
                              fontWeight: 500,
                            }}
                          />
                          {item.status && (
                            <Chip
                              label={getStatusLabel(item.status)}
                              size="small"
                              color={getStatusColor(item.status)}
                              sx={{
                                fontSize: "0.5rem",
                                height: 18,
                                fontWeight: 500,
                              }}
                            />
                          )}
                        </Stack>
                      </Box>
                      <Typography
                        sx={{
                          color: getTextColor(),
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatBaseCurrencyInCurrency(
                          item.salePrice || item.price,
                          currency,
                          rates,
                        )}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Orders */}
        <Grid size={{ xs: 12, md: 4 }}>
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
                    <FontAwesomeIcon icon={faClock} size="sm" />
                  </Box>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ color: getTextColor(), fontSize: "1rem" }}
                  >
                    Recent Orders
                  </Typography>
                </Stack>
                <Button
                  component={Link}
                  href="/admin/orders"
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

              {recentOrders.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <Typography
                    sx={{ color: getSecondaryTextColor(), fontSize: "0.9rem" }}
                  >
                    No orders yet.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {recentOrders.slice(0, 4).map((order) => (
                    <Stack
                      key={order.id}
                      component={Link}
                      href={`/admin/orders/${order.orderNumber}`}
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      sx={{
                        textDecoration: "none",
                        color: "inherit",
                        p: 1.5,
                        borderRadius: 1.5,
                        border: `1px solid transparent`,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: getHoverBgColor(),
                          borderColor: getBorderColor(),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: isDarkMode
                            ? "rgba(255,255,255,0.05)"
                            : "#f8f6f2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faUser}
                          style={{
                            color: getSecondaryTextColor(),
                            fontSize: 16,
                          }}
                        />
                      </Box>
                      <Box flex={1} minWidth={0}>
                        <Typography
                          sx={{
                            color: getTextColor(),
                            fontWeight: 500,
                            fontSize: "0.85rem",
                          }}
                        >
                          {order.orderNumber}
                        </Typography>
                        <Typography
                          sx={{
                            color: getSecondaryTextColor(),
                            fontSize: "0.7rem",
                          }}
                        >
                          {order.customerName} •{" "}
                          {dayjs(order.createdAt).fromNow()}
                        </Typography>
                      </Box>
                      <Stack alignItems="flex-end" spacing={0.5}>
                        <Typography
                          sx={{
                            color: getTextColor(),
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          {formatBaseCurrencyInCurrency(
                            order.totalAmount,
                            currency,
                            rates,
                          )}
                        </Typography>
                        <Chip
                          label={getStatusLabel(order.status)}
                          size="small"
                          color={getStatusColor(order.status)}
                          sx={{
                            fontSize: "0.5rem",
                            height: 18,
                            fontWeight: 500,
                          }}
                        />
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Customers */}
        <Grid size={{ xs: 12, md: 4 }}>
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
                    <FontAwesomeIcon icon={faUsers} size="sm" />
                  </Box>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ color: getTextColor(), fontSize: "1rem" }}
                  >
                    Recent Customers
                  </Typography>
                </Stack>
                <Button
                  component={Link}
                  href="/admin/customers"
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

              {recentCustomers.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <Typography
                    sx={{ color: getSecondaryTextColor(), fontSize: "0.9rem" }}
                  >
                    No customers yet.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {recentCustomers.slice(0, 4).map((customer) => (
                    <Stack
                      key={customer.id}
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        border: `1px solid transparent`,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: getHoverBgColor(),
                          borderColor: getBorderColor(),
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: isDarkMode
                            ? "rgba(255,255,255,0.1)"
                            : "primary.main",
                          color: "#fff",
                        }}
                      >
                        {customer.name?.charAt(0) || "U"}
                      </Avatar>
                      <Box flex={1} minWidth={0}>
                        <Typography
                          sx={{
                            color: getTextColor(),
                            fontWeight: 500,
                            fontSize: "0.85rem",
                          }}
                        >
                          {customer.name}
                        </Typography>
                        <Typography
                          sx={{
                            color: getSecondaryTextColor(),
                            fontSize: "0.7rem",
                          }}
                        >
                          {customer.phone || "No phone"}
                          {customer.email && ` • ${customer.email}`}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          color: getSecondaryTextColor(),
                          fontSize: "0.65rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {dayjs(customer.createdAt).fromNow()}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
            Manage Products
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
          <Button
            component={Link}
            href="/admin/customers"
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faUsers} size="sm" />}
            sx={actionButtonSx}
          >
            Customers
          </Button>
          <Button
            component={Link}
            href="/admin/analytics"
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faChartLine} size="sm" />}
            sx={actionButtonSx}
          >
            Analytics
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
};
