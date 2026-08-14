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

  // Dynamic styles based on dark mode
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
                  sx={{
                    color: getTextColor(),
                    transition: "color 0.3s ease",
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
