"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
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
    <Card>
      <CardContent>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Resource</TableCell>
              <TableCell>When</TableCell>
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
                  <Typography color="text.secondary">No activity yet.</Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
