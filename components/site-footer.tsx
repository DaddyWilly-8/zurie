import Link from "next/link";
import {
  Box,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import { NewsletterForm } from "@/components/newsletter-form";
import { getStorefrontCategories } from "@/services/categories/category.service";

export const SiteFooter = async () => {
  const categories = await getStorefrontCategories();
  const shopLinks = categories
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name))
    .map((item) => ({ label: item.name, href: `/shop?category=${encodeURIComponent(item.slug)}` }));

  return (
    <Box
      component="footer"
      sx={{
        mt: 10,
        bgcolor: "#12100f",
        color: "#f2efe9",
        pt: 0,
        pb: 4,
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ py: { xs: 4.2, md: 5.2 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6.5 }}>
              <Typography
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  fontSize: "0.72rem",
                }}
              >
                The Zuriè Letter
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  mt: 1,
                  mb: 1.2,
                  fontSize: { xs: "1.9rem", md: "2.5rem" },
                  color: "#f7f1e8",
                }}
              >
                Join the atelier circle
              </Typography>
              <Typography color="rgba(242,239,233,0.72)">
                Private previews, new arrivals, and stories from the studio.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 5.5 }}>
              <NewsletterForm compact />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ borderColor: "#2e2925", mb: 4.2 }} />

        <Grid container spacing={5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              sx={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "2rem",
                mb: 1.3,
              }}
            >
              Zuriè
            </Typography>
            <Typography color="rgba(242,239,233,0.72)" maxWidth={360}>
              The architecture of elegance. Handcrafted leather goods for the
              modern woman.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 2.5 }}>
            <Typography
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                fontSize: "0.72rem",
                mb: 1.2,
              }}
            >
              Shop
            </Typography>
            <List disablePadding>
              <ListItem disableGutters sx={{ py: 0.4 }}>
                <Link href="/shop">All Products</Link>
              </ListItem>
              {shopLinks.map((item) => (
                <ListItem key={item.href} disableGutters sx={{ py: 0.4 }}>
                  <Link href={item.href}>{item.label}</Link>
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid size={{ xs: 12, md: 2.5 }}>
            <Typography
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                fontSize: "0.72rem",
                mb: 1.2,
              }}
            >
              Maison
            </Typography>
            <List disablePadding>
              <ListItem disableGutters sx={{ py: 0.4 }}>
                <Link href="/about">Our Story</Link>
              </ListItem>
              <ListItem disableGutters sx={{ py: 0.4 }}>
                <Link href="/contact">Contact</Link>
              </ListItem>
              <ListItem disableGutters sx={{ py: 0.4 }}>
                <Link href="/shop">New Arrivals</Link>
              </ListItem>
              <ListItem disableGutters sx={{ py: 0.4 }}>
                <Link href="/shop">Best Sellers</Link>
              </ListItem>
              <ListItem disableGutters sx={{ py: 0.4 }}>
                <Link href="/admin/login">Admin Login</Link>
              </ListItem>
            </List>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                fontSize: "0.72rem",
                mb: 1.2,
              }}
            >
              Contact
            </Typography>
            <Stack spacing={0.9}>
              <Typography color="rgba(242,239,233,0.72)">
                +255 718 752 434
              </Typography>
              <Typography color="rgba(242,239,233,0.72)">
                hello@zurie.co.tz
              </Typography>
              <Typography color="rgba(242,239,233,0.72)">
                Mlimani Tower, 1st Floor, Sam Nujoma Road, Dar es Salaam,
                Tanzania
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: "#2e2925", my: 3 }} />

        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={1}
        >
          <Typography variant="body2" color="rgba(242,239,233,0.54)">
            © {new Date().getFullYear()} Zuriè. All rights reserved.
          </Typography>
          <Typography variant="body2" color="rgba(242,239,233,0.54)">
            Crafted with intention.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};
