import Image from "next/image";
import Link from "next/link";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLocationDot,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";
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
    src: "/images/hero/zurie-hero.png",
    alt: "Zurie editorial hero",
  };
  const supportingPhotos = [
    {
      src: "/images/instagram/ig-2.png",
      alt: "Zurie boutique detail",
      title: "Private styling",
    },
    {
      src: "/images/instagram/ig-5.png",
      alt: "Zurie styling moment",
      title: "Curated moments",
    },
  ];

  return (
    <Stack sx={{ pt: { xs: 3.5, sm: 4.5, md: 9 }, pb: { xs: 6, sm: 7, md: 11 } }}>
      <Grid container spacing={{ xs: 3, sm: 3.5, md: 4.4 }}>
        <Grid size={{ xs: 12, md: 6.2 }}>
          <ContactForm />
        </Grid>
        <Grid size={{ xs: 12, md: 5.8 }}>
          <Stack spacing={1.8}>
            <Box
              sx={{
                bgcolor: "#131313",
                color: "#eee4d6",
                p: { xs: 2, sm: 2.2, md: 2.6 },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-playfair), serif",
                  fontSize: { xs: "1.65rem", md: "1.8rem" },
                  mb: 1.7,
                }}
              >
                Reach the concierge
              </Typography>

              <Stack spacing={1.35} sx={{ mb: 2.35 }}>
                <Stack direction="row" spacing={1.1} alignItems="flex-start">
                  <Box sx={{ color: "#968b7b", mt: 0.35 }}>
                    <FontAwesomeIcon icon={faPhone} fontSize={10} />
                  </Box>
                  <Stack spacing={0.15}>
                    <Typography sx={{ fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#9e9281" }}>
                      Phone
                    </Typography>
                    <Typography sx={{ fontSize: "0.95rem", color: "#f5ebde" }}>
                      {contact.phone}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1.1} alignItems="flex-start">
                  <Box sx={{ color: "#968b7b", mt: 0.35 }}>
                    <FontAwesomeIcon icon={faEnvelope} fontSize={10} />
                  </Box>
                  <Stack spacing={0.15}>
                    <Typography sx={{ fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#9e9281" }}>
                      Email
                    </Typography>
                    <Typography sx={{ fontSize: "0.95rem", color: "#f5ebde" }}>
                      {contact.email}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1.1} alignItems="flex-start">
                  <Box sx={{ color: "#968b7b", mt: 0.35 }}>
                    <FontAwesomeIcon icon={faLocationDot} fontSize={10} />
                  </Box>
                  <Stack spacing={0.15}>
                    <Typography sx={{ fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#9e9281" }}>
                      Atelier
                    </Typography>
                    <Typography sx={{ fontSize: "0.9rem", color: "#d8cec1", lineHeight: 1.5 }}>
                      {contact.address}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>

              <Link
                href={`https://wa.me/${contact.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  sx={{
                    borderRadius: 0,
                    fontSize: "0.64rem",
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                  }}
                >
                  Chat on WhatsApp
                </Button>
              </Link>

              <Stack direction="row" spacing={1} sx={{ mt: 1.9 }}>
                <Link href={contact.instagram} target="_blank">
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      border: "1px solid #3a352f",
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      color: "#b8ab99",
                    }}
                  >
                    <FontAwesomeIcon icon={faInstagram} fontSize={10} />
                  </Box>
                </Link>
                <Link href={contact.facebook} target="_blank">
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      border: "1px solid #3a352f",
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      color: "#b8ab99",
                    }}
                  >
                    <FontAwesomeIcon icon={faFacebook} fontSize={10} />
                  </Box>
                </Link>
              </Stack>
            </Box>

            <Box sx={{ border: "1px solid #ebe4d9", p: 0, overflow: "hidden" }}>
              <iframe
                src={contact.mapEmbedUrl}
                width="100%"
                height="224"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0 }}
                title="Map"
              />
            </Box>
          </Stack>
        </Grid>
      </Grid>

      <Stack spacing={1.2} sx={{ mt: { xs: 4, sm: 5, md: 6.5 } }}>
        <Typography
          sx={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: { xs: "1.55rem", md: "1.8rem" },
          }}
        >
          Visit the world of Zuriè
        </Typography>
        <Typography
          sx={{
            maxWidth: 560,
            color: "text.secondary",
            fontSize: { xs: "0.92rem", md: "0.98rem" },
            lineHeight: 1.7,
          }}
        >
          Static editorial imagery is in place for now so the contact experience
          still feels complete while backend-managed media is prepared.
        </Typography>
      </Stack>

      <Grid
        container
        spacing={{ xs: 1.25, sm: 1.5, md: 1.8 }}
        sx={{ mt: { xs: 1.2, md: 1.8 }, alignItems: "stretch" }}
      >
        <Grid size={{ xs: 12, md: 7.2 }}>
          <Box
            sx={{
              position: "relative",
              minHeight: { xs: 340, sm: 420, md: 560 },
              overflow: "hidden",
              bgcolor: "#f3ede4",
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
                left: { xs: 16, md: 24 },
                bottom: { xs: 16, md: 24 },
                bgcolor: "rgba(246, 239, 229, 0.9)",
                color: "#171411",
                px: { xs: 1.5, md: 2 },
                py: { xs: 1.2, md: 1.5 },
                maxWidth: { xs: 240, md: 280 },
              }}
            >
              <Typography
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: "0.24em",
                  fontSize: "0.62rem",
                  mb: 0.7,
                }}
              >
                Maison Zuriè
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-playfair), serif",
                  fontSize: { xs: "1.2rem", md: "1.45rem" },
                  lineHeight: 1.15,
                }}
              >
                A warm, editorial welcome while live brand media is prepared.
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4.8 }}>
          <Stack spacing={{ xs: 1.25, md: 1.8 }} sx={{ height: "100%" }}>
            {supportingPhotos.map((photo) => (
              <Box
                key={photo.src}
                sx={{
                  position: "relative",
                  minHeight: { xs: 220, sm: 240, md: 271 },
                  overflow: "hidden",
                  bgcolor: "#f3ede4",
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
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(17,17,17,0.04) 35%, rgba(17,17,17,0.55) 100%)",
                  }}
                />
                <Typography
                  sx={{
                    position: "absolute",
                    left: { xs: 14, md: 18 },
                    bottom: { xs: 14, md: 18 },
                    color: "#fffaf2",
                    fontFamily: "var(--font-playfair), serif",
                    fontSize: { xs: "1.1rem", md: "1.3rem" },
                    zIndex: 1,
                  }}
                >
                  {photo.title}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
