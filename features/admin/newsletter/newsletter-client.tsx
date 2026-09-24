"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { AdminFeedbackSnackbar } from "@/components/admin";
import { newsletterActions } from "./newsletter-actions";

export const AdminNewsletterClient = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-newsletter", page, search],
    queryFn: () => newsletterActions.list(page, search),
  });
  const subscribers = data?.data ?? [];
  const pageCount = Math.max(
    1,
    Math.ceil((data?.count ?? 0) / newsletterActions.pageSize),
  );

  const copyEmails = async () => {
    await navigator.clipboard.writeText(
      subscribers.map((s) => s.email).join(", "),
    );
    setMessage(`Copied ${subscribers.length} email addresses`);
  };

  return (
    <Stack spacing={3.2}>
      <AdminFeedbackSnackbar
        open={Boolean(message)}
        message={message}
        severity="success"
        onClose={() => setMessage("")}
      />
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <Stack spacing={0.3}>
          <Typography sx={{ fontSize: { xs: "2rem", md: "2.2rem" } }}>
            Newsletter
          </Typography>
          <Typography color="text.secondary">
            {isLoading ? "Loading..." : `${data?.count ?? 0} subscribers`} from
            the storefront footer
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <TextField
            size="small"
            placeholder="Search email"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <Button
            variant="outlined"
            disabled={subscribers.length === 0}
            onClick={copyEmails}
          >
            Copy emails
          </Button>
        </Stack>
      </Stack>

      {isLoading ? (
        <Typography color="text.secondary">Loading subscribers...</Typography>
      ) : isError ? (
        <Typography color="error.main">Failed to load subscribers.</Typography>
      ) : subscribers.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography color="text.secondary">No subscribers yet.</Typography>
        </Box>
      ) : (
        <>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 0 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Subscribed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id} hover>
                    <TableCell>{subscriber.email}</TableCell>
                    <TableCell>
                      {new Date(subscriber.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {pageCount > 1 ? (
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_, value) => setPage(value)}
            />
          ) : null}
        </>
      )}
    </Stack>
  );
};
