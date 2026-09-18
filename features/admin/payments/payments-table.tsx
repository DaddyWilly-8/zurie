import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import type { Payment } from "./types";

type Props = {
  items: Payment[];
  onDelete: (item: Payment) => void;
};

export const PaymentsTable = ({ items, onDelete }: Props) => {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 0 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Payment #</TableCell>
            <TableCell>Reference</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>{item.paymentNumber}</TableCell>
              <TableCell>{item.reference ?? "—"}</TableCell>
              <TableCell>{item.totalAmount.toLocaleString()}</TableCell>
              <TableCell>
                {new Date(item.transactionDate).toLocaleDateString()}
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Delete" arrow>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(item)}
                  >
                    <FontAwesomeIcon icon={faTrash} size="xs" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
