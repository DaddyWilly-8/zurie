import Link from "next/link";
import { Box, Typography } from "@mui/material";
import { NAV_LINKS } from "@/constants/site";

type Props = {
  pathname: string;
};

export const SiteHeaderNavLinks = ({ pathname }: Props) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: { xs: 1.4, md: 3.2 },
        justifySelf: "center",
        overflowX: { xs: "auto", md: "visible" },
        maxWidth: "100%",
        whiteSpace: "nowrap",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {NAV_LINKS.map((link) => (
        <Typography
          key={link.href}
          component={Link}
          href={link.href}
          variant="body2"
          sx={{
            textTransform: "uppercase",
            letterSpacing: { xs: "0.22em", md: "0.34em" },
            fontSize: { xs: "0.64rem", md: "0.72rem" },
            fontWeight: pathname === link.href ? 700 : 500,
            color: pathname === link.href ? "primary.main" : "text.secondary",
            textDecoration: "none",
            transition: "color 180ms ease",
            flexShrink: 0,
            "&:hover": { color: "text.primary" },
          }}
        >
          {link.label}
        </Typography>
      ))}
    </Box>
  );
};
