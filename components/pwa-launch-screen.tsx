"use client";

import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

const SESSION_KEY = "zurie_launch_seen";

const isStandalone = () => {
  if (typeof window === "undefined") return false;
  const mediaStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return mediaStandalone || iosStandalone;
};

export const PwaLaunchScreen = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isStandalone()) return;

    const alreadySeen = window.sessionStorage.getItem(SESSION_KEY) === "1";
    if (alreadySeen) return;

    setVisible(true);
    const hideTimer = window.setTimeout(() => {
      setVisible(false);
      window.sessionStorage.setItem(SESSION_KEY, "1");
    }, 1200);

    return () => window.clearTimeout(hideTimer);
  }, []);

  if (!visible) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1600,
        display: "grid",
        placeItems: "center",
        bgcolor: "#ffffff",
      }}
    >
      <Typography
        sx={{
          fontFamily: "var(--font-playfair), serif",
          letterSpacing: "0.08em",
          fontSize: { xs: "2.2rem", sm: "2.8rem" },
          color: "#171512",
          animation: "zurieLaunchWordmark 900ms cubic-bezier(0.22, 1, 0.36, 1) both",
          "@keyframes zurieLaunchWordmark": {
            "0%": {
              opacity: 0,
              transform: "translateY(8px) scale(0.98)",
              letterSpacing: "0.2em",
            },
            "55%": {
              opacity: 1,
              transform: "translateY(0) scale(1)",
              letterSpacing: "0.1em",
            },
            "100%": {
              opacity: 1,
              transform: "translateY(0) scale(1)",
              letterSpacing: "0.08em",
            },
          },
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
          },
        }}
      >
        ZURIÈ
      </Typography>
    </Box>
  );
};
