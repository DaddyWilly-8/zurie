"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { activityService } from "@/services/activity/activity.service";

type ActivityLogRow = {
  id: string;
  user_id: string | null;
  action: string;
  resource: string;
  created_at: string;
};

export const AdminActivityClient = () => {
  const [entries, setEntries] = useState<ActivityLogRow[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const payload = await activityService.listActivity(1, 20);
        if (active) {
          setEntries((payload.data ?? []) as ActivityLogRow[]);
        }
      } catch {
        if (active) {
          setEntries([]);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Card sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none", bgcolor: "background.paper" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="overline" sx={{ letterSpacing: "0.24em", color: "primary.main" }}>
            Activity
          </Typography>
          <Typography variant="h6" sx={{ color: "text.primary" }}>
            Admin Activity Logs
          </Typography>
        </Stack>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Resource</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>When</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.user_id ?? "System"}</TableCell>
                <TableCell>{entry.action}</TableCell>
                <TableCell>{entry.resource}</TableCell>
                <TableCell>{new Date(entry.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography color="text.secondary" sx={{ py: 2 }}>No activity yet.</Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
