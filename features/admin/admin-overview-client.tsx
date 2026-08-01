"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
      border: "1px solid #e5ded2",
      boxShadow: "none",
      borderRadius: 0,
      bgcolor: "#ffffff",
      px: 2.6,
      py: 2.2,
    }}
  >
    <Stack spacing={1.6}>
      <Box sx={{ color: "#b89a68" }}>
        <FontAwesomeIcon icon={icon} />
      </Box>
      <Typography sx={{ fontSize: "2.1rem", lineHeight: 1, color: "#1d1a17" }}>
        {value}
      </Typography>
      <Typography
        sx={{
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          fontSize: "0.8rem",
          color: "#6f6658",
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
  const [overview, setOverview] = useState<Overview>(emptyOverview);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const payload = await dashboardService.getOverview();
        if (active) {
          setOverview(payload as Overview);
        }
      } catch {
        if (active) {
          setOverview(emptyOverview);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const stats = [
    { label: "Total Products", value: overview.totalProducts, icon: faBoxArchive },
    { label: "In Stock", value: overview.activeProducts, icon: faCircleCheck },
    { label: "Out Of Stock", value: overview.outOfStockProducts, icon: faCircleXmark },
    { label: "Categories", value: overview.totalCategories, icon: faTags },
    { label: "New Enquiries", value: overview.enquiries, icon: faComment },
  ];

  const actionButtonSx = {
    borderRadius: 0,
    borderColor: "#e6ddd1",
    color: "#1f1b16",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    fontSize: "0.78rem",
    px: 2.6,
    py: 1.2,
    justifyContent: "flex-start",
    whiteSpace: "nowrap",
    "&:hover": {
      borderColor: "#c9b8a0",
      bgcolor: "#f7f3ec",
    },
  } as const;

  return (
    <Stack spacing={4} sx={{ pb: 2 }}>
      <Typography sx={{ color: "#1d1a17", fontSize: { xs: "2rem", md: "2.2rem" } }}>
        Overview
      </Typography>

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
          sx={{ letterSpacing: "0.38em", color: "#6f6658", fontSize: "0.74rem" }}
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

      <Card sx={{ border: "1px solid #e5ded2", borderRadius: 0, boxShadow: "none", bgcolor: "#ffffff" }}>
        <Box sx={{ px: 1.8, py: 1.6 }}>
          <Typography
            variant="overline"
            sx={{ letterSpacing: "0.34em", color: "#6f6658", fontSize: "0.72rem" }}
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
                  borderTop: "1px solid #f0e8dd",
                  "&:hover": { bgcolor: "#faf7f2" },
                }}
              >
                <Stack spacing={0.2}>
                  <Typography sx={{ color: "#1d1a17", fontWeight: 500 }}>{item.name}</Typography>
                  <Typography sx={{ color: "#7f7568", fontSize: "0.84rem" }}>
                    Stock {item.stock_count ?? 0}
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: "#6f6658",
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
