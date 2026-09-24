"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { notificationService } from "@/services/notifications/notification.service";

const QUERY_KEY = ["account-notifications"];

/** The signed-in customer's notifications (order status changes, etc.). */
export const AccountNotifications = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () =>
      notificationService.list("customer", { page: 1, pageSize: 20 }),
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

  const items = data?.data ?? [];
  const unread = data?.unread ?? 0;

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6">Notifications</Typography>
          {unread > 0 ? (
            <Chip size="small" color="primary" label={`${unread} new`} />
          ) : null}
        </Stack>
        <Button
          size="small"
          disabled={unread === 0 || markAllRead.isPending}
          onClick={() => markAllRead.mutate()}
        >
          Mark all read
        </Button>
      </Stack>
      {isLoading ? (
        <CircularProgress size={24} />
      ) : items.length === 0 ? (
        <Alert severity="info">
          No notifications yet. We&apos;ll let you know when your orders move.
        </Alert>
      ) : (
        <Stack divider={<Divider />} spacing={1.5}>
          {items.map((notification) => (
            <Box
              key={notification.id}
              onClick={() => {
                if (!notification.read) markRead.mutate(notification.id);
              }}
              sx={{ cursor: notification.read ? "default" : "pointer" }}
            >
              <Typography fontWeight={notification.read ? 400 : 600}>
                {notification.message}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(notification.createdAt).toLocaleString()}
                {notification.read ? "" : " · tap to mark read"}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
};
