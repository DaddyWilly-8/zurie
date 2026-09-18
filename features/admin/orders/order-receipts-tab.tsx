"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Box,
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
import { orderService } from "@/services/orders/order.service";
import { formatBaseCurrencyInCurrency } from "@/utils/currency";
import type { CurrencyCode, CurrencyRateMap } from "@/utils/currency";

type Props = {
  orderNumber: string;
  totalAmount: number;
  currency: CurrencyCode;
  rates: Partial<CurrencyRateMap>;
};

/** The Receipts tab — every Receipt applied against this order's AR balance, via Phase G's receipt_order link. Read-only; a receipt is created from the Receipts admin screen, not here. */
export const OrderReceiptsTab = ({
  orderNumber,
  totalAmount,
  currency,
  rates,
}: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-order-receipts", orderNumber],
    queryFn: () => orderService.getReceipts(orderNumber),
  });

  const receipts = data ?? [];
  const totalApplied = receipts.reduce((sum, r) => sum + r.amountApplied, 0);
  const outstanding = Math.max(0, totalAmount - totalApplied);

  return (
    <Stack spacing={2} sx={{ pt: 2 }}>
      {isLoading ? (
        <Typography color="text.secondary">Loading receipts...</Typography>
      ) : receipts.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 2 }}>
          <Typography color="text.secondary">
            No receipts have been applied against this order yet.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Receipt #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Amount Applied</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.receiptId}>
                  <TableCell>{receipt.receiptNumber}</TableCell>
                  <TableCell>
                    {new Date(receipt.transactionDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    {formatBaseCurrencyInCurrency(
                      receipt.amountApplied,
                      currency,
                      rates,
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Stack direction="row" justifyContent="space-between">
        <Typography color="text.secondary">Outstanding balance</Typography>
        <Typography fontWeight={600}>
          {formatBaseCurrencyInCurrency(outstanding, currency, rates)}
        </Typography>
      </Stack>
    </Stack>
  );
};
