"use client";

import { useEffect, useState } from "react";
import { Backdrop, Box, Typography, useTheme } from "@mui/material";
import { keyframes } from "@emotion/react";

type BackdropSpinnerProps = {
  open: boolean;
  messages?: string[];
};

const spiralRotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeCycle = keyframes`
  0% { opacity: 0; transform: translateY(2px); }
  15% { opacity: 1; transform: translateY(0); }
  85% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-2px); }
`;

const DEFAULT_TAGLINES = [
  "Zuriè",
  "Opening…",
  "Curating your selection…",
  "Almost there…",
];

const TAGLINE_INTERVAL_MS = 2200;

// Branded full-screen loader shown during a slow route transition (e.g.
// opening a product page from the header search) — the spinning rings +
// centered logo give a much clearer "still working" signal than a bare
// CircularProgress, without needing any org/tenant-settings machinery. The
// message beneath it cycles through a short list of taglines while open, so
// a slow transition still reads as active progress rather than a stall.
export const BackdropSpinner = ({
  open,
  messages = DEFAULT_TAGLINES,
}: BackdropSpinnerProps) => {
  const theme = useTheme();
  const mainColor = theme.palette.primary.main;
  const lightColor = theme.palette.mode === "dark" ? "#5d5347" : "#e7dfd3";
  const contrastText = "#ffffff";

  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    if (!open || messages.length <= 1) return;
    setTaglineIndex(0);
    const id = setInterval(() => {
      setTaglineIndex((current) => (current + 1) % messages.length);
    }, TAGLINE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [open, messages]);

  return (
    <Backdrop
      sx={{
        color: "#ffffff",
        zIndex: (t) => t.zIndex.drawer + 1,
        flexDirection: "column",
        backgroundColor: "rgba(23, 21, 18, 0.75)",
      }}
      open={open}
    >
      <Box
        sx={{
          position: "relative",
          width: 130,
          height: 130,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 122,
            height: 122,
            border: "4px solid transparent",
            borderTopColor: mainColor,
            borderRadius: "50%",
            animation: `${spiralRotate} 1.8s linear infinite`,
            boxShadow: `0 0 10px ${mainColor}80`,
            clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 104,
            height: 104,
            border: "4px solid transparent",
            borderBottomColor: lightColor,
            borderRadius: "50%",
            animation: `${spiralRotate} 1.8s linear infinite 0.3s`,
            boxShadow: `0 0 10px ${lightColor}80`,
            clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 86,
            height: 86,
            border: "4px solid transparent",
            borderTopColor: contrastText,
            borderRadius: "50%",
            animation: `${spiralRotate} 1.8s linear infinite 0.6s`,
            boxShadow: `0 0 10px ${contrastText}60`,
            clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
          }}
        />

        <Box
          sx={{
            width: 82,
            height: 82,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.paper",
            boxShadow: `0 0 12px ${mainColor}40`,
            zIndex: 1,
            px: 1,
          }}
        >
          <Typography
            sx={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "1.05rem",
              fontWeight: 500,
              color: theme.palette.text.primary,
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            Zuriè
          </Typography>
        </Box>
      </Box>

      {messages.length > 0 && (
        <Typography
          key={taglineIndex}
          sx={{
            mt: 2.5,
            color: "#f3eee4",
            letterSpacing: messages[taglineIndex] === "Zuriè" ? 0.5 : "0.08em",
            fontSize: messages[taglineIndex] === "Zuriè" ? "1.3rem" : "0.85rem",
            fontFamily:
              messages[taglineIndex] === "Zuriè"
                ? "var(--font-playfair), serif"
                : undefined,
            fontWeight: messages[taglineIndex] === "Zuriè" ? 500 : 400,
            textShadow: `0 0 6px ${mainColor}60`,
            animation: `${fadeCycle} ${TAGLINE_INTERVAL_MS}ms ease-in-out`,
          }}
        >
          {messages[taglineIndex]}
        </Typography>
      )}
    </Backdrop>
  );
};
