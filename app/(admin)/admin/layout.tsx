import Link from "next/link";
import type { PropsWithChildren } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { requireAdmin } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: PropsWithChildren) {
  await requireAdmin();

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: "#121212" }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: 1.5 }}>
            <Typography variant="h6" sx={{ mr: 2 }}>
              Zuriè Admin
            </Typography>
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button color="inherit">{link.label}</Button>
              </Link>
            ))}
          </Toolbar>
        </Container>
      </AppBar>
      <Box sx={{ py: 4 }}>
        <Container maxWidth="xl">{children}</Container>
      </Box>
    </>
  );
}
