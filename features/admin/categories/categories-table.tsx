import Image from "next/image";
import {
  Box,
  Card,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { Category } from "./types";

type CategoriesTableProps = {
  items: Category[];
  onEdit: (item: Category) => void;
  onDelete: (id: string) => void;
};

export const CategoriesTable = ({ items, onEdit, onDelete }: CategoriesTableProps) => {
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
            border: "1px solid #e5ded2",
            borderRadius: 0,
            bgcolor: "#ffffff",
            p: 1.6,
            "&:hover": { bgcolor: "#fcfaf6" },
          }}
        >
          <Stack direction="row" spacing={1.5}>
            <Box
              sx={{
                width: 68,
                height: 68,
                borderRadius: 0,
                overflow: "hidden",
                bgcolor: "#e9e2d8",
                flexShrink: 0,
              }}
            >
              <Image
                src={item.image_url || "/images/products/fallback.png"}
                alt={item.name}
                width={68}
                height={68}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>

            <Stack spacing={0.45} sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ color: "#171512", fontSize: "1.05rem" }}>{item.name}</Typography>
              <Typography
                sx={{
                  color: "#7a6f61",
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
                  color: "#6f6658",
                  fontSize: "0.72rem",
                }}
              >
                Order: {item.sort_order ?? 1}
              </Typography>

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
