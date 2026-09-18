import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import type { Grn } from "./types";

type Props = {
  items: Grn[];
};

export const GrnsTable = ({ items }: Props) => {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 0 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>GRN #</TableCell>
            <TableCell>Purchase Order</TableCell>
            <TableCell>Date Received</TableCell>
            <TableCell>Cost Factor</TableCell>
            <TableCell>Lines</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>{item.grnNumber}</TableCell>
              <TableCell>#{item.purchaseOrderId}</TableCell>
              <TableCell>
                {new Date(item.dateReceived).toLocaleDateString()}
              </TableCell>
              <TableCell>{item.costFactor}</TableCell>
              <TableCell>
                {item.lines
                  .map(
                    (line) => `#${line.productId} × ${line.quantityReceived}`,
                  )
                  .join(", ")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
