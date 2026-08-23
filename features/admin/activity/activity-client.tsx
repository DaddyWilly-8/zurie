"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  Skeleton,
  useTheme,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  useMediaQuery,
  Divider,
} from "@mui/material";
import {
  Search,
  Person,
  Inventory,
  ShoppingCart,
  Settings,
  Login,
  Logout,
  Update,
  Add,
  Delete,
  Visibility,
  FilterList,
  Clear,
  Close,
  ChevronRight,
} from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxArchive, faTag } from "@fortawesome/free-solid-svg-icons";
import { activityService } from "@/services/activity/activity.service";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type ActivityLogRow = {
  id: number;
  logName: string;
  event: string;
  description: string;
  subjectType: string | null;
  subjectId: number | null;
  causerId: number;
  causerName: string;
  createdAt: string;
};

type ActivityServiceResponse = {
  data: ActivityLogRow[];
  count: number;
};

// Get icon and color based on log type
const getLogTypeConfig = (logName: string) => {
  const configs: Record<
    string,
    {
      icon: React.ReactNode;
      color: "primary" | "success" | "warning" | "error" | "info" | "default";
      bgColor: string;
    }
  > = {
    auth: {
      icon: <Person fontSize="small" />,
      color: "primary",
      bgColor: "#e3f2fd",
    },
    inventory: {
      icon: <Inventory fontSize="small" />,
      color: "success",
      bgColor: "#e8f5e9",
    },
    product: {
      icon: <FontAwesomeIcon icon={faBoxArchive} fontSize={14} />,
      color: "warning",
      bgColor: "#fff3e0",
    },
    category: {
      icon: <FontAwesomeIcon icon={faTag} fontSize={14} />,
      color: "info",
      bgColor: "#f3e5f5",
    },
    order: {
      icon: <ShoppingCart fontSize="small" />,
      color: "info",
      bgColor: "#e0f7fa",
    },
    settings: {
      icon: <Settings fontSize="small" />,
      color: "default",
      bgColor: "#f5f5f5",
    },
  };
  return configs[logName] || configs.settings;
};

// Get icon for event type
const getEventIcon = (event: string) => {
  const icons: Record<string, React.ReactNode> = {
    login: <Login fontSize="small" />,
    logout: <Logout fontSize="small" />,
    created: <Add fontSize="small" />,
    updated: <Update fontSize="small" />,
    deleted: <Delete fontSize="small" />,
    viewed: <Visibility fontSize="small" />,
  };
  return icons[event] || <Update fontSize="small" />;
};

// Get color for event
const getEventColor = (
  event: string,
): "primary" | "success" | "warning" | "error" | "info" | "default" => {
  const colors: Record<
    string,
    "primary" | "success" | "warning" | "error" | "info" | "default"
  > = {
    login: "primary",
    logout: "default",
    created: "success",
    updated: "warning",
    deleted: "error",
    viewed: "info",
  };
  return colors[event] || "default";
};

const getLogNameLabel = (logName: string) => {
  const labels: Record<string, string> = {
    auth: "Authentication",
    inventory: "Inventory",
    product: "Product",
    category: "Category",
    order: "Order",
    settings: "Settings",
  };
  return labels[logName] || logName;
};

// Activity Detail Dialog Component
const ActivityDetailDialog = ({
  open,
  onClose,
  entry,
}: {
  open: boolean;
  onClose: () => void;
  entry: ActivityLogRow | null;
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  if (!entry) return null;

  const logConfig = getLogTypeConfig(entry.logName);
  const eventColor = getEventColor(entry.event);
  const eventIcon = getEventIcon(entry.event);

  const getBorderColor = () =>
    isDarkMode ? "rgba(255,255,255,0.12)" : "#e9e2d8";
  const getTextColor = () => (isDarkMode ? "#ffffff" : "text.primary");
  const getSecondaryTextColor = () =>
    isDarkMode ? "rgba(255,255,255,0.6)" : "text.secondary";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: isDarkMode ? "#1a1a1a" : "#ffffff",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${getBorderColor()}`,
          pb: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: isDarkMode
                ? "rgba(255,255,255,0.08)"
                : logConfig.bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isDarkMode ? "#ffffff" : "text.primary",
            }}
          >
            {logConfig.icon}
          </Box>
          <Box>
            <Typography
              sx={{
                color: getTextColor(),
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              Activity Details
            </Typography>
            <Typography
              sx={{
                color: getSecondaryTextColor(),
                fontSize: "0.75rem",
              }}
            >
              #{entry.id} •{" "}
              {dayjs(entry.createdAt).format("MMMM D, YYYY h:mm A")}
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Stack spacing={2.5}>
          {/* User */}
          <Paper
            sx={{
              p: 2,
              bgcolor: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8f6f2",
              borderRadius: 1.5,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: isDarkMode
                    ? "rgba(255,255,255,0.1)"
                    : "primary.main",
                  color: "#fff",
                }}
              >
                {entry.causerName.charAt(0)}
              </Avatar>
              <Box>
                <Typography
                  sx={{
                    color: getTextColor(),
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  {entry.causerName}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Action & Resource */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Paper
              sx={{
                flex: 1,
                p: 2,
                bgcolor: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8f6f2",
                borderRadius: 1.5,
              }}
            >
              <Typography
                sx={{
                  color: getSecondaryTextColor(),
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.3em",
                }}
              >
                Event
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mt: 0.5 }}
              >
                <Box sx={{ color: `${eventColor}.main` }}>{eventIcon}</Box>
                <Chip
                  label={entry.event}
                  size="small"
                  color={eventColor}
                  sx={{
                    fontSize: "0.65rem",
                    height: 22,
                    fontWeight: 500,
                    textTransform: "capitalize",
                  }}
                />
              </Stack>
            </Paper>

            <Paper
              sx={{
                flex: 1,
                p: 2,
                bgcolor: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8f6f2",
                borderRadius: 1.5,
              }}
            >
              <Typography
                sx={{
                  color: getSecondaryTextColor(),
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.3em",
                }}
              >
                Resource
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mt: 0.5 }}
              >
                <Box sx={{ color: logConfig.color }}>{logConfig.icon}</Box>
                <Chip
                  label={getLogNameLabel(entry.logName)}
                  size="small"
                  color={logConfig.color}
                  sx={{
                    fontSize: "0.65rem",
                    height: 22,
                    fontWeight: 500,
                  }}
                />
                {entry.subjectId && (
                  <Chip
                    label={`#${entry.subjectId}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: "0.55rem",
                      height: 20,
                      fontWeight: 400,
                      borderColor: getBorderColor(),
                      color: getSecondaryTextColor(),
                    }}
                  />
                )}
                {entry.subjectType && (
                  <Chip
                    label={entry.subjectType}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: "0.55rem",
                      height: 20,
                      fontWeight: 400,
                      borderColor: getBorderColor(),
                      color: getSecondaryTextColor(),
                    }}
                  />
                )}
              </Stack>
            </Paper>
          </Stack>

          {/* Description */}
          <Paper
            sx={{
              p: 2.5,
              bgcolor: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8f6f2",
              borderRadius: 1.5,
              border: `1px solid ${getBorderColor()}`,
            }}
          >
            <Typography
              sx={{
                color: getSecondaryTextColor(),
                fontSize: "0.6rem",
                textTransform: "uppercase",
                letterSpacing: "0.3em",
                mb: 1.5,
              }}
            >
              Description
            </Typography>
            <Typography
              sx={{
                color: getTextColor(),
                fontSize: "0.95rem",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {entry.description}
            </Typography>
          </Paper>

          {/* Metadata */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Paper
              sx={{
                flex: 1,
                p: 1.5,
                bgcolor: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8f6f2",
                borderRadius: 1.5,
              }}
            >
              <Typography
                sx={{
                  color: getSecondaryTextColor(),
                  fontSize: "0.55rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.3em",
                }}
              >
                Log Type
              </Typography>
              <Typography
                sx={{
                  color: getTextColor(),
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  mt: 0.5,
                }}
              >
                {entry.logName}
              </Typography>
            </Paper>

            <Paper
              sx={{
                flex: 1,
                p: 1.5,
                bgcolor: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8f6f2",
                borderRadius: 1.5,
              }}
            >
              <Typography
                sx={{
                  color: getSecondaryTextColor(),
                  fontSize: "0.55rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.3em",
                }}
              >
                Timestamp
              </Typography>
              <Typography
                sx={{
                  color: getTextColor(),
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  mt: 0.5,
                }}
              >
                {dayjs(entry.createdAt).format("YYYY-MM-DD HH:mm:ss")}
              </Typography>
            </Paper>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: `1px solid ${getBorderColor()}`,
          pt: 2,
          pb: 2,
          px: 3,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 1.5,
            textTransform: "none",
            borderColor: getBorderColor(),
            color: getTextColor(),
            "&:hover": {
              borderColor: getTextColor(),
              bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "action.hover",
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Mobile Activity Card Component
const MobileActivityCard = ({
  entry,
  onViewDetails,
}: {
  entry: ActivityLogRow;
  onViewDetails: (entry: ActivityLogRow) => void;
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const logConfig = getLogTypeConfig(entry.logName);
  const eventColor = getEventColor(entry.event);
  const eventIcon = getEventIcon(entry.event);

  const getBorderColor = () =>
    isDarkMode ? "rgba(255,255,255,0.12)" : "#e9e2d8";
  const getTextColor = () => (isDarkMode ? "#ffffff" : "text.primary");
  const getSecondaryTextColor = () =>
    isDarkMode ? "rgba(255,255,255,0.6)" : "text.secondary";

  return (
    <Paper
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 1.5,
        border: `1px solid ${getBorderColor()}`,
        bgcolor: isDarkMode ? "rgba(255,255,255,0.02)" : "#ffffff",
        transition: "all 0.2s ease",
        "&:hover": {
          bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8f6f2",
        },
      }}
    >
      <Stack spacing={1.5}>
        {/* Header: User + Time */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: isDarkMode ? "rgba(255,255,255,0.1)" : "primary.main",
                color: "#fff",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {entry.causerName.charAt(0)}
            </Avatar>
            <Box>
              <Typography
                sx={{
                  color: getTextColor(),
                  fontWeight: 500,
                  fontSize: "0.85rem",
                }}
              >
                {entry.causerName}
              </Typography>
              <Typography
                sx={{
                  color: getSecondaryTextColor(),
                  fontSize: "0.6rem",
                }}
              >
                {dayjs(entry.createdAt).fromNow()}
              </Typography>
            </Box>
          </Stack>
          <Typography
            sx={{
              color: getSecondaryTextColor(),
              fontSize: "0.55rem",
            }}
          >
            #{entry.id}
          </Typography>
        </Stack>

        <Divider sx={{ borderColor: getBorderColor() }} />

        {/* Middle: Action + Resource */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ color: `${eventColor}.main`, display: "flex" }}>
              {eventIcon}
            </Box>
            <Chip
              label={entry.event}
              size="small"
              color={eventColor}
              sx={{
                fontSize: "0.55rem",
                height: 18,
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            />
          </Stack>
          <ChevronRight sx={{ color: getSecondaryTextColor(), fontSize: 14 }} />
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ color: logConfig.color, display: "flex" }}>
              {logConfig.icon}
            </Box>
            <Chip
              label={getLogNameLabel(entry.logName)}
              size="small"
              color={logConfig.color}
              sx={{
                fontSize: "0.55rem",
                height: 18,
                fontWeight: 500,
              }}
            />
            {entry.subjectId && (
              <Chip
                label={`#${entry.subjectId}`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: "0.5rem",
                  height: 16,
                  fontWeight: 400,
                  borderColor: getBorderColor(),
                  color: getSecondaryTextColor(),
                }}
              />
            )}
          </Stack>
        </Stack>

        {/* Description */}
        <Typography
          sx={{
            color: getSecondaryTextColor(),
            fontSize: "0.75rem",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {entry.description}
        </Typography>

        {/* Footer: Details button */}
        <Stack direction="row" justifyContent="flex-end">
          <Button
            size="small"
            onClick={() => onViewDetails(entry)}
            endIcon={<Visibility fontSize="small" />}
            sx={{
              textTransform: "none",
              fontSize: "0.65rem",
              color: getSecondaryTextColor(),
              "&:hover": {
                color: getTextColor(),
                bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "action.hover",
              },
            }}
          >
            View Details
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export const AdminActivityClient = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const PAGE_SIZE = 10; // Changed from 20 to 10
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLogType, setFilterLogType] = useState("all");
  const [selectedEntry, setSelectedEntry] = useState<ActivityLogRow | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<ActivityServiceResponse>({
    queryKey: ["admin-activity", page],
    queryFn: async (): Promise<ActivityServiceResponse> => {
      const result = await activityService.listActivity(page, PAGE_SIZE);
      return {
        data: result.data as ActivityLogRow[],
        count: result.count,
      };
    },
  });

  const entries = useMemo(() => {
    return (response?.data ?? []) as ActivityLogRow[];
  }, [response]);

  const totalCount = useMemo(() => response?.count ?? 0, [response]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    [totalCount],
  );

  const logTypes = useMemo(() => {
    const types = new Set<string>();
    entries.forEach((entry: ActivityLogRow) => {
      types.add(entry.logName);
    });
    return Array.from(types);
  }, [entries]);

  const filteredEntries = useMemo(() => {
    let filtered = entries;

    if (filterLogType !== "all") {
      filtered = filtered.filter(
        (entry: ActivityLogRow) => entry.logName === filterLogType,
      );
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (entry: ActivityLogRow) =>
          entry.description.toLowerCase().includes(term) ||
          entry.causerName.toLowerCase().includes(term) ||
          entry.logName.toLowerCase().includes(term) ||
          entry.event.toLowerCase().includes(term),
      );
    }

    return filtered;
  }, [entries, searchTerm, filterLogType]);

  const handleViewDetails = (entry: ActivityLogRow) => {
    setSelectedEntry(entry);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEntry(null);
  };

  const getBorderColor = () =>
    isDarkMode ? "rgba(255,255,255,0.12)" : "#e9e2d8";
  const getTextColor = () => (isDarkMode ? "#ffffff" : "text.primary");
  const getSecondaryTextColor = () =>
    isDarkMode ? "rgba(255,255,255,0.6)" : "text.secondary";
  const getHoverBgColor = () =>
    isDarkMode ? "rgba(255,255,255,0.05)" : "action.hover";
  const getCardBgColor = () =>
    isDarkMode ? "rgba(255,255,255,0.02)" : "background.paper";

  if (isError) {
    return (
      <Card
        sx={{
          border: `1px solid ${getBorderColor()}`,
          borderRadius: 2,
          boxShadow: "none",
          bgcolor: getCardBgColor(),
        }}
      >
        <CardContent sx={{ p: 3, textAlign: "center" }}>
          <Typography color="error.main" sx={{ py: 2 }}>
            Failed to load activity logs.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Show min 10 data message
  const hasMinData = totalCount >= 10;

  return (
    <>
      <Card
        sx={{
          border: `1px solid ${getBorderColor()}`,
          borderRadius: 2,
          boxShadow: "none",
          bgcolor: getCardBgColor(),
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Header */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Stack spacing={0.5}></Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              <TextField
                size="small"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  minWidth: { xs: "100%", sm: 200 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    borderColor: getBorderColor(),
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search
                        sx={{ color: getSecondaryTextColor(), fontSize: 18 }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm("")}
                      >
                        <Clear sx={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                select
                size="small"
                value={filterLogType}
                onChange={(e) => setFilterLogType(e.target.value)}
                sx={{
                  minWidth: { xs: "100%", sm: 150 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    borderColor: getBorderColor(),
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterList
                        sx={{ color: getSecondaryTextColor(), fontSize: 18 }}
                      />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="all">All Types</MenuItem>
                {logTypes.map((type: string) => (
                  <MenuItem key={type} value={type}>
                    {getLogNameLabel(type)}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Stack>

          {/* Content */}
          {isLoading ? (
            <Stack spacing={1}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={isMobile ? 120 : 50}
                  sx={{
                    borderRadius: 1,
                    bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : undefined,
                  }}
                />
              ))}
            </Stack>
          ) : filteredEntries.length === 0 ? (
            <Box
              sx={{
                py: 4,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              <FilterList
                sx={{ color: getSecondaryTextColor(), fontSize: 40 }}
              />
              <Typography sx={{ color: getSecondaryTextColor() }}>
                {searchTerm || filterLogType !== "all"
                  ? "No matching activities found"
                  : "No activity yet"}
              </Typography>
              {!hasMinData && totalCount > 0 && (
                <Typography
                  sx={{ color: getSecondaryTextColor(), fontSize: "0.8rem" }}
                >
                  Add more activities to reach the minimum of 10
                </Typography>
              )}
            </Box>
          ) : isMobile ? (
            // Mobile View - Cards
            <Box>
              {filteredEntries.map((entry: ActivityLogRow) => (
                <MobileActivityCard
                  key={entry.id}
                  entry={entry}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </Box>
          ) : (
            // Desktop View - Table
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8f6f2",
                    "& th": {
                      fontWeight: 600,
                      color: getSecondaryTextColor(),
                      fontSize: "0.65rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      borderBottom: `1px solid ${getBorderColor()}`,
                    },
                  }}
                >
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">When</TableCell>
                  <TableCell align="center" sx={{ width: 50 }}>
                    Details
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEntries.map((entry: ActivityLogRow) => {
                  const logConfig = getLogTypeConfig(entry.logName);
                  const eventColor = getEventColor(entry.event);
                  const eventIcon = getEventIcon(entry.event);
                  const isDescriptionLong = entry.description.length > 50;

                  return (
                    <TableRow
                      key={entry.id}
                      hover
                      sx={{
                        "&:hover": {
                          bgcolor: getHoverBgColor(),
                        },
                        "& td": {
                          borderBottom: `1px solid ${getBorderColor()}`,
                          py: 1.5,
                        },
                      }}
                    >
                      <TableCell>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                        >
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: isDarkMode
                                ? "rgba(255,255,255,0.1)"
                                : "primary.main",
                              color: "#fff",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            {entry.causerName.charAt(0)}
                          </Avatar>
                          <Typography
                            sx={{
                              color: getTextColor(),
                              fontWeight: 500,
                              fontSize: "0.85rem",
                            }}
                          >
                            {entry.causerName}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: `${eventColor}.main`,
                            }}
                          >
                            {eventIcon}
                          </Box>
                          <Chip
                            label={entry.event}
                            size="small"
                            color={eventColor}
                            sx={{
                              fontSize: "0.6rem",
                              height: 20,
                              fontWeight: 500,
                              textTransform: "capitalize",
                            }}
                          />
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: logConfig.color,
                            }}
                          >
                            {logConfig.icon}
                          </Box>
                          <Chip
                            label={getLogNameLabel(entry.logName)}
                            size="small"
                            color={logConfig.color}
                            sx={{
                              fontSize: "0.6rem",
                              height: 20,
                              fontWeight: 500,
                            }}
                          />
                          {entry.subjectId && (
                            <Chip
                              label={`#${entry.subjectId}`}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: "0.55rem",
                                height: 18,
                                fontWeight: 400,
                                borderColor: getBorderColor(),
                                color: getSecondaryTextColor(),
                              }}
                            />
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            sx={{
                              color: getTextColor(),
                              fontSize: "0.8rem",
                              maxWidth: 250,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={entry.description}
                          >
                            {entry.description}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell align="right">
                        <Stack alignItems="flex-end" spacing={0.25}>
                          <Typography
                            sx={{
                              color: getTextColor(),
                              fontSize: "0.75rem",
                              fontWeight: 500,
                            }}
                          >
                            {dayjs(entry.createdAt).fromNow()}
                          </Typography>
                          <Typography
                            sx={{
                              color: getSecondaryTextColor(),
                              fontSize: "0.6rem",
                            }}
                          >
                            {dayjs(entry.createdAt).format(
                              "MMM D, YYYY h:mm A",
                            )}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(entry)}
                            sx={{
                              color: getSecondaryTextColor(),
                              "&:hover": {
                                color: getTextColor(),
                                bgcolor: isDarkMode
                                  ? "rgba(255,255,255,0.08)"
                                  : "action.hover",
                              },
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalCount > PAGE_SIZE && (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "center", sm: "center" }}
              sx={{
                mt: 2.5,
                pt: 1.5,
                borderTop: `1px solid ${getBorderColor()}`,
              }}
            >
              <Typography
                sx={{
                  color: getSecondaryTextColor(),
                  fontSize: "0.75rem",
                }}
              >
                Showing {filteredEntries.length} of {totalCount} entries
                {!hasMinData && ` (need 10 minimum)`}
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: getTextColor(),
                  },
                }}
              />
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <ActivityDetailDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        entry={selectedEntry}
      />
    </>
  );
};
