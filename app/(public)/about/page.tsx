"use client";

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
  Divider,
  Chip,
  Button,
  useTheme,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faGem,
  faHands,
  faClock,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { getBrandContent } from "@/services/content";

// Values data
const values = [
  {
    icon: faGem,
    title: "Material Integrity",
    description:
      "Full-grain leather, honest hardware, and finishes designed to mature beautifully with age.",
    color: "#b39a72",
  },
  {
    icon: faHands,
    title: "Handcrafted Excellence",
    description:
      "From edge paint to stitching, each step is treated as a ceremony of care and precision.",
    color: "#8d6e63",
  },
  {
    icon: faClock,
    title: "Lifetime Promise",
    description:
      "Every piece is backed by dedicated aftercare and repair guidance for generations to come.",
    color: "#a1887f",
  },
];

// Stats data
const stats = [
  { value: "2018", label: "Founded" },
  { value: "12+", label: "Collections" },
  { value: "100%", label: "Handcrafted" },
  { value: "50+", label: "Artisans" },
];

// Testimonials
const testimonials = [
  {
    quote:
      "The finishing is immaculate. My Zuriè bag instantly elevates every outfit.",
    author: "Amina K.",
    location: "Nairobi",
  },
  {
    quote: "Minimal, elegant, and incredibly practical. Exactly what I wanted.",
    author: "Chantal M.",
    location: "Kigali",
  },
  {
    quote:
      "Luxury feel without compromise. Packaging and quality were flawless.",
    author: "Lerato P.",
    location: "Johannesburg",
  },
];

export default function AboutPage() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [brand, setBrand] = useState<{ story: string; heroImage: string }>({
    story: "",
    heroImage: "",
  });

  useEffect(() => {
    getBrandContent().then((data) => {
      setBrand(data);
    });
  }, []);

  const aboutStory =
    brand.story ||
    "Zuriè was founded to create handbags that blend timeless design, premium materials, and everyday functionality.";
  const aboutStatement =
    "We believe a bag should hold more than your essentials, it should hold your confidence.";

  // Dynamic styles based on theme
  const getBgColor = () => (isDarkMode ? "#0d0d0d" : "#f8f6f2");
  const getCardHoverShadow = () =>
    isDarkMode ? "0 8px 24px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.08)";
  const getDividerColor = () =>
    isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const getCardHoverBorder = () =>
    isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";
  const getIconBgColor = (color: string) =>
    isDarkMode ? `${color}25` : `${color}15`;

  return (
    <Stack spacing={0}>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 300, sm: 420, md: 560 },
          width: "100%",
          overflow: "hidden",
        }}
      >
        <Image
          src={brand.heroImage || "/images/about/hero-about.jpg"}
          alt="Zuriè atelier - handcrafted luxury handbags"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "50% 20%" }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(20,18,16,0.2) 0%, rgba(20,18,16,0.6) 100%)",
          }}
        />
        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box maxWidth={700}>
            <Chip
              label="Est. with Intention"
              sx={{
                bgcolor: "rgba(255,255,255,0.12)",
                color: "#f3eee4",
                borderColor: "rgba(255,255,255,0.2)",
                letterSpacing: "0.3em",
                fontSize: "0.6rem",
                height: 28,
                mb: 2,
                backdropFilter: "blur(8px)",
                textTransform: "uppercase",
              }}
              variant="outlined"
            />
            <Typography
              sx={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: { xs: "2.5rem", sm: "3.5rem", md: "5rem" },
                lineHeight: 1.05,
                color: "#fff",
                mb: 2,
              }}
            >
              The Art of <br /> Timeless Design
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.8)",
                fontSize: { xs: "1rem", md: "1.2rem" },
                maxWidth: 500,
                fontFamily: "var(--font-playfair), serif",
                fontStyle: "italic",
              }}
            >
              {aboutStatement}
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Story Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                position: "relative",
                height: { xs: 280, sm: 360, md: 440 },
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Image
                src="/images/products/new2.webp"
                alt="Zuriè handcrafted leather bag"
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    letterSpacing: "0.34em",
                    color: "#b39a72",
                    fontSize: "0.7rem",
                  }}
                >
                  Our Story
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-playfair), serif",
                    fontSize: { xs: "2rem", md: "2.8rem" },
                    lineHeight: 1.1,
                    color: "text.primary",
                    mb: 2,
                  }}
                >
                  Where Craftsmanship <br />
                  Meets Modern Elegance
                </Typography>
              </Box>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: "0.95rem", md: "1.05rem" },
                  lineHeight: 1.8,
                }}
              >
                {aboutStory}
              </Typography>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: "0.95rem", md: "1.05rem" },
                  lineHeight: 1.8,
                }}
              >
                Each Zuriè piece is meticulously crafted from full-grain
                calfskin, finished by hand, and engineered to age with grace. We
                believe in quiet luxury - objects that speak through their
                silence, their weight, their touch.
              </Typography>
              <Button
                component={Link}
                href="/shop"
                variant="outlined"
                endIcon={<FontAwesomeIcon icon={faArrowRight} />}
                sx={{
                  alignSelf: "flex-start",
                  borderRadius: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  fontSize: "0.7rem",
                  px: 3.5,
                  py: 1.2,
                  borderColor: "text.primary",
                  color: "text.primary",
                  "&:hover": {
                    borderColor: "text.primary",
                    bgcolor: "action.hover",
                  },
                }}
              >
                Explore Collection
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box
        sx={{
          width: "100%",
          bgcolor: "#120f0c",
          color: "#f3eee4",
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid key={index} size={{ xs: 6, md: 3 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-playfair), serif",
                      fontSize: { xs: "2rem", md: "3rem" },
                      fontWeight: 600,
                      color: "#b39a72",
                      mb: 0.5,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      fontSize: "0.65rem",
                      color: "rgba(243,238,228,0.6)",
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Philosophy Section */}
      <Box
        sx={{
          width: "100%",
          bgcolor: "#121212",
          color: "#f3eee4",
          px: { xs: 2, md: 3.5 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 3, md: 5 }} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  position: "relative",
                  height: { xs: 300, md: 500 },
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Image
                  src="/images/products/new3.avif"
                  alt="Zuriè atelier - artisan crafting"
                  fill
                  sizes="(max-width: 900px) 100vw, 48vw"
                  style={{ objectFit: "cover" }}
                />
              </Box>
            </Grid>
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
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
                  fontSize: { xs: "2rem", md: "3.4rem" },
                  lineHeight: 1.05,
                  color: "#efe8db",
                }}
              >
                Form follows <br />
                feeling.
              </Typography>
              <Typography
                sx={{
                  color: "rgba(243,238,228,0.78)",
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  lineHeight: 1.8,
                  fontFamily: "var(--font-playfair), serif",
                }}
              >
                {brand.story ||
                  "At Zuriè, we believe that true luxury lies in the details. Every curve, stitch, and material is chosen with intention, creating pieces that are not just accessories, but extensions of self."}
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Values Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Box sx={{ textAlign: "center", mb: 4.5 }}>
          <Typography
            variant="overline"
            sx={{
              letterSpacing: "0.34em",
              color: "#b39a72",
              fontSize: "0.7rem",
            }}
          >
            Our Values
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: { xs: "2rem", md: "2.8rem" },
              lineHeight: 1.1,
              color: "text.primary",
            }}
          >
            Designed with Purpose
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "1rem",
              maxWidth: 500,
              mx: "auto",
              mt: 1,
            }}
          >
            Every decision we make is guided by our commitment to quality,
            sustainability, and timeless design.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {values.map((value, index) => (
            <Grid key={index} size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  boxShadow: "none",
                  height: "100%",
                  bgcolor: "background.paper",
                  transition:
                    "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: getCardHoverShadow(),
                    borderColor: value.color,
                  },
                }}
              >
                <CardContent sx={{ p: 3.5, textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      bgcolor: getIconBgColor(value.color),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                      color: value.color,
                    }}
                  >
                    <FontAwesomeIcon icon={value.icon} size="lg" />
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      mb: 1,
                      color: "text.primary",
                    }}
                  >
                    {value.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {value.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box
        sx={{
          width: "100%",
          bgcolor: getBgColor(),
          color: "text.primary",
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="overline"
              sx={{
                letterSpacing: "0.34em",
                color: "#b39a72",
                fontSize: "0.7rem",
              }}
            >
              Words from Our Women
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: { xs: "2rem", md: "2.8rem" },
                lineHeight: 1.1,
                color: "text.primary",
              }}
            >
              The Zuriè Circle
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {testimonials.map((testimonial, index) => (
              <Grid key={index} size={{ xs: 12, md: 4 }}>
                <Card
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    boxShadow: "none",
                    height: "100%",
                    bgcolor: "background.paper",
                    p: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: getCardHoverShadow(),
                      borderColor: getCardHoverBorder(),
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 1.5 }}>
                      {[...Array(5)].map((_, i) => (
                        <FontAwesomeIcon
                          key={i}
                          icon={faStar}
                          style={{
                            color: "#f9a825",
                            marginRight: 2,
                            fontSize: 14,
                          }}
                        />
                      ))}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "0.95rem",
                        lineHeight: 1.6,
                        color: "text.secondary",
                        mb: 2,
                        fontStyle: "italic",
                      }}
                    >
                      {testimonial.quote}
                    </Typography>
                    <Divider
                      sx={{
                        mb: 1.5,
                        borderColor: getDividerColor(),
                      }}
                    />
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: "#b39a72",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                      >
                        {testimonial.author.charAt(0)}
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            color: "text.primary",
                          }}
                        >
                          {testimonial.author}
                        </Typography>
                        <Typography
                          sx={{
                            color: "text.secondary",
                            fontSize: "0.7rem",
                          }}
                        >
                          {testimonial.location}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          width: "100%",
          bgcolor: "#120f0c",
          color: "#f3eee4",
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: { xs: "1.8rem", md: "2.8rem" },
              lineHeight: 1.1,
              mb: 2,
              color: "#f3eee4",
            }}
          >
            Experience the <br />
            Zuriè Difference
          </Typography>
          <Typography
            sx={{
              color: "rgba(243,238,228,0.7)",
              fontSize: "1rem",
              mb: 3,
              maxWidth: 500,
              mx: "auto",
            }}
          >
            Discover our collection of handcrafted luxury handbags, designed to
            elevate every moment.
          </Typography>
          <Button
            component={Link}
            href="/shop"
            variant="contained"
            size="large"
            endIcon={<FontAwesomeIcon icon={faArrowRight} />}
            sx={{
              borderRadius: 0,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontSize: "0.7rem",
              px: 4,
              py: 1.5,
              bgcolor: "#b39a72",
              color: "#fff",
              "&:hover": {
                bgcolor: "#a0845a",
              },
            }}
          >
            Shop Now
          </Button>
        </Container>
      </Box>
    </Stack>
  );
}
