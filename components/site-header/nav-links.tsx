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
        gap: { xs: 1.8, md: 3.2 },
        justifySelf: "center",
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
            letterSpacing: "0.34em",
            fontSize: "0.72rem",
            fontWeight: pathname === link.href ? 700 : 500,
            color: pathname === link.href ? "primary.main" : "text.secondary",
            textDecoration: "none",
            transition: "color 180ms ease",
            "&:hover": { color: "text.primary" },
          }}
        >
          {link.label}
        </Typography>
      ))}
    </Box>
  );
};
