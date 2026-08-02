import { Box, Grid, Stack, Typography } from "@mui/material";
import { defaultTestimonials } from "@/services/content";

export const TestimonialCards = () => {
  return (
    <Grid container spacing={{ xs: 4, md: 3.2 }}>
      {defaultTestimonials.map((item) => (
        <Grid key={item.id} size={{ xs: 12, md: 4 }}>
          <Stack
            spacing={2.1}
            alignItems="center"
            textAlign="center"
            sx={{ px: { xs: 1, md: 1.5 }, minHeight: "100%" }}
          >
            <Typography
              component="div"
              sx={{
                letterSpacing: "0.34em",
                color: "#ba9b6e",
                fontSize: "0.78rem",
                lineHeight: 1,
              }}
            >
              ★★★★★
            </Typography>

            <Typography
              sx={{
                fontFamily: "var(--font-playfair), serif",
                fontStyle: "italic",
                fontSize: { xs: "1.45rem", md: "1.95rem" },
                lineHeight: { xs: 1.38, md: 1.34 },
                color: "text.primary",
              }}
            >
              &ldquo;{item.quote}&rdquo;
            </Typography>

            <Box sx={{ pt: 0.35 }}>
              <Typography
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: "0.42em",
                  fontSize: "0.68rem",
                  color: "text.primary",
                }}
              >
                {item.name}
              </Typography>
              <Typography sx={{ fontSize: "1rem", color: "text.secondary", mt: 0.25 }}>
                {item.location}
              </Typography>
            </Box>
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
};
