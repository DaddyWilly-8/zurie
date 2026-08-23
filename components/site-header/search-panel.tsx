import { Box, TextField, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const SiteHeaderSearchPanel = ({ value, onChange }: Props) => {
  return (
    <Box
      sx={{
        borderTop: "1px solid",
        borderColor: "divider",
        py: 1.1,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
        gap: 1,
        alignItems: "center",
      }}
    >
      <TextField
        size="small"
        placeholder="Search the atelier..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <Box component="span" sx={{ color: "text.secondary", mr: 1 }}>
                <FontAwesomeIcon icon={faMagnifyingGlass} fontSize={12} />
              </Box>
            ),
          },
        }}
      />

      <Typography
        sx={{
          textTransform: "uppercase",
          letterSpacing: "0.26em",
          fontSize: "0.68rem",
          color: "text.secondary",
          justifySelf: { xs: "start", md: "end" },
        }}
      >
        Search
      </Typography>
    </Box>
  );
};
