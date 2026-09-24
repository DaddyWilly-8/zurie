"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
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
import { AdminFeedbackSnackbar, AdminField } from "@/components/admin";
import { ApiError } from "@/services/api/client";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { formatBaseCurrencyInCurrency } from "@/utils/currency";
import { currentPeriod, targetActions } from "./target-actions";

export const AdminTargetsClient = () => {
  const { currency, rates } = useCurrencyStore();
  const [period, setPeriod] = useState(currentPeriod());
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );

  const { data: targets = [], refetch: refetchTargets } = useQuery({
    queryKey: ["admin-targets"],
    queryFn: targetActions.list,
  });
  const { data: achievement, refetch: refetchAchievement } = useQuery({
    queryKey: ["admin-target-achievement", period],
    queryFn: () => targetActions.achievement(period),
    enabled: /^\d{4}-\d{2}$/.test(period),
  });

  const money = (value: number) =>
    formatBaseCurrencyInCurrency(value, currency, rates);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!(Number(amount) > 0)) {
      setMessage("Enter a target greater than zero.");
      setMessageType("error");
      return;
    }
    setSaving(true);
    try {
      await targetActions.save(period, amount, currency, rates);
      setMessage(`Target for ${period} saved`);
      setMessageType("success");
      setAmount("");
      await Promise.all([refetchTargets(), refetchAchievement()]);
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.message : "Failed to save target",
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const percentage = achievement?.achievementPercentage ?? null;

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
          Sales Targets
        </Typography>
        <Typography color="text.secondary">
          A monthly revenue goal, tracked against actual sales (cancelled orders
          excluded).
        </Typography>
      </Stack>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ borderRadius: 0 }}>
            <CardContent component="form" onSubmit={save}>
              <Stack spacing={2}>
                <Typography fontWeight={600}>Set a monthly target</Typography>
                <TextField
                  type="month"
                  size="small"
                  label="Month"
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <AdminField
                  label={`Target (${currency})`}
                  type="number"
                  value={amount}
                  onChange={setAmount}
                  required
                />
                <Button type="submit" variant="contained" disabled={saving}>
                  {saving ? "Saving..." : "Save Target"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined" sx={{ borderRadius: 0, height: "100%" }}>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography fontWeight={600}>Progress for {period}</Typography>
                {achievement?.targetAmount == null ? (
                  <Typography color="text.secondary">
                    No target set for this month. Sales so far:{" "}
                    {money(achievement?.currentAmount ?? 0)}
                  </Typography>
                ) : (
                  <>
                    <Typography variant="h5">
                      {money(achievement.currentAmount)}{" "}
                      <Typography component="span" color="text.secondary">
                        of {money(achievement.targetAmount)}
                      </Typography>
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, percentage ?? 0)}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Typography color="text.secondary">
                      {percentage ?? 0}% achieved ·{" "}
                      {money(achievement.remainingAmount ?? 0)} to go
                    </Typography>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {targets.length > 0 ? (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 0 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell align="right">Target</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {targets.map((target) => (
                <TableRow
                  key={target.id}
                  hover
                  selected={target.period === period}
                  onClick={() => setPeriod(target.period)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{target.period}</TableCell>
                  <TableCell align="right">
                    {money(target.targetAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography color="text.secondary">No targets set yet.</Typography>
        </Box>
      )}
    </Stack>
  );
};
