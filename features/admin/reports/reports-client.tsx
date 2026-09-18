"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { reportService } from "@/services/reports/report.service";
import { outletService } from "@/services/outlets/outlet.service";
import {
  BalanceSheetTable,
  CreditorsTable,
  DebtorsTable,
  InventoryValueTable,
  LowStockTable,
  PurchaseSummaryTable,
  RevenueSummaryTable,
  SalesByChannelTable,
  StoreStockTable,
  TrialBalanceTable,
} from "./report-tables";

const TABS = [
  "Sales by Channel",
  "Low Stock",
  "Revenue Summary",
  "Balance Sheet",
  "Trial Balance",
  "Inventory Value",
  "Debtors",
  "Creditors",
  "Purchase Summary",
  "Store Stock",
] as const;

export const AdminReportsClient = () => {
  const [tab, setTab] = useState(0);
  const [inventoryOutletId, setInventoryOutletId] = useState<number | "">("");
  const [storeStockOutletId, setStoreStockOutletId] = useState<number | "">("");

  const { data: outlets = [] } = useQuery({
    queryKey: ["admin-outlets-picker"],
    queryFn: () => outletService.list(),
  });

  const salesByChannel = useQuery({
    queryKey: ["report-sales-by-channel"],
    queryFn: reportService.salesByChannel,
    enabled: tab === 0,
  });

  const lowStock = useQuery({
    queryKey: ["report-low-stock"],
    queryFn: reportService.lowStock,
    enabled: tab === 1,
  });

  const revenueSummary = useQuery({
    queryKey: ["report-revenue-summary"],
    queryFn: reportService.revenueSummary,
    enabled: tab === 2,
  });

  const balanceSheet = useQuery({
    queryKey: ["report-balance-sheet"],
    queryFn: reportService.balanceSheet,
    enabled: tab === 3,
  });

  const trialBalance = useQuery({
    queryKey: ["report-trial-balance"],
    queryFn: reportService.trialBalance,
    enabled: tab === 4,
  });

  const inventoryValue = useQuery({
    queryKey: ["report-inventory-value", inventoryOutletId],
    queryFn: () =>
      reportService.inventoryValue(
        inventoryOutletId === "" ? undefined : inventoryOutletId,
      ),
    enabled: tab === 5,
  });

  const debtors = useQuery({
    queryKey: ["report-debtors"],
    queryFn: reportService.debtors,
    enabled: tab === 6,
  });

  const creditors = useQuery({
    queryKey: ["report-creditors"],
    queryFn: reportService.creditors,
    enabled: tab === 7,
  });

  const purchaseSummary = useQuery({
    queryKey: ["report-purchase-summary"],
    queryFn: reportService.purchaseSummary,
    enabled: tab === 8,
  });

  const storeStock = useQuery({
    queryKey: ["report-store-stock", storeStockOutletId],
    queryFn: () => reportService.storeStock(storeStockOutletId as number),
    enabled: tab === 9 && storeStockOutletId !== "",
  });

  return (
    <Stack spacing={3.2}>
      <Stack spacing={0.3}>
        <Typography sx={{ fontSize: { xs: "2rem", md: "2.2rem" } }}>
          Reports
        </Typography>
        <Typography color="text.secondary">
          Operational and financial reports across the business.
        </Typography>
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {TABS.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      <Box>
        {tab === 0 ? (
          salesByChannel.isLoading ? (
            <Typography color="text.secondary">Loading...</Typography>
          ) : (
            <SalesByChannelTable data={salesByChannel.data ?? {}} />
          )
        ) : null}

        {tab === 1 ? (
          lowStock.isLoading ? (
            <Typography color="text.secondary">Loading...</Typography>
          ) : (
            <LowStockTable rows={lowStock.data ?? []} />
          )
        ) : null}

        {tab === 2 ? (
          revenueSummary.isLoading ? (
            <Typography color="text.secondary">Loading...</Typography>
          ) : (
            <RevenueSummaryTable summary={revenueSummary.data} />
          )
        ) : null}

        {tab === 3 ? (
          balanceSheet.isLoading ? (
            <Typography color="text.secondary">Loading...</Typography>
          ) : (
            <BalanceSheetTable balanceSheet={balanceSheet.data} />
          )
        ) : null}

        {tab === 4 ? (
          trialBalance.isLoading ? (
            <Typography color="text.secondary">Loading...</Typography>
          ) : (
            <TrialBalanceTable rows={trialBalance.data ?? []} />
          )
        ) : null}

        {tab === 5 ? (
          <Stack spacing={2}>
            <TextField
              select
              label="Outlet (optional)"
              value={inventoryOutletId}
              onChange={(event) =>
                setInventoryOutletId(
                  event.target.value === "" ? "" : Number(event.target.value),
                )
              }
              sx={{ maxWidth: 280 }}
            >
              <MenuItem value="">All Outlets</MenuItem>
              {outlets.map((outlet) => (
                <MenuItem key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </MenuItem>
              ))}
            </TextField>
            {inventoryValue.isLoading ? (
              <Typography color="text.secondary">Loading...</Typography>
            ) : (
              <InventoryValueTable report={inventoryValue.data} />
            )}
          </Stack>
        ) : null}

        {tab === 6 ? (
          debtors.isLoading ? (
            <Typography color="text.secondary">Loading...</Typography>
          ) : (
            <DebtorsTable rows={debtors.data ?? []} />
          )
        ) : null}

        {tab === 7 ? (
          creditors.isLoading ? (
            <Typography color="text.secondary">Loading...</Typography>
          ) : (
            <CreditorsTable rows={creditors.data ?? []} />
          )
        ) : null}

        {tab === 8 ? (
          purchaseSummary.isLoading ? (
            <Typography color="text.secondary">Loading...</Typography>
          ) : (
            <PurchaseSummaryTable summary={purchaseSummary.data} />
          )
        ) : null}

        {tab === 9 ? (
          <Stack spacing={2}>
            <TextField
              select
              label="Outlet"
              value={storeStockOutletId}
              onChange={(event) =>
                setStoreStockOutletId(
                  event.target.value === "" ? "" : Number(event.target.value),
                )
              }
              sx={{ maxWidth: 280 }}
            >
              {outlets.map((outlet) => (
                <MenuItem key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </MenuItem>
              ))}
            </TextField>
            {storeStockOutletId === "" ? (
              <Typography color="text.secondary">
                Select an outlet to view its stock.
              </Typography>
            ) : storeStock.isLoading ? (
              <Typography color="text.secondary">Loading...</Typography>
            ) : (
              <StoreStockTable rows={storeStock.data ?? []} />
            )}
          </Stack>
        ) : null}
      </Box>
    </Stack>
  );
};
