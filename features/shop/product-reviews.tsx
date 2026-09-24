"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Divider,
  Rating,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ApiError } from "@/services/api/client";
import { reviewService } from "@/services/reviews/review.service";
import { useOptionalCustomerAuth } from "@/providers/customer-auth-provider";

type Props = {
  productId: string;
  productSlug: string;
};

/**
 * Approved reviews for one product, plus a form for signed-in customers.
 * New reviews are moderated (Admin > Reviews) before they appear here.
 */
export const ProductReviews = ({ productId, productSlug }: Props) => {
  const auth = useOptionalCustomerAuth();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const { data: reviews = [] } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: () => reviewService.listForProduct(productId),
  });

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rating) {
      setError("Please choose a star rating.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await reviewService.submit({
        productId: Number(productId),
        rating,
        comment: comment.trim() || undefined,
      });
      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : "Could not submit your review. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="section" aria-labelledby="reviews-heading">
      <Stack spacing={2.5}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          flexWrap="wrap"
        >
          <Typography
            id="reviews-heading"
            variant="h5"
            sx={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Reviews
          </Typography>
          {reviews.length > 0 ? (
            <>
              <Rating value={average} precision={0.5} readOnly size="small" />
              <Typography color="text.secondary">
                {average.toFixed(1)} · {reviews.length}{" "}
                {reviews.length === 1 ? "review" : "reviews"}
              </Typography>
            </>
          ) : null}
        </Stack>

        {reviews.length === 0 ? (
          <Typography color="text.secondary">
            No reviews yet — be the first to share your thoughts.
          </Typography>
        ) : (
          <Stack divider={<Divider />} spacing={2}>
            {reviews.map((review) => (
              <Box key={review.id}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Rating value={review.rating} readOnly size="small" />
                  <Typography fontWeight={600}>
                    {review.reviewerName ?? "Customer"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Typography>
                </Stack>
                {review.comment ? (
                  <Typography sx={{ mt: 0.5 }}>{review.comment}</Typography>
                ) : null}
              </Box>
            ))}
          </Stack>
        )}

        {submitted ? (
          <Alert severity="success">
            Thank you! Your review will appear here once it&apos;s approved.
          </Alert>
        ) : auth?.isAuthenticated ? (
          <Box component="form" onSubmit={submit}>
            <Stack spacing={1.5} sx={{ maxWidth: 560 }}>
              <Typography fontWeight={600}>Write a review</Typography>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <Rating
                value={rating}
                onChange={(_, value) => setRating(value)}
                aria-label="Your rating"
              />
              <TextField
                label="Your review (optional)"
                multiline
                minRows={3}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                slotProps={{ htmlInput: { maxLength: 2000 } }}
              />
              <Box>
                <Button type="submit" variant="contained" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit review"}
                </Button>
              </Box>
            </Stack>
          </Box>
        ) : (
          <Typography color="text.secondary">
            <Link href={`/login?next=/shop/${productSlug}`}>Sign in</Link> to
            write a review.
          </Typography>
        )}
      </Stack>
    </Box>
  );
};
