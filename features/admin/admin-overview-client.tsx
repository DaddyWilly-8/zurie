"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBoxArchive,
  faCircleCheck,
  faCircleXmark,
  faComment,
  faTags,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { dashboardService } from "@/services/dashboard/dashboard.service";

const StatCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: typeof faBoxArchive;
}) => (
  <Card
    sx={{
      height: "100%",
      border: "1px solid",
      borderColor: "divider",
      boxShadow: "none",
      borderRadius: 0,
      bgcolor: "background.paper",
      px: 2.6,
      py: 2.2,
    }}
  >
    <Stack spacing={1.6}>
      <Box sx={{ color: "primary.main" }}>
        <FontAwesomeIcon icon={icon} />
      </Box>
      <Typography sx={{ fontSize: "2.1rem", lineHeight: 1, color: "text.primary" }}>
        {value}
      </Typography>
      <Typography
        sx={{
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          fontSize: "0.8rem",
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>
    </Stack>
  </Card>
);

type Overview = {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  totalCategories: number;
  pendingOrders: number;
  completedOrders: number;
  enquiries: number;
  recentProducts: Array<{ id: string; name: string; stock_count?: number }>;
  lowStockProducts: Array<{ id: string; name: string; stock_count: number }>;
  recentOrders: Array<{ id: string; order_number: string; status: string }>;
  recentEnquiries: Array<{ id: string; name: string; status: string }>;
};

const emptyOverview: Overview = {
  totalProducts: 0,
  activeProducts: 0,
  outOfStockProducts: 0,
  totalCategories: 0,
  pendingOrders: 0,
  completedOrders: 0,
  enquiries: 0,
  recentProducts: [],
  lowStockProducts: [],
  recentOrders: [],
  recentEnquiries: [],
};

export const AdminOverviewClient = () => {
  const {
    data: overview = emptyOverview,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => dashboardService.getOverview() as Promise<Overview>,
    initialData: emptyOverview,
  });

  const stats = [
    { label: "Total Products", value: overview.totalProducts, icon: faBoxArchive },
    { label: "In Stock", value: overview.activeProducts, icon: faCircleCheck },
    { label: "Out Of Stock", value: overview.outOfStockProducts, icon: faCircleXmark },
    { label: "Categories", value: overview.totalCategories, icon: faTags },
    { label: "New Enquiries", value: overview.enquiries, icon: faComment },
  ];

  const actionButtonSx = {
    borderRadius: 0,
    borderColor: "divider",
    color: "text.primary",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    fontSize: "0.78rem",
    px: 2.6,
    py: 1.2,
    justifyContent: "flex-start",
    whiteSpace: "nowrap",
    "&:hover": {
      borderColor: "text.primary",
      bgcolor: "action.hover",
    },
  } as const;

  return (
    <Stack spacing={4} sx={{ pb: 2 }}>
      <Typography sx={{ color: "text.primary", fontSize: { xs: "2rem", md: "2.2rem" } }}>
        Overview
      </Typography>
      {isError ? (
        <Typography color="error.main">Failed to load overview.</Typography>
      ) : isLoading ? (
        <Typography color="text.secondary">Loading overview...</Typography>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(5, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        {stats.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} icon={item.icon} />
        ))}
      </Box>

      <Stack spacing={1.4}>
        <Typography
          variant="overline"
          sx={{ letterSpacing: "0.38em", color: "text.secondary", fontSize: "0.74rem" }}
        >
          Quick Actions
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(5, minmax(0, 1fr))",
            },
            gap: 1.4,
          }}
        >
          <Button component={Link} href="/admin/products" variant="outlined" sx={actionButtonSx}>
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} />
            Add Product
          </Button>
          <Button component={Link} href="/admin/products" variant="outlined" sx={actionButtonSx}>
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} />
            View Products
          </Button>
          <Button component={Link} href="/admin/categories" variant="outlined" sx={actionButtonSx}>
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} />
            Add Category
          </Button>
          <Button component={Link} href="/admin/homepage" variant="outlined" sx={actionButtonSx}>
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} />
            Manage Homepage
          </Button>
          <Button component={Link} href="/admin/enquiries" variant="outlined" sx={actionButtonSx}>
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} />
            View Enquiries
          </Button>
        </Box>
      </Stack>

      <Card sx={{ border: "1px solid", borderColor: "divider", borderRadius: 0, boxShadow: "none", bgcolor: "background.paper" }}>
        <Box sx={{ px: 1.8, py: 1.6 }}>
          <Typography
            variant="overline"
            sx={{ letterSpacing: "0.34em", color: "text.secondary", fontSize: "0.72rem" }}
          >
            Recently Added Products
          </Typography>
        </Box>
        <Box>
          {overview.recentProducts.length === 0 ? (
            <Typography sx={{ color: "text.secondary", px: 2, pb: 2 }}>
              No product records yet.
            </Typography>
          ) : (
            overview.recentProducts.map((item) => (
              <Stack
                key={item.id}
                component={Link}
                href="/admin/products"
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  textDecoration: "none",
                  color: "inherit",
                  px: 1.8,
                  py: 1.4,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Stack spacing={0.2}>
                  <Typography sx={{ color: "text.primary", fontWeight: 500 }}>{item.name}</Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: "0.84rem" }}>
                    Stock {item.stock_count ?? 0}
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: "text.secondary",
                    fontSize: "0.72rem",
                  }}
                >
                  Manage <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 5 }} />
                </Typography>
              </Stack>
            ))
          )}
        </Box>
      </Card>
    </Stack>
  );
};
