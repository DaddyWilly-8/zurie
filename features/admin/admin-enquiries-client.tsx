"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Card, CardContent, Pagination, Stack, Typography } from "@mui/material";
import {
  enquiryActions,
  EnquiriesFilters,
  EnquiriesTable,
  type AdminEnquiryRow,
} from "@/features/admin/enquiries";

type Props = {
  initialData: AdminEnquiryRow[];
  initialCount: number;
};

export const AdminEnquiriesClient = ({ initialData, initialCount }: Props) => {
  const [rows, setRows] = useState(initialData);
  const [count, setCount] = useState(initialCount);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / enquiryActions.pageSize)), [count]);

  const load = useCallback(async (nextPage: number, nextSearch = search, nextStatus = status) => {
    try {
      const payload = await enquiryActions.list(nextPage, nextSearch, nextStatus);
      setRows(payload.data);
      setCount(payload.count);
      setPage(nextPage);
    } catch {
      setMessage("Failed to load enquiries");
      setMessageType("error");
    }
  }, [search, status]);

  const updateStatus = async (id: string, nextStatus: string) => {
    try {
      await enquiryActions.updateStatus(id, nextStatus);
      setMessage("Enquiry updated successfully");
      setMessageType("success");
      await load(page);
    } catch {
      setMessage("Failed to update enquiry");
      setMessageType("error");
    }
  };

  useEffect(() => {
    if (initialData.length === 0) {
      void load(1);
    }
  }, [initialData.length, load]);

  return (
    <Stack spacing={3}>
      {message ? (
        <Alert severity={messageType} onClose={() => setMessage("")} sx={{ borderRadius: 1.5 }}>
          {message}
        </Alert>
      ) : null}

      <Card sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none", bgcolor: "background.paper" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={0.5} sx={{ mb: 3 }}>
            <Typography variant="overline" sx={{ letterSpacing: "0.24em", color: "primary.main" }}>
              Enquiries
            </Typography>
            <Typography variant="h6" sx={{ color: "text.primary" }}>
              Customer Enquiries
            </Typography>
          </Stack>

          <EnquiriesFilters
            search={search}
            status={status}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onApply={() => {
              void load(1, search, status);
            }}
          />

          <EnquiriesTable rows={rows} onStatusChange={updateStatus} />

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => {
                void load(value);
              }}
              color="primary"
            />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};
