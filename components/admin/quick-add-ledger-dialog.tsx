"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import {
  financeService,
  type LedgerGroup,
  type LedgerGroupNature,
} from "@/services/finance/finance.service";

type Props = {
  open: boolean;
  nature: LedgerGroupNature;
  onClose: () => void;
  onCreated: (ledgerId: number) => void;
};

const flattenGroups = (groups: LedgerGroup[]): LedgerGroup[] => {
  const result: LedgerGroup[] = [];
  const walk = (group: LedgerGroup) => {
    result.push(group);
    for (const child of group.children ?? []) walk(child);
  };
  for (const group of groups) walk(group);
  return result;
};

const suggestCode = (name: string) =>
  name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) +
  "-" +
  Math.floor(Math.random() * 900 + 100);

/**
 * Reused by any form that needs to spawn a ledger without leaving its own
 * dialog (Category's Income/Expense ledger fields today). Only lets the
 * user pick among existing ledger groups of the required nature — a group
 * mismatched to `nature` would make the new ledger unusable for its
 * purpose, so group creation itself stays out of scope here.
 */
export const QuickAddLedgerDialog = ({
  open,
  nature,
  onClose,
  onCreated,
}: Props) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [ledgerGroupId, setLedgerGroupId] = useState<number | "">("");
  const [codeTouched, setCodeTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { data: groups = [] } = useQuery({
    queryKey: ["finance-chart-of-accounts"],
    queryFn: financeService.chartOfAccounts,
    enabled: open,
  });

  const natureGroups = useMemo(
    () => flattenGroups(groups).filter((group) => group.nature === nature),
    [groups, nature],
  );

  useEffect(() => {
    if (!open) {
      setName("");
      setCode("");
      setLedgerGroupId("");
      setCodeTouched(false);
      setError("");
    }
  }, [open]);

  useEffect(() => {
    if (!codeTouched && name) {
      setCode(suggestCode(name));
    }
  }, [name, codeTouched]);

  useEffect(() => {
    if (natureGroups.length === 1 && ledgerGroupId === "") {
      setLedgerGroupId(natureGroups[0].id);
    }
  }, [natureGroups, ledgerGroupId]);

  const handleSubmit = async () => {
    if (!name.trim() || !code.trim() || ledgerGroupId === "") {
      setError("Name, code, and ledger group are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const response = await financeService.createLedger({
        ledgerGroupId,
        name: name.trim(),
        code: code.trim(),
      });
      onCreated(response.data.id);
      onClose();
    } catch {
      setError("Failed to create ledger. The code may already be in use.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        New {nature === "income" ? "Income" : "Expense"} Ledger
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
            fullWidth
          />
          <TextField
            label="Code"
            value={code}
            onChange={(event) => {
              setCodeTouched(true);
              setCode(event.target.value);
            }}
            fullWidth
          />
          <TextField
            select
            label="Ledger Group"
            value={ledgerGroupId}
            onChange={(event) =>
              setLedgerGroupId(
                event.target.value === "" ? "" : Number(event.target.value),
              )
            }
            fullWidth
          >
            {natureGroups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving}>
          {saving ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
