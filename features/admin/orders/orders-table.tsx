import {
  Box,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { formatBaseCurrencyInCurrency } from "@/utils/currency";
import type { AdminOrderRow } from "./types";

type Props = {
  rows: AdminOrderRow[];
  onStatusChange: (id: string, nextStatus: string) => void;
};

export const OrdersTable = ({ rows, onStatusChange }: Props) => {
  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);

  return (
    <Box sx={{ overflowX: "auto", boxShadow: "none", border: "1px solid", borderColor: "divider", borderRadius: 1, bgcolor: "background.paper" }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "action.hover" }}>
            <TableCell sx={{ fontWeight: 600 }}>Order</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>WhatsApp</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.order_number}</TableCell>
              <TableCell>
                <Typography fontWeight={600}>{row.customer_name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.customer_phone}
                </Typography>
              </TableCell>
              <TableCell>{row.whatsapp_number}</TableCell>
              <TableCell>
                {formatBaseCurrencyInCurrency(row.total_amount, currency, rates)}
              </TableCell>
              <TableCell>
                <TextField
                  select
                  size="small"
                  value={row.status}
                  onChange={(event) => onStatusChange(row.id, event.target.value)}
                  sx={{ minWidth: 180, bgcolor: "background.paper" }}
                >
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="ready_for_delivery">Ready for Delivery</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </TableCell>
              <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}

          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <Typography color="text.secondary">No orders found.</Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </Box>
  );
};
