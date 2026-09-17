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
import type { CostCenter } from "./types";

type Props = {
  items: CostCenter[];
  onEdit: (item: CostCenter) => void;
  onToggleActive: (item: CostCenter) => void;
};

export const CostCentersTable = ({ items, onEdit, onToggleActive }: Props) => {
  const byId = new Map(items.map((item) => [item.id, item]));

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
            <TableCell>Parent</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                {item.parentId ? (byId.get(item.parentId)?.name ?? "—") : "—"}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={item.isActive ? "Active" : "Inactive"}
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
