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
  const aboutStory =
    brand.story ||
    "Zuriè was founded to create handbags that blend timeless design, premium materials, and everyday functionality.";
  const aboutStatement =
    "We believe a bag should hold more than your essentials, it should hold your confidence.";

  return (
    <Stack spacing={0}>
      <Box
        sx={{
          position: "relative",
          height: { xs: 260, sm: 360, md: 520 },
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
          style={{ objectFit: "cover", objectPosition: "50% 18%" }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(20,18,16,0.18) 0%, rgba(20,18,16,0.38) 100%)",
          }}
        />
      </Box>

      <Container
        maxWidth="md"
        sx={{ py: { xs: 5.5, md: 8 }, textAlign: "center" }}
      >
        <Typography
          sx={{
            textTransform: "uppercase",
            letterSpacing: "0.24em",
            fontSize: { xs: "0.68rem", md: "0.72rem" },
            color: "#b39a72",
            mb: 2,
          }}
        >
          Est. with intention
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 1.4 }}>
          {aboutStatement}
        </Typography>
        <Typography color="text.secondary">
          {aboutStory}
        </Typography>
      </Container>

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
            <Box sx={{ position: "relative", height: { xs: 360, md: 700 } }}>
              <Image
                src={'/images/products/new3.avif'}
                alt="Zuriè atelier"
                fill
                sizes="(max-width: 900px) 100vw, 48vw"
                style={{ objectFit: "cover", objectPosition: "50% 22%" }}
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
                  fontSize: { xs: "1rem", md: "2rem" },
                  lineHeight: 1.6,
                  fontFamily: "var(--font-playfair), serif",
                }}
              >
                {brand.story}
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
                }}
              >
                Discover Our Story
                <FontAwesomeIcon icon={faArrowRight} fontSize={10} />
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4.5, md: 6.6 } }}>
        <Grid container spacing={{ xs: 1.2, md: 1.5 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 0,
                boxShadow: "none",
                height: "100%",
                bgcolor: "background.paper",
              }}
            >
              <CardContent>
                <Typography sx={{ fontWeight: 700, mb: 0.8 }}>Material Integrity</Typography>
                <Typography color="text.secondary" sx={{ fontSize: "0.9rem" }}>
                  Full-grain leather, honest hardware, and finishes designed to mature beautifully.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 0,
                boxShadow: "none",
                height: "100%",
                bgcolor: "background.paper",
              }}
            >
              <CardContent>
                <Typography sx={{ fontWeight: 700, mb: 0.8 }}>Handcrafted</Typography>
                <Typography color="text.secondary" sx={{ fontSize: "0.9rem" }}>
                  From edge paint to stitching, each step is treated as a ceremony of care.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 0,
                boxShadow: "none",
                height: "100%",
                bgcolor: "background.paper",
              }}
            >
              <CardContent>
                <Typography sx={{ fontWeight: 700, mb: 0.8 }}>Lifetime Promise</Typography>
                <Typography color="text.secondary" sx={{ fontSize: "0.9rem" }}>
                  Every piece is backed by dedicated aftercare and repair guidance.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Stack>
  );
}
