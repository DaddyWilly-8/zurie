import Image from "next/image";
import Link from "next/link";
import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { SectionHeading } from "@/components/section-heading";
import { ProductCard } from "@/components/product-card";
import { InstagramGallery } from "@/components/instagram-gallery";
import { TestimonialCards } from "@/components/testimonial-cards";
import { getBrandContent } from "@/services/content";
import { getProducts } from "@/services/products";
import { buildMetadata } from "@/lib/metadata";
import { CATEGORY_OPTIONS } from "@/constants/categories";

export const metadata = buildMetadata({
  title: "Zuriè | Modern Luxury Women's Handbags",
  description:
    "Explore premium handbags, totes, crossbody pieces, and accessories crafted for modern elegance.",
  path: "/",
});

export default async function HomePage() {
  const [products, brand] = await Promise.all([
    getProducts(),
    getBrandContent(),
  ]);
  const pickImage = (...sources: Array<string | undefined>) =>
    sources.find((source) => typeof source === "string" && source.trim().length > 0) ??
    "/images/products/fallback.png";
  const featured = products.filter((p) => p.featured).slice(0, 3);
  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 3);
  const newArrivals = products.filter((p) => p.newArrival).slice(0, 3);
  const categoryImageMap: Record<string, string> = {
    handbags: "/images/products/aurelia-1.png",
    "tote-bags": "/images/products/serene-1.png",
    "shoulder-bags": "/images/products/celeste-1.png",
    "crossbody-bags": "/images/products/luna-2.png",
    wallets: "/images/products/serene-1.png",
    backpacks: "/images/products/nova-1.png",
  };
  const categoryCards = CATEGORY_OPTIONS.slice(0, 4)
    .map((category) => {
      return {
        label: category.label,
        href: `/shop?category=${encodeURIComponent(category.value)}`,
        image: pickImage(categoryImageMap[category.value]),
      };
    })
    .filter(Boolean) as Array<{ label: string; href: string; image: string }>;

  const heroImage = pickImage(
    "/images/hero/zurie-hero.png",
    featured[0]?.images[0]?.url,
    brand.heroImage,
  );
  const philosophyImage = pickImage(
    "/images/instagram/ig-4.png",
    products[1]?.images[0]?.url,
    heroImage,
  );

  return (
    <Stack spacing={{ xs: 6.5, md: 10 }}>
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "68vh", sm: "74vh", md: "86vh" },
          width: "100%",
          marginTop: { xs: -3, md: -6 },
          overflow: "hidden",
        }}
      >
        <Image
          src={heroImage}
          alt="Zuriè luxury handbag editorial"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(16,14,12,0.28) 0%, rgba(16,14,12,0.54) 100%)",
          }}
        />

        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 2,
            minHeight: { xs: "68vh", sm: "74vh", md: "86vh" },
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            px: 2.5,
          }}
        >
          <Box maxWidth={780}>
            <Typography
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.4em",
                fontSize: { xs: "0.62rem", md: "0.72rem" },
                color: "#f8efe1",
              }}
            >
              The Atelier Collection
            </Typography>
            <Typography
              sx={{
                mt: 1.5,
                fontFamily: "var(--font-playfair), serif",
                fontSize: { xs: "3rem", sm: "4.4rem", md: "7.2rem" },
                lineHeight: 0.95,
                color: "#fff",
              }}
            >
              Zuriè
            </Typography>
            <Typography
              sx={{
                mt: 3,
                mb: 4,
                color: "#efe8dc",
                fontFamily: "var(--font-playfair), serif",
                fontStyle: "italic",
                fontSize: { xs: "1.05rem", sm: "1.3rem", md: "2rem" },
              }}
            >
              The architecture of elegance, handcrafted for the modern woman.
            </Typography>
            <Button
              component={Link}
              href="/shop"
              variant="outlined"
              size="large"
              sx={{
                color: "#fff",
                borderColor: "rgba(255,255,255,0.48)",
                px: { xs: 3.2, md: 4.8 },
                py: 1.15,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                fontSize: { xs: "0.68rem", md: "0.74rem" },
                borderRadius: 0,
                "&:hover": {
                  borderColor: "#fff",
                  backgroundColor: "rgba(255,255,255,0.06)",
                },
              }}
            >
              Discover The Collection
              <Box component="span" sx={{ ml: 1.2 }}>
                <FontAwesomeIcon icon={faArrowRight} fontSize={12} />
              </Box>
            </Button>
          </Box>
        </Container>
      </Box>

      <Box
        sx={{
          width: "100%",
          bgcolor: "#120f0c",
          color: "#e9dfd0",
          py: 1.1,
          overflow: "hidden",
          borderTop: "1px solid #2e2720",
          borderBottom: "1px solid #2e2720",
          mt: 0,
          position: "relative",
          zIndex: 3,
        }}
      >
        <Box className="zurie-marquee-track">
          {Array.from({ length: 2 }).map((_, index) => (
            <Box key={index} className="zurie-marquee-item">
              <Typography component="span">
                Handcrafted in limited editions
              </Typography>
              <Typography component="span">·</Typography>
              <Typography component="span">
                Complimentary WhatsApp concierge
              </Typography>
              <Typography component="span">·</Typography>
              <Typography component="span">Full-grain calfskin</Typography>
              <Typography component="span">·</Typography>
              <Typography component="span">Gold-tone hardware</Typography>
              <Typography component="span">·</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ pb: 1 }}>
        <section>
          <SectionHeading
            eyebrow="Curated Selection"
            title="Featured Pieces"
            subtitle="Our signature pieces sculpted with purpose and polish."
          />
          <Grid container spacing={2.2}>
            {featured.map((p) => (
              <Grid key={p.id} size={{ xs: 12, sm: 6, md: 3 }}>
                <ProductCard product={p} />
              </Grid>
            ))}
          </Grid>
        </section>

        <section style={{ marginTop: "4rem" }}>
          <SectionHeading eyebrow="By Silhouette" title="Shop by Category" />
          <Grid container spacing={2.2}>
            {categoryCards.map((category) => (
              <Grid key={category.label} size={{ xs: 12, sm: 6, md: 3 }}>
                <Link href={category.href}>
                  <Box
                    sx={{
                      position: "relative",
                      height: { xs: 220, sm: 260, md: 300 },
                      border: "1px solid #e8dfd1",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={category.image}
                      alt={category.label}
                      fill
                      sizes="(max-width: 900px) 50vw, 25vw"
                      style={{ objectFit: "cover" }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,0.1) 38%, rgba(0,0,0,0.7) 100%)",
                        display: "flex",
                        alignItems: "flex-end",
                        p: 2,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography color="#fff" fontWeight={600}>
                          {category.label}
                        </Typography>
                        <Typography color="#fff" sx={{ opacity: 0.9 }}>
                          Explore
                        </Typography>
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          color="#fff"
                          fontSize={11}
                        />
                      </Stack>
                    </Box>
                  </Box>
                </Link>
              </Grid>
            ))}
          </Grid>
        </section>

        <section style={{ marginTop: "4.25rem" }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "start", md: "end" }}
            sx={{ mb: 3.2 }}
          >
            <SectionHeading eyebrow="Most Coveted" title="Best Sellers" />
            <Typography
              component={Link}
              href="/shop"
              sx={{
                textDecoration: "none",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: "0.72rem",
                color: "text.secondary",
                mb: { xs: 0, md: 2 },
              }}
            >
              View All
            </Typography>
          </Stack>
          <Grid container spacing={2.2}>
            {bestSellers.map((p) => (
              <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <ProductCard product={p} />
              </Grid>
            ))}
          </Grid>
        </section>

        <section style={{ marginTop: "4.4rem" }}>
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="stretch">
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ position: "relative", height: { xs: 360, md: 520 } }}>
                <Image
                  src={philosophyImage}
                  alt="Zuriè atelier"
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                />
              </Box>
            </Grid>
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{
                backgroundColor: "#f2ebde",
                border: "1px solid #e6dccb",
                display: "grid",
                placeItems: "center",
                px: { xs: 3, md: 6 },
                py: { xs: 3.5, md: 0 },
              }}
            >
              <Box>
                <Typography
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.24em",
                    fontSize: "0.72rem",
                    color: "primary.main",
                  }}
                >
                  The Zuriè Philosophy
                </Typography>
                <Typography
                  variant="h2"
                  sx={{ mt: 1, mb: 2, fontSize: { xs: "2rem", md: "3rem" } }}
                >
                  Form follows feeling.
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 1.8 }}>
                  {brand.story}
                </Typography>
                <Typography color="text.secondary">
                  We believe in quiet luxury objects that speak through touch,
                  weight, and timeless proportion.
                </Typography>
                <Typography
                  component={Link}
                  href="/about"
                  sx={{
                    mt: 3,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    textDecoration: "none",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    fontSize: "0.74rem",
                  }}
                >
                  Discover Our Story
                  <FontAwesomeIcon icon={faArrowRight} fontSize={10} />
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </section>

        <section style={{ marginTop: "4.4rem" }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "start", md: "end" }}
            sx={{ mb: 3.2 }}
          >
            <SectionHeading
              eyebrow="Fresh from the Studio"
              title="New Arrivals"
            />
            <Typography
              component={Link}
              href="/shop"
              sx={{
                textDecoration: "none",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: "0.72rem",
                color: "text.secondary",
                mb: { xs: 0, md: 2 },
              }}
            >
              View All
            </Typography>
          </Stack>
          <Grid container spacing={2.2}>
            {newArrivals.map((p) => (
              <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <ProductCard product={p} />
              </Grid>
            ))}
          </Grid>
        </section>

        <section style={{ marginTop: "4.4rem" }}>
          <SectionHeading
            eyebrow="Words from Our Women"
            title="The Zuriè Circle"
          />
          <TestimonialCards />
        </section>

        <section style={{ marginTop: "4.4rem" }}>
          <SectionHeading
            eyebrow="@zurie"
            title="The Gallery"
            subtitle="Follow our world on Instagram"
          />
          <InstagramGallery />
        </section>
      </Container>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Zuriè",
            url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
            logo: "/images/logo.png",
          }),
        }}
      />
    </Stack>
  );
}
