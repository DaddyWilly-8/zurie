import Image from "next/image";
import Link from "next/link";
import { Box, Button, Grid, Stack, Typography, Divider } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLocationDot,
  faPhone,
  faArrowRight,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faInstagram,
  faTiktok,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import { ContactForm } from "@/features/contact/contact-form";
import { getContactInfo } from "@/services/content";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Contact | Zuriè",
  description:
    "Contact Zuriè via form, WhatsApp, phone, email, or social channels.",
  path: "/contact",
});

export default async function ContactPage() {
  const contact = await getContactInfo();

  const leadPhoto = {
    src: "/images/products/new1.avif",
    alt: "Zurie editorial hero",
  };

  const supportingPhotos = [
    {
      src: "/images/products/new2.webp",
      alt: "Zurie boutique detail",
      title: "Private styling",
    },
    {
      src: "/images/products/new3.avif",
      alt: "Zurie styling moment",
      title: "Curated moments",
    },
    {
      src: "/images/products/new4.jpeg",
      alt: "Zurie editorial detail",
      title: "Maison Zuriè",
    },
  ];

  const contactMethods = [
    {
      icon: faPhone,
      label: "Phone",
      value: contact.phone,
      color: "#4caf50",
    },
    {
      icon: faEnvelope,
      label: "Email",
      value: contact.email,
      color: "#42a5f5",
    },
    {
      icon: faLocationDot,
      label: "Atelier",
      value: contact.address,
      color: "#ffa726",
    },
    {
      icon: faClock,
      label: "Hours",
      value: "Mon - Sat: 9:00 AM - 6:00 PM",
      color: "#ab47bc",
    },
  ];

  return (
    <Stack
      sx={{
        pb: { xs: 6, sm: 7, md: 11 },
        px: { xs: 2, sm: 3, md: 0 },
      }}
    >
      {/* Header Section */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="overline"
          sx={{
            letterSpacing: "0.34em",
            color: "#b39a72",
            fontSize: "0.7rem",
          }}
        >
          Get in Touch
        </Typography>
        <Typography
          sx={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: { xs: "2rem", md: "3rem" },
            lineHeight: 1.1,
            color: "text.primary",
            mb: 1,
          }}
        >
          Let&apos;s Connect
        </Typography>
        <Typography
          sx={{
            color: "text.secondary",
            fontSize: "1rem",
            maxWidth: 500,
            mx: "auto",
          }}
        >
          We&apos;d love to hear from you. Reach out to us through any of the
          channels below.
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 3, sm: 3.5, md: 4.4 }}>
        {/* Contact Form */}
        <Grid size={{ xs: 12, md: 6.2 }}>
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: { xs: 2.5, sm: 3, md: 3.5 },
              bgcolor: "background.paper",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
              },
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: { xs: "1.4rem", md: "1.6rem" },
                mb: 0.5,
                color: "text.primary",
              }}
            >
              Send a Message
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "0.9rem",
                mb: 2.5,
              }}
            >
              We&apos;ll get back to you within 24 hours.
            </Typography>
            <ContactForm />
          </Box>
        </Grid>

        {/* Contact Info */}
        <Grid size={{ xs: 12, md: 5.8 }}>
          <Stack spacing={2.5}>
            {/* Contact Card */}
            <Box
              sx={{
                bgcolor: "#131313",
                color: "#eee4d6",
                p: { xs: 2.5, sm: 3, md: 3.5 },
                borderRadius: 2,
                border: "1px solid rgba(255,255,255,0.08)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-playfair), serif",
                  fontSize: { xs: "1.5rem", md: "1.8rem" },
                  mb: 2.5,
                  color: "#f5ebde",
                }}
              >
                Reach the Concierge
              </Typography>

              <Stack spacing={2} sx={{ mb: 3 }}>
                {contactMethods.map((method, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: "rgba(255,255,255,0.03)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.06)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: `${method.color}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: method.color,
                        flexShrink: 0,
                        mt: 0.25,
                      }}
                    >
                      <FontAwesomeIcon icon={method.icon} fontSize={14} />
                    </Box>
                    <Stack spacing={0.15}>
                      <Typography
                        sx={{
                          fontSize: "0.6rem",
                          letterSpacing: "0.28em",
                          textTransform: "uppercase",
                          color: "#9e9281",
                        }}
                      >
                        {method.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.9rem",
                          color: "#f5ebde",
                          wordBreak: "break-word",
                        }}
                      >
                        {method.value}
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>

              <Divider
                sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 2.5 }}
              />

              {/* WhatsApp Button */}
              <Link
                href={`https://wa.me/${contact.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    borderRadius: 1.5,
                    fontSize: "0.7rem",
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    bgcolor: "#25D366",
                    color: "#fff",
                    py: 1.5,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "#1da851",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 24px rgba(37,211,102,0.3)",
                    },
                  }}
                  startIcon={<FontAwesomeIcon icon={faWhatsapp} />}
                >
                  Chat on WhatsApp
                </Button>
              </Link>

              {/* Social Links */}
              <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
                <Link
                  href={contact.instagram}
                  target="_blank"
                  style={{ textDecoration: "none" }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      color: "#b8ab99",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "#b39a72",
                        color: "#f5ebde",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <FontAwesomeIcon icon={faInstagram} fontSize={16} />
                  </Box>
                </Link>
                <Link
                  href={contact.facebook}
                  target="_blank"
                  style={{ textDecoration: "none" }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      color: "#b8ab99",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "#b39a72",
                        color: "#f5ebde",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <FontAwesomeIcon icon={faFacebook} fontSize={16} />
                  </Box>
                </Link>
                <Link
                  href={contact.tiktok || "#"}
                  target="_blank"
                  style={{ textDecoration: "none" }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      color: "#b8ab99",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "#b39a72",
                        color: "#f5ebde",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <FontAwesomeIcon icon={faTiktok} fontSize={16} />
                  </Box>
                </Link>
              </Stack>
            </Box>

            {/* Map */}
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
                },
              }}
            >
              <iframe
                src={contact.mapEmbedUrl}
                width="100%"
                height="224"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0 }}
                title="Zuriè Location Map"
              />
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {/* Gallery Section */}
      <Stack spacing={2} sx={{ mt: { xs: 5, sm: 6, md: 7.5 } }}>
        <Box>
          <Typography
            variant="overline"
            sx={{
              letterSpacing: "0.34em",
              color: "#b39a72",
              fontSize: "0.7rem",
            }}
          >
            Gallery
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: { xs: "1.8rem", md: "2.2rem" },
              lineHeight: 1.1,
              color: "text.primary",
            }}
          >
            The World of Zuriè
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.95rem",
              maxWidth: 560,
              mt: 0.5,
            }}
          >
            Explore the artistry and craftsmanship behind every Zuriè piece.
          </Typography>
        </Box>

        <Grid
          container
          spacing={{ xs: 1.5, sm: 1.8, md: 2 }}
          sx={{ alignItems: "stretch" }}
        >
          <Grid size={{ xs: 12, md: 7.2 }}>
            <Box
              sx={{
                position: "relative",
                minHeight: { xs: 300, sm: 400, md: 520 },
                overflow: "hidden",
                borderRadius: 2,
                bgcolor: "background.paper",
                transition: "all 0.4s ease",
                "&:hover": {
                  transform: "scale(1.01)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Image
                src={leadPhoto.src}
                alt={leadPhoto.alt}
                fill
                sizes="(max-width: 900px) 100vw, 58vw"
                style={{ objectFit: "cover" }}
              />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.5) 100%)",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: { xs: 20, md: 28 },
                  bottom: { xs: 20, md: 28 },
                  bgcolor: "rgba(246, 239, 229, 0.95)",
                  color: "#171411",
                  px: { xs: 2, md: 2.5 },
                  py: { xs: 1.5, md: 2 },
                  maxWidth: { xs: 240, md: 300 },
                  borderRadius: 1.5,
                  backdropFilter: "blur(8px)",
                }}
              >
                <Typography
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.24em",
                    fontSize: "0.6rem",
                    color: "#b39a72",
                    mb: 0.5,
                  }}
                >
                  Maison Zuriè
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-playfair), serif",
                    fontSize: { xs: "1.1rem", md: "1.3rem" },
                    lineHeight: 1.2,
                    color: "#171411",
                  }}
                >
                  A warm, editorial welcome while live brand media is prepared.
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4.8 }}>
            <Stack spacing={{ xs: 1.5, md: 2 }} sx={{ height: "100%" }}>
              {supportingPhotos.map((photo, index) => (
                <Box
                  key={photo.src}
                  sx={{
                    position: "relative",
                    minHeight: { xs: 180, sm: 200, md: 168 },
                    overflow: "hidden",
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    flex: 1,
                    transition: "all 0.4s ease",
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 900px) 100vw, 42vw"
                    style={{ objectFit: "cover" }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.6) 100%)",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      left: { xs: 16, md: 20 },
                      bottom: { xs: 16, md: 20 },
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#fffaf2",
                        fontFamily: "var(--font-playfair), serif",
                        fontSize: { xs: "1rem", md: "1.1rem" },
                        zIndex: 1,
                        fontWeight: 500,
                      }}
                    >
                      {photo.title}
                    </Typography>
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      color="rgba(255,255,255,0.6)"
                      fontSize={10}
                    />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Stack>
  );
}
