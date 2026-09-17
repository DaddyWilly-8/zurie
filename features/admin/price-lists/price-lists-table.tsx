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
  faTags,
} from "@fortawesome/free-solid-svg-icons";
import type { PriceList } from "./types";

type Props = {
  items: PriceList[];
  onEdit: (item: PriceList) => void;
  onManageItems: (item: PriceList) => void;
  onToggleActive: (item: PriceList) => void;
};

export const PriceListsTable = ({
  items,
  onEdit,
  onManageItems,
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
            <TableCell>Name</TableCell>
            <TableCell>Scope</TableCell>
            <TableCell>Validity</TableCell>
            <TableCell>Products</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                {item.outletId
                  ? `Outlet #${item.outletId}`
                  : item.customerId
                    ? `Customer #${item.customerId}`
                    : "Default"}
              </TableCell>
              <TableCell>
                {item.validFrom || item.validTo
                  ? `${item.validFrom ?? "…"} → ${item.validTo ?? "…"}`
                  : "Always"}
              </TableCell>
              <TableCell>{item.items.length}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={item.isActive ? "Active" : "Inactive"}
                  color={item.isActive ? "success" : "default"}
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <Tooltip title="Manage Prices" arrow>
                    <IconButton
                      size="small"
                      onClick={() => onManageItems(item)}
                    >
                      <FontAwesomeIcon icon={faTags} size="xs" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit" arrow>
                    <IconButton size="small" onClick={() => onEdit(item)}>
                      <FontAwesomeIcon icon={faPencil} size="xs" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title={item.isActive ? "Deactivate" : "Reactivate"}
                    arrow
                  >
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
