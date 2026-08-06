"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Card, CardContent, Pagination, Stack, Typography } from "@mui/material";
import { AdminFeedbackSnackbar } from "@/components/admin";
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
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  const {
    data: payload = { data: initialData, count: initialCount },
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-enquiries", page, search, status],
    queryFn: () => enquiryActions.list(page, search, status),
    initialData: { data: initialData, count: initialCount },
  });

  const rows = payload.data;
  const count = payload.count;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / enquiryActions.pageSize)), [count]);

  const updateStatus = async (id: string, nextStatus: string) => {
    try {
      await enquiryActions.updateStatus(id, nextStatus);
      setMessage("Enquiry updated successfully");
      setMessageType("success");
      await refetch();
    } catch {
      setMessage("Failed to update enquiry");
      setMessageType("error");
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  return (
    <Stack spacing={3}>
      <AdminFeedbackSnackbar
        open={Boolean(message)}
        message={message}
        severity={messageType}
        onClose={() => setMessage("")}
      />

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
            onApply={() => setPage(1)}
          />

          {isError ? (
            <Typography color="error.main" sx={{ py: 2 }}>
              Failed to load enquiries.
            </Typography>
          ) : isLoading ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              Loading enquiries...
            </Typography>
          ) : (
            <EnquiriesTable rows={rows} onStatusChange={updateStatus} />
          )}

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};
