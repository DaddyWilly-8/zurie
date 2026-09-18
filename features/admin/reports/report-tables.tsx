import {
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
import type {
  BalanceSheet,
  BalanceSheetSection,
  CreditorRow,
  DebtorRow,
  InventoryValueReport,
  LowStockRow,
  PurchaseSummary,
  RevenueSummary,
  SalesByChannel,
  StoreStockRow,
  TrialBalanceRow,
} from "@/services/reports/report.service";

const Empty = ({ label }: { label: string }) => (
  <Typography color="text.secondary" sx={{ p: 2 }}>
    {label}
  </Typography>
);

const Wrap = ({ children }: { children: React.ReactNode }) => (
  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 0 }}>
    <Table size="small">{children}</Table>
  </TableContainer>
);

export const SalesByChannelTable = ({ data }: { data: SalesByChannel }) => {
  const rows = Object.entries(data);

  return rows.length === 0 ? (
    <Empty label="No sales data." />
  ) : (
    <Wrap>
      <TableHead>
        <TableRow>
          <TableCell>Channel</TableCell>
          <TableCell>Orders</TableCell>
          <TableCell>Total Revenue</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map(([channel, summary]) => (
          <TableRow key={channel} hover>
            <TableCell>{channel}</TableCell>
            <TableCell>{summary.count}</TableCell>
            <TableCell>{summary.total.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Wrap>
  );
};

export const LowStockTable = ({ rows }: { rows: LowStockRow[] }) =>
  rows.length === 0 ? (
    <Empty label="No low-stock items." />
  ) : (
    <Wrap>
      <TableHead>
        <TableRow>
          <TableCell>Product</TableCell>
          <TableCell>Quantity</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.productId} hover>
            <TableCell>{row.productName}</TableCell>
            <TableCell>{row.quantity}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Wrap>
  );

export const RevenueSummaryTable = ({
  summary,
}: {
  summary: RevenueSummary | undefined;
}) =>
  !summary ? (
    <Empty label="No revenue data." />
  ) : (
    <Wrap>
      <TableHead>
        <TableRow>
          <TableCell>Metric</TableCell>
          <TableCell>Amount</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {(
          [
            ["Gross Sales", summary.grossSales],
            ["Sales Discounts", summary.salesDiscounts],
            ["Net Sales", summary.netSales],
            ["Cost of Goods Sold", summary.costOfGoodsSold],
            ["Gross Profit", summary.grossProfit],
            ["Operating Expenses", summary.operatingExpenses],
            ["Net Profit", summary.netProfit],
          ] as const
        ).map(([label, value]) => (
          <TableRow key={label} hover>
            <TableCell>{label}</TableCell>
            <TableCell>{value.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Wrap>
  );

const BalanceSheetSectionTable = ({
  section,
}: {
  section: BalanceSheetSection;
}) => (
  <>
    {Object.entries(section.groups).map(([groupName, lines]) => (
      <Wrap key={groupName}>
        <TableHead>
          <TableRow>
            <TableCell colSpan={2}>{groupName}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lines.map((line) => (
            <TableRow key={line.ledgerId} hover>
              <TableCell>{line.name}</TableCell>
              <TableCell align="right">
                {line.balance.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Wrap>
    ))}
  </>
);

export const BalanceSheetTable = ({
  balanceSheet,
}: {
  balanceSheet: BalanceSheet | undefined;
}) =>
  !balanceSheet ? (
    <Empty label="No balance sheet data." />
  ) : (
    <Stack spacing={3}>
      {!balanceSheet.isBalanced && (
        <Typography color="error.main">
          Assets do not equal Liabilities + Equity — check for an unposted or
          unbalanced entry.
        </Typography>
      )}

      <Stack spacing={1}>
        <Typography variant="subtitle1">
          Assets — Total: {balanceSheet.assets.total.toLocaleString()}
        </Typography>
        <BalanceSheetSectionTable section={balanceSheet.assets} />
      </Stack>

      <Stack spacing={1}>
        <Typography variant="subtitle1">
          Liabilities — Total: {balanceSheet.liabilities.total.toLocaleString()}
        </Typography>
        <BalanceSheetSectionTable section={balanceSheet.liabilities} />
      </Stack>

      <Stack spacing={1}>
        <Typography variant="subtitle1">
          Equity — Total: {balanceSheet.equity.total.toLocaleString()}
        </Typography>
        <BalanceSheetSectionTable section={balanceSheet.equity} />
        <Typography color="text.secondary">
          Includes Retained Earnings (current period):{" "}
          {balanceSheet.equity.retainedEarnings.toLocaleString()}
        </Typography>
      </Stack>
    </Stack>
  );

export const TrialBalanceTable = ({ rows }: { rows: TrialBalanceRow[] }) =>
  rows.length === 0 ? (
    <Empty label="No ledger entries." />
  ) : (
    <Wrap>
      <TableHead>
        <TableRow>
          <TableCell>Code</TableCell>
          <TableCell>Ledger</TableCell>
          <TableCell>Group</TableCell>
          <TableCell>Debit</TableCell>
          <TableCell>Credit</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.ledgerId} hover>
            <TableCell>{row.code}</TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.groupName}</TableCell>
            <TableCell>{row.debit.toLocaleString()}</TableCell>
            <TableCell>{row.credit.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Wrap>
  );

export const InventoryValueTable = ({
  report,
}: {
  report: InventoryValueReport | undefined;
}) =>
  !report || report.lines.length === 0 ? (
    <Empty label="No inventory value data." />
  ) : (
    <>
      <Typography sx={{ mb: 1.5 }}>
        Total Value: {report.totalValue.toLocaleString()}
      </Typography>
      <Wrap>
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell>Outlet</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Buying Price</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {report.lines.map((line) => (
            <TableRow key={`${line.productId}-${line.outletId}`} hover>
              <TableCell>{line.productName}</TableCell>
              <TableCell>#{line.outletId}</TableCell>
              <TableCell>{line.quantity}</TableCell>
              <TableCell>{line.buyingPrice.toLocaleString()}</TableCell>
              <TableCell>{line.value.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Wrap>
    </>
  );

export const DebtorsTable = ({ rows }: { rows: DebtorRow[] }) =>
  rows.length === 0 ? (
    <Empty label="No debtors." />
  ) : (
    <Wrap>
      <TableHead>
        <TableRow>
          <TableCell>Stakeholder</TableCell>
          <TableCell>Billed</TableCell>
          <TableCell>Received</TableCell>
          <TableCell>Outstanding</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.stakeholderId} hover>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.billed.toLocaleString()}</TableCell>
            <TableCell>{row.received.toLocaleString()}</TableCell>
            <TableCell>{row.outstanding.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Wrap>
  );

export const CreditorsTable = ({ rows }: { rows: CreditorRow[] }) =>
  rows.length === 0 ? (
    <Empty label="No creditors." />
  ) : (
    <Wrap>
      <TableHead>
        <TableRow>
          <TableCell>Stakeholder</TableCell>
          <TableCell>Outstanding</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.stakeholderId} hover>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.outstanding.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Wrap>
  );

export const PurchaseSummaryTable = ({
  summary,
}: {
  summary: PurchaseSummary | undefined;
}) =>
  !summary ? (
    <Empty label="No purchase data." />
  ) : (
    <>
      <Wrap>
        <TableHead>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell>Count</TableCell>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(summary.purchaseOrders).map(([status, stats]) => (
            <TableRow key={status} hover>
              <TableCell>{status}</TableCell>
              <TableCell>{stats.count}</TableCell>
              <TableCell>{stats.total.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Wrap>
      <Typography sx={{ mt: 1.5 }} color="text.secondary">
        Deliveries Received: {summary.deliveriesReceived}
      </Typography>
    </>
  );

export const StoreStockTable = ({ rows }: { rows: StoreStockRow[] }) =>
  rows.length === 0 ? (
    <Empty label="No stock data for this outlet." />
  ) : (
    <Wrap>
      <TableHead>
        <TableRow>
          <TableCell>Product</TableCell>
          <TableCell>Quantity</TableCell>
          <TableCell>Stock Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.productId} hover>
            <TableCell>{row.productName}</TableCell>
            <TableCell>{row.quantity}</TableCell>
            <TableCell>{row.stockStatus}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Wrap>
  );
