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
          textAlign="center"
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
        variant="h3"
        textAlign="center"
        sx={{
          fontSize: { xs: "1.5rem", md: "2.75rem" },
          lineHeight: 1.15,
        }}
      >
        {title}
      </Typography>
    </Stack>
  );
};
