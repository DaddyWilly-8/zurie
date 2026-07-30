"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { enquiryService } from "@/services/enquiries/enquiry.service";

export type AdminEnquiryRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
};

type Props = {
  initialData: AdminEnquiryRow[];
  initialCount: number;
};

const PAGE_SIZE = 10;

export const AdminEnquiriesClient = ({ initialData, initialCount }: Props) => {
  const [rows, setRows] = useState(initialData);
  const [count, setCount] = useState(initialCount);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / PAGE_SIZE)), [count]);

  const load = useCallback(async (nextPage: number, nextSearch = search, nextStatus = status) => {
    const payload = await enquiryService.listEnquiries({
      page: nextPage,
      pageSize: PAGE_SIZE,
      search: nextSearch.trim() || undefined,
      status: nextStatus || undefined,
    });

    setRows((payload.data ?? []) as AdminEnquiryRow[]);
    setCount(payload.count ?? 0);
    setPage(nextPage);
  }, [search, status]);

  const updateStatus = async (id: string, nextStatus: string) => {
    try {
      await enquiryService.updateEnquiryStatus(id, nextStatus);
      setMessage("Enquiry updated");
    } catch {
      setMessage("Failed to update enquiry");
    }
    await load(page);
  };

  useEffect(() => {
    if (initialData.length === 0) {
      void load(1);
    }
  }, [initialData.length, load]);

  return (
    <Stack spacing={2}>
      {message ? <Alert severity="info">{message}</Alert> : null}

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField
            label="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            fullWidth
          />
          <TextField
            label="Status"
            select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="read">Read</MenuItem>
            <MenuItem value="responded">Responded</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </TextField>
          <Button variant="contained" onClick={() => load(1, search, status)}>
            Apply
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.phone ?? "-"}</TableCell>
                <TableCell sx={{ maxWidth: 320 }}>{row.message}</TableCell>
                <TableCell>
                  <TextField
                    select
                    size="small"
                    value={row.status}
                    onChange={(event) => updateStatus(row.id, event.target.value)}
                    sx={{ minWidth: 160 }}
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="read">Read</MenuItem>
                    <MenuItem value="responded">Responded</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </TextField>
                </TableCell>
                <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ py: 4, textAlign: "center" }}>
                    <Typography color="text.secondary">No enquiries found.</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Paper>

      <Stack direction="row" justifyContent="flex-end">
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => {
            void load(value);
          }}
          color="primary"
        />
      </Stack>
    </Stack>
  );
};
