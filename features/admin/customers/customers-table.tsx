import {
  Box,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
  Paper,
  Grid,
} from "@mui/material";
import type { AdminCustomerRow } from "./types";

type Props = {
  rows: AdminCustomerRow[];
  onView: (id: string) => void;
};

const getCreatedAt = (row: AdminCustomerRow) =>
  row.created_at ?? row.createdAt ?? "";

export const CustomersTable = ({ rows, onView }: Props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Dynamic styles
  const getBorderColor = () =>
    isDarkMode ? "rgba(255,255,255,0.12)" : "#e9e2d8";
  const getHeaderBackgroundColor = () =>
    isDarkMode ? "rgba(255,255,255,0.05)" : "#f8f6f2";
  const getTextColor = () => (isDarkMode ? "#ffffff" : "#171512");
  const getSecondaryTextColor = () =>
    isDarkMode ? "rgba(255,255,255,0.6)" : "text.secondary";
  const getChipBackgroundColor = () =>
    isDarkMode ? "rgba(255,255,255,0.1)" : "#f0ebe3";
  const getChipTextColor = () => (isDarkMode ? "#ffffff" : "#171512");
  const getHoverBackgroundColor = () =>
    isDarkMode ? "rgba(255,255,255,0.03)" : "action.hover";
  const getCardBackground = () =>
    isDarkMode ? "rgba(255,255,255,0.03)" : "background.paper";

  // Card layout for mobile and tablet
  if (isMobile || isTablet) {
    return (
      <Grid container spacing={2}>
        {rows.map((row) => (
          <Grid size={{ xs: 12, sm: 6 }} key={row.id}>
            <Paper
              sx={{
                p: 2.5,
                border: `1px solid ${getBorderColor()}`,
                bgcolor: getCardBackground(),
                borderRadius: 1,
                transition: "all 0.3s ease",
                height: "100%",
                "&:hover": {
                  borderColor: getTextColor(),
                  bgcolor: getHoverBackgroundColor(),
                },
              }}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Typography
                    fontWeight={600}
                    sx={{ color: getTextColor(), fontSize: "0.95rem" }}
                  >
                    {row.name}
                  </Typography>
                  <Chip
                    label={row.phone ?? "-"}
                    size="small"
                    sx={{
                      fontSize: "0.55rem",
                      bgcolor: getChipBackgroundColor(),
                      color: getChipTextColor(),
                      fontWeight: 500,
                      transition: "all 0.3s ease",
                    }}
                  />
                </Stack>

                <Divider sx={{ borderColor: getBorderColor() }} />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: getSecondaryTextColor(),
                      fontSize: "0.65rem",
                    }}
                  >
                    Joined:{" "}
                    {getCreatedAt(row)
                      ? new Date(getCreatedAt(row)).toLocaleDateString()
                      : "-"}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onView(row.id)}
                    sx={{
                      borderRadius: 0,
                      textTransform: "none",
                      borderColor: getBorderColor(),
                      color: getTextColor(),
                      fontSize: "0.6rem",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: getTextColor(),
                        bgcolor: isDarkMode
                          ? "rgba(255,255,255,0.05)"
                          : "#f8f6f2",
                      },
                    }}
                  >
                    View
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        ))}

        {rows.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography
                sx={{
                  color: getSecondaryTextColor(),
                  transition: "color 0.3s ease",
                }}
              >
                No customers found.
              </Typography>
            </Box>
          </Grid>
        ) : null}
      </Grid>
    );
  }

  // Desktop view - show table
  return (
    <Card
      sx={{
        overflowX: "auto",
        boxShadow: "none",
        border: "1px solid",
        borderColor: getBorderColor(),
        bgcolor: getCardBackground(),
        borderRadius: 1,
        transition: "all 0.3s ease",
      }}
    >
      <Table sx={{ minWidth: 700 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: getHeaderBackgroundColor() }}>
            <TableCell
              sx={{
                fontWeight: 600,
                letterSpacing: "0.24em",
                fontSize: "0.65rem",
                color: getSecondaryTextColor(),
                transition: "color 0.3s ease",
                py: 1.5,
              }}
            >
              Customer
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                letterSpacing: "0.24em",
                fontSize: "0.65rem",
                color: getSecondaryTextColor(),
                transition: "color 0.3s ease",
                py: 1.5,
              }}
            >
              Phone
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                letterSpacing: "0.24em",
                fontSize: "0.65rem",
                color: getSecondaryTextColor(),
                transition: "color 0.3s ease",
                py: 1.5,
              }}
            >
              Created
            </TableCell>
            <TableCell
              align="right"
              sx={{
                fontWeight: 600,
                letterSpacing: "0.24em",
                fontSize: "0.65rem",
                color: getSecondaryTextColor(),
                transition: "color 0.3s ease",
                py: 1.5,
              }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              hover
              sx={{
                "&:hover": {
                  bgcolor: getHoverBackgroundColor(),
                },
                "&:last-child td, &:last-child th": {
                  border: 0,
                },
              }}
            >
              <TableCell>
                <Typography
                  fontWeight={500}
                  sx={{
                    color: getTextColor(),
                    transition: "color 0.3s ease",
                    fontSize: "0.9rem",
                  }}
                >
                  {row.name}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={row.phone ?? "-"}
                  size="small"
                  sx={{
                    fontSize: "0.6rem",
                    bgcolor: getChipBackgroundColor(),
                    color: getChipTextColor(),
                    fontWeight: 500,
                    transition: "all 0.3s ease",
                    height: 24,
                  }}
                />
              </TableCell>
              <TableCell>
                <Typography
                  variant="caption"
                  sx={{
                    color: getSecondaryTextColor(),
                    fontSize: "0.7rem",
                    transition: "color 0.3s ease",
                  }}
                >
                  {getCreatedAt(row)
                    ? new Date(getCreatedAt(row)).toLocaleDateString()
                    : "-"}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onView(row.id)}
                  sx={{
                    borderRadius: 0,
                    textTransform: "none",
                    borderColor: getBorderColor(),
                    color: getTextColor(),
                    fontSize: "0.65rem",
                    transition: "all 0.3s ease",
                    px: 2.5,
                    "&:hover": {
                      borderColor: getTextColor(),
                      bgcolor: isDarkMode
                        ? "rgba(255,255,255,0.05)"
                        : "#f8f6f2",
                    },
                  }}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography
                    sx={{
                      color: getSecondaryTextColor(),
                      transition: "color 0.3s ease",
                    }}
                  >
                    No customers found.
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </Card>
  );
};
