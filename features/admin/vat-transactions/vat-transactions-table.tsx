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
import type { VatTransaction } from "@/services/vat/vat.service";

type Props = {
  items: VatTransaction[];
};

/** "App\Modules\Order\Models\Order" -> "Order" — the PHP FQCN's last segment is the readable part. */
const shortSourceName = (vatableType: string) =>
  vatableType.split("\\").pop() ?? vatableType;

export const VatTransactionsTable = ({ items }: Props) => {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 0 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Source</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>
                <Chip
                  size="small"
                  label={item.type === "output" ? "Output" : "Input"}
                  color={item.type === "output" ? "success" : "info"}
                />
              </TableCell>
              <TableCell>
                {shortSourceName(item.vatableType)} #{item.vatableId}
              </TableCell>
              <TableCell>{item.amount.toLocaleString()}</TableCell>
              <TableCell>
                {new Date(item.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
