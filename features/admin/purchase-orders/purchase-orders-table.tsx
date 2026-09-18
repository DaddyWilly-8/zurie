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
  faBoxOpen,
  faLock,
  faLockOpen,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import type { PurchaseOrder, PurchaseOrderStatus } from "./types";

type Props = {
  items: PurchaseOrder[];
  onReceive: (item: PurchaseOrder) => void;
  onClose: (item: PurchaseOrder) => void;
  onReopen: (item: PurchaseOrder) => void;
  onCancel: (item: PurchaseOrder) => void;
  onDelete: (item: PurchaseOrder) => void;
};

const STATUS_COLOR: Record<
  PurchaseOrderStatus,
  "default" | "warning" | "success" | "error"
> = {
  pending: "default",
  partially_received: "warning",
  fully_received: "success",
  closed: "default",
  canceled: "error",
};

const STATUS_LABEL: Record<PurchaseOrderStatus, string> = {
  pending: "Pending",
  partially_received: "Partially Received",
  fully_received: "Fully Received",
  closed: "Closed",
  canceled: "Canceled",
};

export const PurchaseOrdersTable = ({
  items,
  onReceive,
  onClose,
  onReopen,
  onCancel,
  onDelete,
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
            <TableCell>PO #</TableCell>
            <TableCell>Stakeholder</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>VAT</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date Required</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => {
            const hasNoGrns = ["pending", "canceled"].includes(item.status);
            return (
              <TableRow key={item.id} hover>
                <TableCell>{item.poNumber}</TableCell>
                <TableCell>
                  {item.stakeholderId
                    ? `#${item.stakeholderId}`
                    : "Cash Purchase"}
                </TableCell>
                <TableCell>{item.totalAmount.toLocaleString()}</TableCell>
                <TableCell>{item.vatAmount.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={STATUS_LABEL[item.status]}
                    color={STATUS_COLOR[item.status]}
                  />
                </TableCell>
                <TableCell>
                  {new Date(item.dateRequired).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <Stack
                    direction="row"
                    spacing={0.5}
                    justifyContent="flex-end"
                  >
                    {["pending", "partially_received"].includes(item.status) ? (
                      <Tooltip title="Receive (GRN)" arrow>
                        <IconButton
                          size="small"
                          onClick={() => onReceive(item)}
                        >
                          <FontAwesomeIcon icon={faBoxOpen} size="xs" />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                    {[
                      "pending",
                      "partially_received",
                      "fully_received",
                    ].includes(item.status) ? (
                      <Tooltip title="Close" arrow>
                        <IconButton size="small" onClick={() => onClose(item)}>
                          <FontAwesomeIcon icon={faLock} size="xs" />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                    {item.status === "closed" ? (
                      <Tooltip title="Reopen" arrow>
                        <IconButton size="small" onClick={() => onReopen(item)}>
                          <FontAwesomeIcon icon={faLockOpen} size="xs" />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                    {[
                      "pending",
                      "partially_received",
                      "fully_received",
                    ].includes(item.status) ? (
                      <Tooltip title="Cancel" arrow>
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => onCancel(item)}
                        >
                          <FontAwesomeIcon icon={faXmark} size="xs" />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                    {hasNoGrns ? (
                      <Tooltip title="Delete" arrow>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(item)}
                        >
                          <FontAwesomeIcon icon={faTrash} size="xs" />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
