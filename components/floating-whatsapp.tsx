"use client";

import Link from "next/link";
import { Box } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { SITE } from "@/constants/site";

export const FloatingWhatsApp = () => {
  return (
    <Box
      component={Link}
      href={`https://wa.me/${SITE.whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        position: "fixed",
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: "50%",
        backgroundColor: "#25D366",
        color: "white",
        display: "grid",
        placeItems: "center",
        boxShadow: "0 10px 24px rgba(0,0,0,.2)",
        zIndex: 1200,
      }}
      aria-label="Chat on WhatsApp"
    >
      <FontAwesomeIcon icon={faWhatsapp} size="xl" />
    </Box>
  );
};
