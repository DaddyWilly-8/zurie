import {
  reviewService,
  type ReviewStatus,
} from "@/services/reviews/review.service";

export const reviewActions = {
  pageSize: 20,

  list(page: number, status: ReviewStatus | "") {
    return reviewService.listAdmin({
      page,
      pageSize: this.pageSize,
      status: status || undefined,
    });
  },

  setStatus(id: number, status: ReviewStatus) {
    return reviewService.updateStatus(id, status);
  },
};
