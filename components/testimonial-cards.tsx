"use client";

import { Box, Grid, Stack, Typography, useTheme } from "@mui/material";
import { defaultTestimonials } from "@/services/content";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

export const TestimonialCards = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Grid container spacing={{ xs: 3, md: 3.2 }}>
      {defaultTestimonials.map((item) => (
        <Grid key={item.id} size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              p: 3.5,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: isDarkMode ? "rgba(255,255,255,0.02)" : "#faf8f5",
              height: "100%",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: isDarkMode
                  ? "0 8px 24px rgba(0,0,0,0.3)"
                  : "0 8px 24px rgba(0,0,0,0.06)",
                borderColor: "#b39a72",
              },
            }}
          >
            <Stack
              spacing={2.1}
              alignItems="center"
              textAlign="center"
              sx={{ minHeight: "100%" }}
            >
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    style={{
                      color: "#f9a825",
                      fontSize: 14,
                    }}
                  />
                ))}
              </Box>

              <Typography
                sx={{
                  fontFamily: "var(--font-playfair), serif",
                  fontStyle: "italic",
                  fontSize: { xs: "1.2rem", md: "1.6rem" },
                  lineHeight: { xs: 1.4, md: 1.4 },
                  color: "text.primary",
                }}
              >
                &ldquo;{item.quote}&rdquo;
              </Typography>

              <Box sx={{ pt: 0.5 }}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: "text.primary",
                  }}
                >
                  {item.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    color: "text.secondary",
                    mt: 0.25,
                  }}
                >
                  {item.location}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};
