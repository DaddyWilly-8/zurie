"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Grid, Pagination, Paper, Stack, Typography } from "@mui/material";
import { vatService } from "@/services/vat/vat.service";
import { VatTransactionsTable } from "./vat-transactions-table";

const PAGE_SIZE = 20;

const SummaryCard = ({ label, value }: { label: string; value: number }) => (
  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 0 }}>
    <Typography color="text.secondary" variant="body2">
      {label}
    </Typography>
    <Typography sx={{ fontSize: "1.6rem" }}>
      {value.toLocaleString()}
    </Typography>
  </Paper>
);

/** Read-only — see VatService's backend docblock for why there's no create/update/delete here. */
export const AdminVatTransactionsClient = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-vat-transactions", page],
    queryFn: () => vatService.list({ page, pageSize: PAGE_SIZE }),
  });

  const { data: summary } = useQuery({
    queryKey: ["admin-vat-summary"],
    queryFn: () => vatService.summary(),
  });

  const items = data?.data ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.meta.count ?? 0) / PAGE_SIZE),
  );

  return (
    <Stack spacing={3.2}>
      <Stack spacing={0.3}>
        <Typography sx={{ fontSize: { xs: "2rem", md: "2.2rem" } }}>
          VAT Transactions
        </Typography>
        <Typography color="text.secondary">
          {isLoading ? "Loading..." : `${data?.meta.count ?? 0} transactions`}
        </Typography>
      </Stack>

      {summary ? (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <SummaryCard
              label="Output VAT (collected)"
              value={summary.output}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <SummaryCard label="Input VAT (paid)" value={summary.input} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <SummaryCard label="Net Payable" value={summary.net} />
          </Grid>
        </Grid>
      ) : null}

      {isLoading ? (
        <Typography color="text.secondary">Loading transactions...</Typography>
      ) : isError ? (
        <Typography color="error.main">
          Failed to load VAT transactions.
        </Typography>
      ) : items.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography color="text.secondary">
            No VAT transactions yet.
          </Typography>
        </Box>
      ) : (
        <>
          <VatTransactionsTable items={items} />
          {totalPages > 1 ? (
            <Stack direction="row" justifyContent="flex-end">
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Stack>
          ) : null}
        </>
      )}
    </Stack>
  );
};
