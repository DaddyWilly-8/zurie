"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Pagination, Stack, Typography } from "@mui/material";
import { grnActions } from "./grn-actions";
import { GrnsTable } from "./grns-table";

const PAGE_SIZE = 20;

/** Read-only — a GRN is created from the Purchase Orders screen's "Receive" action, never here (see GrnController's docblock). */
export const AdminGrnsClient = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-grns", page],
    queryFn: () => grnActions.list(page, PAGE_SIZE),
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
          Goods Received Notes
        </Typography>
        <Typography color="text.secondary">
          {isLoading ? "Loading..." : `${data?.meta.count ?? 0} GRNs`}
        </Typography>
      </Stack>

      {isLoading ? (
        <Typography color="text.secondary">Loading GRNs...</Typography>
      ) : isError ? (
        <Typography color="error.main">Failed to load GRNs.</Typography>
      ) : items.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography color="text.secondary">
            No goods received yet — receive against a purchase order from the
            Purchase Orders screen.
          </Typography>
        </Box>
      ) : (
        <>
          <GrnsTable items={items} />
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
