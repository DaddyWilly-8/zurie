"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { dashboardService } from "@/services/dashboard/dashboard.service";

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <Card>
    <CardContent>
      <Typography color="text.secondary">{label}</Typography>
      <Typography variant="h4">{value}</Typography>
    </CardContent>
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

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.2}>
        <Button component={Link} href="/admin/products" variant="contained">
          Add Product
        </Button>
        <Button component={Link} href="/admin/products" variant="outlined">
          View Products
        </Button>
        <Button component={Link} href="/admin/orders" variant="outlined">
          View Orders
        </Button>
        <Button component={Link} href="/admin/categories" variant="outlined">
          Add Category
        </Button>
        <Button component={Link} href="/admin/homepage" variant="outlined">
          Manage Homepage
        </Button>
      </Stack>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Total Products" value={overview.totalProducts} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Active Products" value={overview.activeProducts} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Out of Stock" value={overview.outOfStockProducts} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Total Categories" value={overview.totalCategories} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Pending Orders" value={overview.pendingOrders} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Completed Orders" value={overview.completedOrders} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Customer Enquiries" value={overview.enquiries} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.2 }}>
                Recently Added Products
              </Typography>
              <Stack spacing={0.7}>
                {overview.recentProducts.length === 0 ? (
                  <Typography color="text.secondary">No product records yet.</Typography>
                ) : (
                  overview.recentProducts.map((item) => (
                    <Typography key={item.id} color="text.secondary">
                      {item.name}
                    </Typography>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.2 }}>
                Low Stock Products
              </Typography>
              <Stack spacing={0.7}>
                {overview.lowStockProducts.length === 0 ? (
                  <Typography color="text.secondary">No low stock products.</Typography>
                ) : (
                  overview.lowStockProducts.map((item) => (
                    <Typography key={item.id} color="text.secondary">
                      {item.name} ({item.stock_count})
                    </Typography>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.2 }}>
                Recent Orders
              </Typography>
              <Stack spacing={0.7}>
                {overview.recentOrders.length === 0 ? (
                  <Typography color="text.secondary">No orders yet.</Typography>
                ) : (
                  overview.recentOrders.map((item) => (
                    <Typography key={item.id} color="text.secondary">
                      {item.order_number} - {item.status}
                    </Typography>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.2 }}>
                Recent Enquiries
              </Typography>
              <Stack spacing={0.7}>
                {overview.recentEnquiries.length === 0 ? (
                  <Typography color="text.secondary">No enquiries yet.</Typography>
                ) : (
                  overview.recentEnquiries.map((item) => (
                    <Typography key={item.id} color="text.secondary">
                      {item.name} - {item.status}
                    </Typography>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};
