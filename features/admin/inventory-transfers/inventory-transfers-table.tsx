import { Fragment, useState } from "react";
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import type { SalesOutlet } from "@/services/outlets/outlet.service";
import type { CostCenter } from "@/services/cost-centers/cost-center.service";
import type { AdminProduct } from "@/features/admin/products";
import type { InventoryTransfer, InventoryTransferType } from "./types";

type Props = {
  items: InventoryTransfer[];
  outlets: SalesOutlet[];
  costCenters: CostCenter[];
  products: AdminProduct[];
};

const TYPE_LABEL: Record<InventoryTransferType, string> = {
  internal: "Internal",
  external: "External (Write-off)",
  cost_center_change: "Cost Center Change",
};

const TYPE_COLOR: Record<
  InventoryTransferType,
  "default" | "warning" | "info"
> = {
  internal: "info",
  external: "warning",
  cost_center_change: "default",
};

export const InventoryTransfersTable = ({
  items,
  outlets,
  costCenters,
  products,
}: Props) => {
  const [expanded, setExpanded] = useState<number | null>(null);

  const outletName = (id: number | null) =>
    id === null ? "—" : (outlets.find((o) => o.id === id)?.name ?? `#${id}`);

  const costCenterName = (id: number | null) =>
    id === null
      ? "—"
      : (costCenters.find((c) => c.id === id)?.name ?? `#${id}`);

  const productName = (id: number) =>
    products.find((p) => Number(p.id) === id)?.name ?? `#${id}`;

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 0 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell width={40} />
            <TableCell>Transfer #</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Source</TableCell>
            <TableCell>Destination</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Items</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => {
            const isOpen = expanded === item.id;
            const destination =
              item.type === "internal"
                ? outletName(item.destinationOutletId)
                : item.type === "cost_center_change"
                  ? costCenterName(item.destinationCostCenterId)
                  : "—";
            const source =
              item.type === "cost_center_change"
                ? costCenterName(item.sourceCostCenterId)
                : outletName(item.sourceOutletId);

            return (
              <Fragment key={item.id}>
                <TableRow hover>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => setExpanded(isOpen ? null : item.id)}
                    >
                      <FontAwesomeIcon
                        icon={isOpen ? faChevronDown : faChevronRight}
                        size="xs"
                      />
                    </IconButton>
                  </TableCell>
                  <TableCell>{item.transferNumber}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={TYPE_LABEL[item.type]}
                      color={TYPE_COLOR[item.type]}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{source}</TableCell>
                  <TableCell>{destination}</TableCell>
                  <TableCell>
                    {item.transferDate
                      ? new Date(item.transferDate).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>{item.items.length}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={7} sx={{ p: 0, border: 0 }}>
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                      <Box sx={{ p: 2, bgcolor: "action.hover" }}>
                        <Stack spacing={1}>
                          {item.notes ? (
                            <Typography variant="body2" color="text.secondary">
                              Notes: {item.notes}
                            </Typography>
                          ) : null}
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Product</TableCell>
                                <TableCell>Quantity</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {item.items.map((line, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    {productName(line.productId)}
                                  </TableCell>
                                  <TableCell>{line.quantity}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Stack>
                      </Box>
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
