"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import {
  notificationService,
  type AppNotification,
} from "@/services/notifications/notification.service";

const QUERY_KEY = ["account-notifications-bell"];

/**
 * Storefront counterpart to components/admin/admin-notifications-bell.tsx
 * — same service, same "customer" audience the account page's own
 * AccountNotifications tab already reads, just surfaced in the header so
 * a signed-in customer doesn't have to visit My Account first to notice
 * an order status changed. Everything (read/unread, mark-read) is the
 * same backend state either surface reads — reading one marks it read in
 * both places.
 */
export const SiteHeaderNotificationsBell = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () =>
      notificationService.list("customer", { page: 1, pageSize: 15 }),
    refetchInterval: 60_000,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const markRead = useMutation({
    mutationFn: (id: number) => notificationService.markRead("customer", id),
    onSuccess: refresh,
  });
  const markAllRead = useMutation({
    mutationFn: () => notificationService.markAllRead("customer"),
    onSuccess: refresh,
  });

  const open = (notification: AppNotification) => {
    if (!notification.read) markRead.mutate(notification.id);
    setAnchor(null);
    router.push("/account");
  };

  const unread = data?.unread ?? 0;
  const items = data?.data ?? [];

  return (
    <>
      <IconButton
        aria-label={`Notifications (${unread} unread)`}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        <Badge badgeContent={unread} color="error" max={99}>
          <FontAwesomeIcon icon={faBell} fontSize={15} />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: { sx: { width: 360, maxWidth: "calc(100vw - 32px)" } },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: 2, py: 1.5 }}
        >
          <Typography fontWeight={700}>Notifications</Typography>
          <Button
            size="small"
            disabled={unread === 0 || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Mark all read
          </Button>
        </Stack>
        <Divider />
        {isLoading ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <CircularProgress size={20} />
          </Box>
        ) : items.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 3, textAlign: "center" }}>
            No notifications yet.
          </Typography>
        ) : (
          <Stack
            divider={<Divider />}
            sx={{ maxHeight: 420, overflowY: "auto" }}
          >
            {items.map((notification) => (
              <Box
                key={notification.id}
                role="button"
                tabIndex={0}
                onClick={() => open(notification)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") open(notification);
                }}
                sx={{
                  px: 2,
                  py: 1.25,
                  cursor: "pointer",
                  bgcolor: notification.read ? "transparent" : "action.hover",
                  "&:hover": { bgcolor: "action.selected" },
                }}
              >
                <Typography
                  fontSize="0.875rem"
                  fontWeight={notification.read ? 400 : 600}
                >
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notification.createdAt).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Popover>
    </>
  );
};
