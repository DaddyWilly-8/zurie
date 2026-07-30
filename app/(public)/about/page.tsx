import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { buildMetadata } from "@/lib/metadata";
import { getBrandContent } from "@/services/content";

export const metadata = buildMetadata({
  title: "About Zuriè",
  description:
    "Learn about Zuriè's story, mission, and luxury quality commitment.",
  path: "/about",
});

export default async function AboutPage() {
  const brand = await getBrandContent();
  const values = [
    {
      title: "Material Integrity",
      text: "Full-grain leather, honest hardware, and finishes designed to mature beautifully.",
    },
    {
      title: "Handcrafted",
      text: "From edge paint to stitching, each step is treated as a ceremony of care.",
    },
    {
      title: "Considered Design",
      text: "Balanced silhouettes with practical compartments and refined daily proportions.",
    },
    {
      title: "Lifetime Promise",
      text: "Every piece is backed by dedicated aftercare and repair guidance.",
    },
  ];
  const editorialPhotos = [
    {
      src: "/images/products/aurelia-2.png",
      alt: "Zurie craftsmanship detail",
      minHeight: { xs: 260, md: 420 },
    },
    {
      src: "/images/instagram/ig-3.png",
      alt: "Zurie atelier ritual",
      minHeight: { xs: 180, md: 200 },
    },
    {
      src: "/images/instagram/ig-6.png",
      alt: "Zurie material palette",
      minHeight: { xs: 180, md: 200 },
    },
  ];

  return (
    <Stack spacing={0}>
      <Box
        sx={{
          position: "relative",
          height: { xs: 160, md: 220 },
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
          overflow: "hidden",
        }}
      >
        <Image
          src={brand.heroImage}
          alt="Zuriè atelier"
          fill
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "50% 28%" }}
        />
      </Box>

      <Container
        maxWidth="md"
        sx={{ py: { xs: 4.5, md: 6.5 }, textAlign: "center" }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: { xs: "1.8rem", md: "2.5rem" },
            mb: 1,
          }}
        >
          We believe a bag should hold more than your essentials, it should hold
          your confidence.
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 1.4 }}>
          {brand.story}
        </Typography>
        <Typography color="text.secondary">
          Today every Zuriè piece is still shaped by hand intended to endure, to
          age well, and to become part of a contemporary ritual.
        </Typography>
      </Container>

      <Container maxWidth="lg" sx={{ pb: { xs: 5, md: 6.4 } }}>
        <Grid container spacing={{ xs: 1.2, md: 1.8 }}>
          <Grid size={{ xs: 12, md: 7.2 }}>
            <Box
              sx={{
                position: "relative",
                minHeight: editorialPhotos[0].minHeight,
                overflow: "hidden",
                bgcolor: "#efe7dc",
              }}
            >
              <Image
                src={editorialPhotos[0].src}
                alt={editorialPhotos[0].alt}
                fill
                sizes="(max-width: 900px) 100vw, 58vw"
                style={{ objectFit: "cover" }}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4.8 }}>
            <Stack spacing={{ xs: 1.2, md: 1.8 }} sx={{ height: "100%" }}>
              {editorialPhotos.slice(1).map((photo) => (
                <Box
                  key={photo.src}
                  sx={{
                    position: "relative",
                    minHeight: photo.minHeight,
                    overflow: "hidden",
                    bgcolor: "#efe7dc",
                    flex: 1,
                  }}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 900px) 100vw, 42vw"
                    style={{ objectFit: "cover" }}
                  />
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <Box
        sx={{
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
          bgcolor: "#131211",
          color: "#ece4d6",
          py: { xs: 4, md: 5 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  fontSize: "0.68rem",
                  color: "#bfa37e",
                }}
              >
                Our Vision
              </Typography>
              <Typography sx={{ mt: 1.2 }}>{brand.vision}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  fontSize: "0.68rem",
                  color: "#bfa37e",
                }}
              >
                Our Mission
              </Typography>
              <Typography sx={{ mt: 1.2 }}>{brand.mission}</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4.5, md: 6.6 } }}>
        <Stack alignItems="center" spacing={1.1} sx={{ mb: 3.2 }}>
          <Typography
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.24em",
              fontSize: "0.68rem",
              color: "primary.main",
            }}
          >
            Why Zuriè
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            The Zuriè Difference
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 1.2, md: 1.5 }}>
          {values.map((value) => (
            <Grid key={value.title} size={{ xs: 12, md: 3 }}>
              <Card
                sx={{
                  border: "1px solid #e8ddcd",
                  borderRadius: 0,
                  boxShadow: "none",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography sx={{ fontWeight: 700, mb: 0.8 }}>
                    {value.title}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ fontSize: "0.9rem" }}
                  >
                    {value.text}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ bgcolor: "#f6f2ed", py: { xs: 4.5, md: 7 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
            <Grid size={{ xs: 12, md: 4.6 }}>
              <Box sx={{ position: "relative", height: { xs: 320, md: 410 } }}>
                <Image
                  src="/images/products/luna-1.png"
                  alt="Zuriè detail"
                  fill
                  sizes="(max-width: 900px) 100vw, 40vw"
                  style={{ objectFit: "cover" }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 7.4 }}>
              <Typography
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  fontSize: "0.66rem",
                  color: "primary.main",
                }}
              >
                Craft in Detail
              </Typography>
              <Typography
                sx={{
                  mt: 1,
                  mb: 1.3,
                  fontFamily: "var(--font-playfair), serif",
                  fontSize: { xs: "1.8rem", md: "2.6rem" },
                }}
              >
                Obsessed with the unseen.
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 1.4 }}>
                {brand.qualityCommitment}
              </Typography>
              <Stack spacing={0.7} color="text.secondary" sx={{ mb: 2.2 }}>
                <Typography component="div">
                  • Full-grain leather selected for texture retention
                </Typography>
                <Typography component="div">
                  • Sculpted silhouettes balanced with all-day comfort
                </Typography>
                <Typography component="div">
                  • Every seam inspected by a master artisan before release
                </Typography>
              </Stack>
              <Typography
                component={Link}
                href="/shop"
                sx={{
                  textDecoration: "none",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  fontSize: "0.72rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                Explore The Collection
                <FontAwesomeIcon icon={faArrowRight} fontSize={10} />
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Stack>
  );
}
