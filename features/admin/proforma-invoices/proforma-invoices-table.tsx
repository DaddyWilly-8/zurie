import {
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faPowerOff,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import type { ProformaInvoice } from "./types";

type Props = {
  items: ProformaInvoice[];
  onEdit: (item: ProformaInvoice) => void;
  onToggleActive: (item: ProformaInvoice) => void;
};

export const ProformaInvoicesTable = ({
  items,
  onEdit,
  onToggleActive,
}: Props) => {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 0 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Proforma #</TableCell>
            <TableCell>Stakeholder</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Expiry</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>{item.proformaNumber}</TableCell>
              <TableCell>#{item.stakeholderId}</TableCell>
              <TableCell>{item.totalAmount.toLocaleString()}</TableCell>
              <TableCell>
                {item.expiryDate
                  ? new Date(item.expiryDate).toLocaleDateString()
                  : "—"}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={item.isActive ? "Live" : "Withdrawn"}
                  color={item.isActive ? "success" : "default"}
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <Tooltip title="Edit" arrow>
                    <IconButton size="small" onClick={() => onEdit(item)}>
                      <FontAwesomeIcon icon={faPencil} size="xs" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={item.isActive ? "Withdraw" : "Restore"} arrow>
                    <IconButton
                      size="small"
                      onClick={() => onToggleActive(item)}
                      color={item.isActive ? "error" : "success"}
                    >
                      <FontAwesomeIcon
                        icon={item.isActive ? faPowerOff : faRotateLeft}
                        size="xs"
                      />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
