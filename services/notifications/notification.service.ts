import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

/** Shape of Notification\Resources\NotificationResource on the backend. */
export type AppNotification = {
  id: number;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type NotificationPage = {
  data: AppNotification[];
  count: number;
  unread: number;
};

type ListResponse = {
  data?: AppNotification[];
  meta?: { count?: number; unread?: number };
};

const toPage = (response: ListResponse): NotificationPage => ({
  data: response.data ?? [],
  count: response.meta?.count ?? 0,
  unread: response.meta?.unread ?? 0,
});

/**
 * Two audiences, same shape: `customer` (storefront account, the
 * 'customer' guard) and `staff` (admin panel). Each only ever sees the
 * signed-in user's own notifications.
 */
const endpointsFor = (audience: "customer" | "staff") =>
  audience === "customer"
    ? {
        list: API_ENDPOINTS.account.notifications,
        readAll: API_ENDPOINTS.account.notificationsReadAll,
        read: API_ENDPOINTS.account.notificationRead,
      }
    : {
        list: API_ENDPOINTS.adminNotifications.list,
        readAll: API_ENDPOINTS.adminNotifications.readAll,
        read: API_ENDPOINTS.adminNotifications.read,
      };

export const notificationService = {
  list(audience: "customer" | "staff", params = { page: 1, pageSize: 20 }) {
    return apiClient
      .get<ListResponse>(endpointsFor(audience).list, { query: params })
      .then(toPage);
  },

  markRead(audience: "customer" | "staff", id: number) {
    return apiClient.patch<{ data: AppNotification }>(
      endpointsFor(audience).read(id),
    );
  },

  markAllRead(audience: "customer" | "staff") {
    return apiClient.post<{ data: { updated: number } }>(
      endpointsFor(audience).readAll,
    );
  },
};
