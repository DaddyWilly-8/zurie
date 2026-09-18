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
import type { Receipt } from "./types";

type Props = {
  items: Receipt[];
  onDelete: (item: Receipt) => void;
};

export const ReceiptsTable = ({ items, onDelete }: Props) => {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 0 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Receipt #</TableCell>
            <TableCell>Reference</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Linked Sales</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>{item.receiptNumber}</TableCell>
              <TableCell>{item.reference ?? "—"}</TableCell>
              <TableCell>{item.totalAmount.toLocaleString()}</TableCell>
              <TableCell>{item.sales.length}</TableCell>
              <TableCell>
                {new Date(item.transactionDate).toLocaleDateString()}
              </TableCell>
              <TableCell align="right">
                <Tooltip
                  title={
                    item.sales.length > 0
                      ? "Linked to a sale — cannot delete"
                      : "Delete"
                  }
                  arrow
                >
                  <span>
                    <IconButton
                      size="small"
                      color="error"
                      disabled={item.sales.length > 0}
                      onClick={() => onDelete(item)}
                    >
                      <FontAwesomeIcon icon={faTrash} size="xs" />
                    </IconButton>
                  </span>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
