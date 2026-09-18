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
  faStar,
  faClockRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import type { Currency } from "./types";

type Props = {
  items: Currency[];
  onEdit: (item: Currency) => void;
  onToggleActive: (item: Currency) => void;
  onDesignateBase: (item: Currency) => void;
  onManageRates: (item: Currency) => void;
};

export const CurrenciesTable = ({
  items,
  onEdit,
  onToggleActive,
  onDesignateBase,
  onManageRates,
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
            <TableCell>Code</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Symbol</TableCell>
            <TableCell>Base</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>{item.code}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.symbol}</TableCell>
              <TableCell>
                {item.isBase ? (
                  <Chip size="small" label="Base" color="primary" />
                ) : (
                  "—"
                )}
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
                  {!item.isBase ? (
                    <Tooltip title="Manage Exchange Rates" arrow>
                      <IconButton
                        size="small"
                        onClick={() => onManageRates(item)}
                      >
                        <FontAwesomeIcon icon={faClockRotateLeft} size="xs" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                  {!item.isBase ? (
                    <Tooltip title="Set as Base Currency" arrow>
                      <IconButton
                        size="small"
                        onClick={() => onDesignateBase(item)}
                      >
                        <FontAwesomeIcon icon={faStar} size="xs" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
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
