import { Stack, Typography } from "@mui/material";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export const SectionHeading = ({
  eyebrow,
  title,
  subtitle,
}: SectionHeadingProps) => {
  return (
    <Stack spacing={1.25} sx={{ mb: 4.5 }}>
      {eyebrow ? (
        <Typography
          sx={{
            textTransform: "uppercase",
            letterSpacing: "0.26em",
            fontSize: "0.72rem",
            color: "primary.main",
          }}
        >
          {eyebrow}
        </Typography>
      ) : null}
      <Typography
        variant="h2"
        sx={{
          fontSize: { xs: "2rem", md: "2.75rem" },
          lineHeight: 1.15,
        }}
      >
        {title}
      </Typography>
      {subtitle ? (
        <Typography
          variant="body1"
          color="text.secondary"
          maxWidth={760}
          sx={{ fontSize: { xs: "1rem", md: "1.08rem" } }}
        >
          {subtitle}
        </Typography>
      ) : null}
    </Stack>
  );
};
