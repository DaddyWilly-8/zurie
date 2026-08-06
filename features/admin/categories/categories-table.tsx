import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faPencil, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
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

export const CategoriesTable = ({ items, onEdit, onDelete, onUploadImage, onRemoveImage }: CategoriesTableProps) => {
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
            borderColor: "divider",
            borderRadius: 0,
            bgcolor: "background.paper",
            p: 1.6,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <Stack direction="row" spacing={1.5}>
            <Box
              sx={{
                width: 68,
                height: 68,
                borderRadius: 0,
                overflow: "hidden",
                bgcolor: "background.default",
                flexShrink: 0,
              }}
            >
              <img
                src={item.imageUrl ?? item.image_url ?? "/images/products/fallback.png"}
                alt={item.name}
                width={68}
                height={68}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>

            <Stack spacing={0.45} sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ color: "text.primary", fontSize: "1.05rem" }}>{item.name}</Typography>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "0.92rem",
                  lineHeight: 1.25,
                  minHeight: "2.3em",
                  display: "-webkit-box",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {item.description || "No description"}
              </Typography>

              <Typography
                sx={{
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  color: "text.secondary",
                  fontSize: "0.72rem",
                }}
              >
                Order: {item.sortOrder ?? item.sort_order ?? 1}
              </Typography>

              <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap" sx={{ mt: 0.2 }}>
                <Chip
                  size="small"
                  label={(item.visible ?? item.is_visible ?? true) ? "Visible" : "Hidden"}
                  sx={{ fontSize: "0.65rem", height: 22 }}
                />
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  sx={{ minWidth: 34, width: 34, height: 34, borderRadius: 0, p: 0 }}
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
                  <IconButton size="small" onClick={() => void onRemoveImage(item.id)} aria-label="Remove category image">
                    <FontAwesomeIcon icon={faXmark} size="sm" />
                  </IconButton>
                ) : null}
              </Stack>

              <Stack direction="row" spacing={0.5} sx={{ mt: 0.2 }}>
                <IconButton size="small" onClick={() => onEdit(item)} aria-label="Edit category">
                  <FontAwesomeIcon icon={faPencil} size="sm" />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete(item.id)} aria-label="Delete category">
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
