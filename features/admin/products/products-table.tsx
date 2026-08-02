import Image from "next/image";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClone, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { formatUsdPriceInCurrency } from "@/utils/currency";
import type { AdminProduct } from "./types";

type ProductsTableProps = {
  products: AdminProduct[];
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
};

export const ProductsTable = ({ products, onEdit, onDuplicate, onDelete }: ProductsTableProps) => {
  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);

  return (
    <Card sx={{ boxShadow: "none", border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              <TableCell sx={{ letterSpacing: "0.24em", fontSize: "0.68rem", color: "text.secondary", fontWeight: 600 }}>Product</TableCell>
              <TableCell sx={{ letterSpacing: "0.24em", fontSize: "0.68rem", color: "text.secondary", fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ letterSpacing: "0.24em", fontSize: "0.68rem", color: "text.secondary", fontWeight: 600 }}>Price</TableCell>
              <TableCell sx={{ letterSpacing: "0.24em", fontSize: "0.68rem", color: "text.secondary", fontWeight: 600 }}>Stock</TableCell>
              <TableCell sx={{ letterSpacing: "0.24em", fontSize: "0.68rem", color: "text.secondary", fontWeight: 600 }}>Flags</TableCell>
              <TableCell align="right" sx={{ letterSpacing: "0.24em", fontSize: "0.68rem", color: "text.secondary", fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((item) => (
              <TableRow key={item.id} sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 40, height: 40, borderRadius: 1, overflow: "hidden", bgcolor: "background.default", flexShrink: 0 }}>
                      <Image
                        src={item.product_images[0]?.url ?? "/images/products/fallback.png"}
                        alt={item.name}
                        width={40}
                        height={40}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>
                    <Stack spacing={0.2}>
                      <Typography fontWeight={600} sx={{ color: "text.primary", fontSize: "0.9rem" }}>{item.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>{item.slug}</Typography>
                    </Stack>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontSize: "0.85rem" }}>{item.category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</TableCell>
                <TableCell sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                  {formatUsdPriceInCurrency(item.price, currency, rates)}
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: "inline-flex",
                      px: 1.25,
                      py: 0.5,
                      bgcolor: "action.hover",
                      color: "primary.main",
                      letterSpacing: "0.22em",
                      fontSize: "0.68rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.in_stock ? "In Stock" : "Out of Stock"}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ color: "primary.main", fontSize: "0.7rem" }}>
                    {item.featured ? "★ Featured" : ""}
                    {item.best_seller ? (item.featured ? " • " : "") + "Best Seller" : ""}
                    {item.new_arrival ? (item.featured || item.best_seller ? " • " : "") + "New" : ""}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(item.id)}
                      aria-label="Edit product"
                      sx={{ color: "text.primary", "&:hover": { bgcolor: "action.hover" } }}
                    >
                      <FontAwesomeIcon icon={faPencil} size="sm" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onDuplicate(item.id)}
                      aria-label="Duplicate product"
                      sx={{ color: "text.primary", "&:hover": { bgcolor: "action.hover" } }}
                    >
                      <FontAwesomeIcon icon={faClone} size="sm" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(item.id)}
                      aria-label="Delete product"
                      sx={{ "&:hover": { bgcolor: "action.hover" } }}
                    >
                      <FontAwesomeIcon icon={faTrash} size="sm" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
