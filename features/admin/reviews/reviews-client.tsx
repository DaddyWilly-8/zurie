"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Chip,
  Pagination,
  Paper,
  Rating,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import { AdminFeedbackSnackbar } from "@/components/admin";
import { ApiError } from "@/services/api/client";
import { reviewActions } from "./review-actions";
import type { ProductReview, ReviewStatus } from "./types";

const STATUS_COLOR: Record<ReviewStatus, "warning" | "success" | "default"> = {
  pending: "warning",
  approved: "success",
  rejected: "default",
};

export const AdminReviewsClient = () => {
  const [status, setStatus] = useState<ReviewStatus | "">("pending");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-reviews", status, page],
    queryFn: () => reviewActions.list(page, status),
  });
  const reviews = data?.data ?? [];
  const pageCount = Math.max(
    1,
    Math.ceil((data?.count ?? 0) / reviewActions.pageSize),
  );

  const moderate = async (review: ProductReview, next: ReviewStatus) => {
    try {
      await reviewActions.setStatus(review.id, next);
      setMessage(
        next === "approved"
          ? "Review approved — now visible on the product page"
          : "Review rejected",
      );
      setMessageType("success");
      await refetch();
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.message : "Failed to update review",
      );
      setMessageType("error");
    }
  };

  return (
    <Stack spacing={3.2}>
      <AdminFeedbackSnackbar
        open={Boolean(message)}
        message={message}
        severity={messageType}
        onClose={() => setMessage("")}
      />
      <Stack spacing={0.3}>
        <Typography sx={{ fontSize: { xs: "2rem", md: "2.2rem" } }}>
          Reviews
        </Typography>
        <Typography color="text.secondary">
          Customer reviews appear on product pages only after approval.
        </Typography>
      </Stack>

      <Tabs
        value={status}
        onChange={(_, value: ReviewStatus | "") => {
          setStatus(value);
          setPage(1);
        }}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab value="pending" label="Pending" />
        <Tab value="approved" label="Approved" />
        <Tab value="rejected" label="Rejected" />
        <Tab value="" label="All" />
      </Tabs>

      {isLoading ? (
        <Typography color="text.secondary">Loading reviews...</Typography>
      ) : isError ? (
        <Typography color="error.main">Failed to load reviews.</Typography>
      ) : reviews.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography color="text.secondary">No reviews here.</Typography>
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
                  <TableCell>Product</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Comment</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id} hover>
                    <TableCell>
                      {review.productName ?? `#${review.productId}`}
                    </TableCell>
                    <TableCell>
                      {review.customerName ?? `#${review.customerId}`}
                    </TableCell>
                    <TableCell>
                      <Rating value={review.rating} readOnly size="small" />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 320 }}>
                      {review.comment ?? "—"}
                    </TableCell>
                    <TableCell>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={review.status}
                        color={STATUS_COLOR[review.status]}
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        {review.status !== "approved" ? (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => moderate(review, "approved")}
                          >
                            Approve
                          </Button>
                        ) : null}
                        {review.status !== "rejected" ? (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => moderate(review, "rejected")}
                          >
                            Reject
                          </Button>
                        ) : null}
                      </Stack>
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
