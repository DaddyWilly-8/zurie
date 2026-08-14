import Image from "next/image";
import Link from "next/link";
import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { SectionHeading } from "@/components/section-heading";
import { ProductCard } from "@/components/product-card";
import { TestimonialCards } from "@/components/testimonial-cards";
import { getBrandContent, getHomepageContent } from "@/services/content";
import { getProducts } from "@/services/products";
import { getStorefrontCategories } from "@/services/categories/category.service";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Zuriè | Modern Luxury Women's Handbags",
  description:
    "Explore premium handbags, totes, crossbody pieces, and accessories crafted for modern elegance.",
  path: "/",
});

export default async function HomePage() {
  const [
    products,
    featuredRows,
    bestSellerRows,
    newArrivalRows,
    brand,
    homepage,
  ] = await Promise.all([
    getProducts({ page: 1, pageSize: 12 }),
    getProducts({ featured: true, page: 1, pageSize: 3 }),
    getProducts({ bestSeller: true, page: 1, pageSize: 3 }),
    getProducts({ newArrival: true, page: 1, pageSize: 3 }),
    getBrandContent(),
    getHomepageContent(),
  ]);
  const categories = await getStorefrontCategories();

  const homepageData = (homepage as Record<string, unknown> | null) ?? null;
  const heroTitle = "Zuriè";
  const heroSubtitle = "The Atelier Collection";
  const heroDescription =
    "The architecture of elegance, handcrafted for the modern woman.";
  const heroButtonText = "Discover The Collection";
  const heroButtonLink = String(homepageData?.heroButtonLink ?? "/shop");
  const heroImageFromCms =
    typeof homepageData?.heroImage === "string"
      ? homepageData.heroImage
      : undefined;
  const heroActive = Boolean(homepageData?.heroActive ?? true);

  const bannerActive = Boolean(homepageData?.bannerActive ?? false);
  const bannerTitle = String(homepageData?.bannerTitle ?? "");
  const bannerDescription = String(homepageData?.bannerDescription ?? "");
  const bannerImage =
    typeof homepageData?.bannerImage === "string"
      ? homepageData.bannerImage
      : "";
  const bannerCtaText = String(homepageData?.bannerCtaText ?? "Learn More");
  const bannerCtaLink = String(homepageData?.bannerCtaLink ?? "/shop");

  const pickImage = (...sources: Array<string | undefined>) =>
    sources.find(
      (source) => typeof source === "string" && source.trim().length > 0,
    ) ?? "/images/products/fallback.png";

  const featured =
    featuredRows.length > 0 ? featuredRows.slice(0, 3) : products.slice(0, 3);
  const bestSellers =
    bestSellerRows.length > 0
      ? bestSellerRows.slice(0, 3)
      : products.slice(0, 3);
  const newArrivals =
    newArrivalRows.length > 0
      ? newArrivalRows.slice(0, 3)
      : products.slice(0, 3);

  // Filter categories with valid images and provide fallback
  const categoryCards = categories
    .slice(0, 4)
    .map((category) => {
      // Get the image URL or use fallback
      const image =
        category.imageUrl && category.imageUrl.trim().length > 0
          ? category.imageUrl
          : "/images/products/fallback.png";

      return {
        label: category.name,
        href: `/shop?category=${encodeURIComponent(category.slug)}`,
        image: image,
      };
    })
    .filter(Boolean) as Array<{ label: string; href: string; image: string }>;

  const heroImage = pickImage(
    "/images/hero/zurie-hero.png",
    heroImageFromCms,
    featured[0]?.images?.[0]?.url,
    brand.heroImage,
  );

  const philosophyText =
    "Zuriè was founded on a single, quiet conviction: that a handbag is not an accessory, but an architecture of self. Each piece is sculpted from full-grain calfskin, finished by hand, and engineered to age with grace. We believe in quiet luxury - objects that speak through their silence, their weight, their touch.";

  return (
    <Stack spacing={{ xs: 6.5, md: 10 }}>
      {heroActive ? (
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
                {heroSubtitle}
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
                {heroTitle}
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
                {heroDescription}
              </Typography>
              <Button
                component={Link}
                href={heroButtonLink}
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
                {heroButtonText}
                <Box component="span" sx={{ ml: 1.2 }}>
                  <FontAwesomeIcon icon={faArrowRight} fontSize={12} />
                </Box>
              </Button>
            </Box>
          </Container>
        </Box>
      ) : null}

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
                <Link href={category.href} style={{ textDecoration: "none" }}>
                  <Box
                    sx={{
                      position: "relative",
                      height: { xs: 220, sm: 260, md: 300 },
                      border: "1px solid",
                      borderColor: "divider",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "text.primary",
                        transform: "scale(1.01)",
                      },
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
          <Box
            sx={{
              width: "100vw",
              marginLeft: "calc(50% - 50vw)",
              marginRight: "calc(50% - 50vw)",
              bgcolor: "#121212",
              color: "#f3eee4",
              px: { xs: 2, md: 3.5 },
              py: { xs: 2, md: 2.2 },
            }}
          >
            <Grid container spacing={{ xs: 2.5, md: 4 }} alignItems="stretch">
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{ position: "relative", height: { xs: 360, md: 700 } }}
                >
                  <Image
                    src={"/images/products/new2.webp"}
                    alt="Zuriè atelier"
                    fill
                    sizes="(max-width: 900px) 100vw, 48vw"
                    style={{ objectFit: "cover" }}
                  />
                </Box>
              </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                sx={{
                  display: "grid",
                  placeItems: "center",
                  px: { xs: 1, md: 3 },
                  py: { xs: 2.5, md: 0 },
                }}
              >
                <Box sx={{ maxWidth: 590 }}>
                  <Typography
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.34em",
                      fontSize: "0.66rem",
                      color: "#b39a72",
                    }}
                  >
                    The Zuriè Philosophy
                  </Typography>
                  <Typography
                    sx={{
                      mt: 1.8,
                      mb: 2.6,
                      fontFamily: "var(--font-playfair), serif",
                      fontSize: { xs: "2.1rem", md: "3.8rem" },
                      lineHeight: 1.05,
                      color: "#efe8db",
                    }}
                  >
                    Form follows feeling.
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(243,238,228,0.78)",
                      fontSize: { xs: "1rem", md: "1rem" },
                      lineHeight: 1.6,
                      fontFamily: "var(--font-playfair), serif",
                    }}
                  >
                    {philosophyText}
                  </Typography>
                  <Typography
                    component={Link}
                    href="/about"
                    sx={{
                      mt: 3.4,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 1.2,
                      textDecoration: "none",
                      textTransform: "uppercase",
                      letterSpacing: "0.32em",
                      fontSize: "0.68rem",
                      color: "#f3eee4",
                      borderBottom: "1px solid rgba(243,238,228,0.34)",
                      pb: 0.8,
                      transition: "border-color 180ms ease, color 180ms ease",
                      "&:hover": {
                        borderColor: "rgba(243,238,228,0.85)",
                        color: "#fff",
                      },
                    }}
                  >
                    Discover Our Story
                    <FontAwesomeIcon icon={faArrowRight} fontSize={10} />
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
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
          {bannerActive && bannerImage && bannerImage.trim().length > 0 ? (
            <Box
              sx={{
                position: "relative",
                minHeight: { xs: 240, md: 300 },
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                mb: 4,
              }}
            >
              <Image
                src={bannerImage}
                alt={bannerTitle || "Promotional banner"}
                fill
                sizes="100vw"
                style={{ objectFit: "cover" }}
              />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.62))",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  textAlign: "center",
                  p: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    {bannerTitle}
                  </Typography>
                  <Typography
                    sx={{ mt: 1.2, mb: 2.2, color: "rgba(255,255,255,0.88)" }}
                  >
                    {bannerDescription}
                  </Typography>
                  <Button
                    component={Link}
                    href={bannerCtaLink}
                    variant="outlined"
                    color="inherit"
                  >
                    {bannerCtaText}
                  </Button>
                </Box>
              </Box>
            </Box>
          ) : null}

          <SectionHeading
            eyebrow="Words from Our Women"
            title="The Zuriè Circle"
          />
          <TestimonialCards />
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
