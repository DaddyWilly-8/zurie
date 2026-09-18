import { Fragment, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Chip,
  Collapse,
  Divider,
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
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faChevronDown,
  faChevronRight,
  faLock,
  faLockOpen,
  faRotateLeft,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { ApiError } from "@/services/api/client";
import { grnService } from "@/services/procurement/grn.service";
import { purchaseOrderService } from "@/services/procurement/purchase-order.service";
import type { PurchaseOrder, PurchaseOrderStatus } from "./types";

type Props = {
  items: PurchaseOrder[];
  onReceive: (item: PurchaseOrder) => void;
  onClose: (item: PurchaseOrder) => void;
  onReopen: (item: PurchaseOrder) => void;
  onCancel: (item: PurchaseOrder) => void;
  onDelete: (item: PurchaseOrder) => void;
  /** Called after a GRN is successfully un-received, so the parent can refetch the PO list (status/remaining quantities change) and show feedback. */
  onGrnUnreceived: (message: string) => void;
  onGrnUnreceiveError: (message: string) => void;
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

/**
 * The GRNs tab/accordion content for one PurchaseOrder — fetched lazily
 * only once its row is expanded (`enabled: open`), not eagerly for every
 * row on the page. Each delivery can be "un-received" (deleted) — this
 * reverses the GRN's stock and ledger effect server-side; rejected there
 * if the received stock has already moved on (e.g. sold), surfaced here
 * as an error rather than assumed to always succeed.
 */
const GrnsPanel = ({
  purchaseOrderId,
  open,
  onUnreceived,
  onUnreceiveError,
}: {
  purchaseOrderId: number;
  open: boolean;
  onUnreceived: (message: string) => void;
  onUnreceiveError: (message: string) => void;
}) => {
  const queryClient = useQueryClient();
  const queryKey = ["admin-grns-for-po", purchaseOrderId];
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => grnService.list({ page: 1, pageSize: 50, purchaseOrderId }),
    enabled: open,
  });

  const grns = data?.data ?? [];

  const handleUnreceive = async (grnId: number, grnNumber: string) => {
    try {
      await grnService.remove(grnId);
      onUnreceived(`${grnNumber} un-received`);
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.invalidateQueries({
        queryKey: ["admin-purchase-orders"],
      });
    } catch (error) {
      onUnreceiveError(
        error instanceof ApiError
          ? error.message
          : `Failed to un-receive ${grnNumber}`,
      );
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: "action.hover" }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Deliveries (GRNs)
      </Typography>
      {isLoading ? (
        <Typography color="text.secondary" variant="body2">
          Loading deliveries...
        </Typography>
      ) : grns.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          No deliveries received against this purchase order yet.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {grns.map((grn) => (
            <Stack
              key={grn.id}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 1 }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {grn.grnNumber} —{" "}
                  {new Date(grn.dateReceived).toLocaleDateString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {grn.lines
                    .map(
                      (line) =>
                        `Product #${line.productId} × ${line.quantityReceived}`,
                    )
                    .join(", ")}
                  {grn.costFactor !== 1
                    ? ` (cost factor ${grn.costFactor})`
                    : ""}
                </Typography>
              </Box>
              <Tooltip title="Un-receive (reverses stock and the ledger)" arrow>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleUnreceive(grn.id, grn.grnNumber)}
                >
                  <FontAwesomeIcon icon={faRotateLeft} size="xs" />
                </IconButton>
              </Tooltip>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
};

/**
 * The Payments tab/panel content for one PurchaseOrder — every Payment
 * applied against its payable balance, via the `payment_purchase_order`
 * link. Read-only; a payment is created from the Payments admin screen,
 * not here — same pattern as GrnsPanel above.
 */
const PaymentsPanel = ({
  purchaseOrderId,
  open,
}: {
  purchaseOrderId: number;
  open: boolean;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments-for-po", purchaseOrderId],
    queryFn: () => purchaseOrderService.getPayments(purchaseOrderId),
    enabled: open,
  });

  const payments = data ?? [];

  return (
    <Box sx={{ p: 2, bgcolor: "action.hover" }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Payments
      </Typography>
      {isLoading ? (
        <Typography color="text.secondary" variant="body2">
          Loading payments...
        </Typography>
      ) : payments.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          No payments have been applied against this purchase order yet.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {payments.map((payment) => (
            <Stack
              key={payment.paymentId}
              direction="row"
              justifyContent="space-between"
              sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 1 }}
            >
              <Typography variant="body2">
                {payment.paymentNumber} —{" "}
                {new Date(payment.transactionDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {payment.amountApplied.toLocaleString()}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export const PurchaseOrdersTable = ({
  items,
  onReceive,
  onClose,
  onReopen,
  onCancel,
  onDelete,
  onGrnUnreceived,
  onGrnUnreceiveError,
}: Props) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 0 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
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
            const isExpanded = expandedId === item.id;
            return (
              <Fragment key={item.id}>
                <TableRow hover>
                  <TableCell sx={{ width: 40 }}>
                    <IconButton
                      size="small"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    >
                      <FontAwesomeIcon
                        icon={isExpanded ? faChevronDown : faChevronRight}
                        size="xs"
                      />
                    </IconButton>
                  </TableCell>
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
                      {["pending", "partially_received"].includes(
                        item.status,
                      ) ? (
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
                          <IconButton
                            size="small"
                            onClick={() => onClose(item)}
                          >
                            <FontAwesomeIcon icon={faLock} size="xs" />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                      {item.status === "closed" ? (
                        <Tooltip title="Reopen" arrow>
                          <IconButton
                            size="small"
                            onClick={() => onReopen(item)}
                          >
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
                <TableRow>
                  <TableCell sx={{ p: 0, border: 0 }} colSpan={8}>
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <GrnsPanel
                        purchaseOrderId={item.id}
                        open={isExpanded}
                        onUnreceived={onGrnUnreceived}
                        onUnreceiveError={onGrnUnreceiveError}
                      />
                      <Divider />
                      <PaymentsPanel
                        purchaseOrderId={item.id}
                        open={isExpanded}
                      />
                    </Collapse>
                  </TableCell>
                </TableRow>
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
