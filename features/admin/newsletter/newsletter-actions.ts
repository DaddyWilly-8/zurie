import { newsletterService } from "@/services/notifications/newsletter.service";

export const newsletterActions = {
  pageSize: 50,

  list(page: number, search: string) {
    return newsletterService.listSubscribers({
      page,
      pageSize: this.pageSize,
      search: search.trim() || undefined,
    });
  },
};
