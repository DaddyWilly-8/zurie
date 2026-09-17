import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import type { Purchase } from "./types";

type Props = {
  items: Purchase[];
};

export const PurchasesTable = ({ items }: Props) => {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 0 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Purchase #</TableCell>
            <TableCell>Supplier ID</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Payment Status</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => {
            const isPaid = item.amountPaid >= item.totalAmount;
            const isPartial = item.amountPaid > 0 && !isPaid;
            return (
              <TableRow key={item.id} hover>
                <TableCell>{item.purchaseNumber}</TableCell>
                <TableCell>#{item.supplierId}</TableCell>
                <TableCell>{item.totalAmount.toLocaleString()}</TableCell>
                <TableCell>{item.amountPaid.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={
                      isPaid ? "Paid" : isPartial ? "Partial" : "On Credit"
                    }
                    color={
                      isPaid ? "success" : isPartial ? "warning" : "default"
                    }
                  />
                </TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
