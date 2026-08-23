import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faPencil,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import type { Category } from "./types";

type CategoriesTableProps = {
  items: Category[];
  onEdit: (item: Category) => void;
  onDelete: (id: string) => void;
  onUploadImage: (id: string, dataUrl: string) => Promise<void>;
  onRemoveImage: (id: string) => Promise<void>;
};

const toDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const CategoriesTable = ({
  items,
  onEdit,
  onDelete,
  onUploadImage,
  onRemoveImage,
}: CategoriesTableProps) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // Dynamic styles based on dark mode
  const getBorderColor = () =>
    isDarkMode ? "rgba(255,255,255,0.12)" : "divider";
  const getBackgroundColor = () =>
    isDarkMode ? "rgba(255,255,255,0.03)" : "background.paper";
  const getHoverBackgroundColor = () =>
    isDarkMode ? "rgba(255,255,255,0.06)" : "action.hover";
  const getTextColor = () => (isDarkMode ? "#ffffff" : "text.primary");
  const getSecondaryTextColor = () =>
    isDarkMode ? "rgba(255,255,255,0.6)" : "text.secondary";
  const getChipBackgroundColor = () =>
    isDarkMode ? "rgba(255,255,255,0.1)" : "background.default";

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(2, minmax(0, 1fr))",
          xl: "repeat(3, minmax(0, 1fr))",
        },
        gap: 1.8,
      }}
    >
      {items.map((item) => (
        <Card
          key={item.id}
          sx={{
            boxShadow: "none",
            border: "1px solid",
            borderColor: getBorderColor(),
            borderRadius: 0,
            bgcolor: getBackgroundColor(),
            p: 1.6,
            transition: "all 0.3s ease",
            "&:hover": { bgcolor: getHoverBackgroundColor() },
          }}
        >
          <Stack direction="row" spacing={1.5}>
            <Box
              sx={{
                width: 68,
                height: 68,
                borderRadius: 0,
                overflow: "hidden",
                bgcolor: getChipBackgroundColor(),
                flexShrink: 0,
                position: "relative",
              }}
            >
              <Image
                src={
                  item.imageUrl ??
                  item.image_url ??
                  "/images/products/fallback.png"
                }
                alt={item.name}
                fill
                sizes="68px"
                style={{ objectFit: "cover" }}
                priority={false}
              />
            </Box>

            <Stack spacing={0.45} sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  color: getTextColor(),
                  fontSize: "1.05rem",
                  transition: "color 0.3s ease",
                }}
              >
                {item.name}
              </Typography>
              <Typography
                sx={{
                  color: getSecondaryTextColor(),
                  fontSize: "0.92rem",
                  lineHeight: 1.25,
                  minHeight: "2.3em",
                  display: "-webkit-box",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  transition: "color 0.3s ease",
                }}
              >
                {item.description || "No description"}
              </Typography>

              <Typography
                sx={{
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  color: getSecondaryTextColor(),
                  fontSize: "0.72rem",
                  transition: "color 0.3s ease",
                }}
              >
                Order: {item.sortOrder ?? item.sort_order ?? 1}
              </Typography>

              <Stack
                direction="row"
                spacing={0.8}
                alignItems="center"
                flexWrap="wrap"
                sx={{ mt: 0.2 }}
              >
                <Chip
                  size="small"
                  label={
                    (item.visible ?? item.is_visible ?? true)
                      ? "Visible"
                      : "Hidden"
                  }
                  sx={{
                    fontSize: "0.65rem",
                    height: 22,
                    bgcolor: isDarkMode
                      ? (item.visible ?? item.is_visible ?? true)
                        ? "rgba(76,175,80,0.2)"
                        : "rgba(255,255,255,0.1)"
                      : undefined,
                    color: isDarkMode
                      ? (item.visible ?? item.is_visible ?? true)
                        ? "#81c784"
                        : "rgba(255,255,255,0.5)"
                      : undefined,
                  }}
                />
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 34,
                    width: 34,
                    height: 34,
                    borderRadius: 0,
                    p: 0,
                    borderColor: getBorderColor(),
                    color: getTextColor(),
                    "&:hover": {
                      borderColor: getTextColor(),
                      bgcolor: getHoverBackgroundColor(),
                    },
                  }}
                  aria-label="Upload category image"
                >
                  <FontAwesomeIcon icon={faImage} size="sm" />
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const dataUrl = await toDataUrl(file);
                      await onUploadImage(item.id, dataUrl);
                      event.target.value = "";
                    }}
                  />
                </Button>
                {(item.imageUrl ?? item.image_url) ? (
                  <IconButton
                    size="small"
                    onClick={() => void onRemoveImage(item.id)}
                    aria-label="Remove category image"
                    sx={{
                      color: isDarkMode
                        ? "rgba(255,255,255,0.5)"
                        : "text.secondary",
                      "&:hover": {
                        color: isDarkMode ? "#ef9a9a" : "#d32f2f",
                        bgcolor: isDarkMode
                          ? "rgba(244,67,54,0.15)"
                          : "rgba(211,47,47,0.05)",
                      },
                    }}
                  >
                    <FontAwesomeIcon icon={faXmark} size="sm" />
                  </IconButton>
                ) : null}
              </Stack>

              <Stack direction="row" spacing={0.5} sx={{ mt: 0.2 }}>
                <IconButton
                  size="small"
                  onClick={() => onEdit(item)}
                  aria-label="Edit category"
                  sx={{
                    color: isDarkMode
                      ? "rgba(255,255,255,0.5)"
                      : "text.secondary",
                    "&:hover": {
                      color: isDarkMode ? "#ffffff" : "#171512",
                      bgcolor: getHoverBackgroundColor(),
                    },
                  }}
                >
                  <FontAwesomeIcon icon={faPencil} size="sm" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onDelete(item.id)}
                  aria-label="Delete category"
                  sx={{
                    color: isDarkMode
                      ? "rgba(255,255,255,0.5)"
                      : "text.secondary",
                    "&:hover": {
                      color: isDarkMode ? "#ef9a9a" : "#d32f2f",
                      bgcolor: isDarkMode
                        ? "rgba(244,67,54,0.15)"
                        : "rgba(211,47,47,0.05)",
                    },
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} size="sm" />
                </IconButton>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      ))}
    </Box>
  );
};
