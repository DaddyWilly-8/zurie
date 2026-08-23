import { Box, Container, Stack, Typography } from "@mui/material";
import { contentService } from "@/services/content/content.service";
import { buildMetadata } from "@/lib/metadata";
import type { PublicSettings } from "@/types/content";

export const metadata = buildMetadata({
  title: "Delivery & Returns | Zuriè",
  description: "Zuriè delivery and return policies.",
  path: "/policies",
});

export default async function PoliciesPage() {
  const settings: PublicSettings = await contentService
    .getPublicSettings()
    .catch(() => ({}) as PublicSettings);
  const policies = settings.policies ?? {};
  const deliveryPolicy = (policies.deliveryPolicy ?? "").trim();
  const returnPolicy = (policies.returnPolicy ?? "").trim();

  return (
    <Stack
      sx={{
        pb: { xs: 6, sm: 7, md: 11 },
        px: { xs: 2, sm: 3, md: 0 },
      }}
    >
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="overline"
          sx={{
            letterSpacing: "0.34em",
            color: "#b39a72",
            fontSize: "0.7rem",
          }}
        >
          Good to Know
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
          Delivery &amp; Returns
        </Typography>
        <Typography
          sx={{
            color: "text.secondary",
            fontSize: "1rem",
            maxWidth: 560,
            mx: "auto",
          }}
        >
          Everything you need to know about receiving and returning your Zuriè
          pieces.
        </Typography>
      </Box>

      <Container maxWidth="md">
        <Stack spacing={{ xs: 5, md: 7 }}>
          <Box>
            <Typography
              sx={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: { xs: "1.5rem", md: "1.9rem" },
                mb: 1.5,
                color: "text.primary",
              }}
            >
              Delivery Policy
            </Typography>
            {deliveryPolicy ? (
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "1rem",
                  lineHeight: 1.8,
                  whiteSpace: "pre-line",
                }}
              >
                {deliveryPolicy}
              </Typography>
            ) : (
              <Typography sx={{ color: "text.secondary", fontStyle: "italic" }}>
                Coming soon.
              </Typography>
            )}
          </Box>

          <Box>
            <Typography
              sx={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: { xs: "1.5rem", md: "1.9rem" },
                mb: 1.5,
                color: "text.primary",
              }}
            >
              Return Policy
            </Typography>
            {returnPolicy ? (
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "1rem",
                  lineHeight: 1.8,
                  whiteSpace: "pre-line",
                }}
              >
                {returnPolicy}
              </Typography>
            ) : (
              <Typography sx={{ color: "text.secondary", fontStyle: "italic" }}>
                Coming soon.
              </Typography>
            )}
          </Box>
        </Stack>
      </Container>
    </Stack>
  );
}
