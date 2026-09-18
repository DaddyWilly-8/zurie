"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { AdminFeedbackSnackbar } from "@/components/admin";
import { ApiError } from "@/services/api/client";
import { chartOfAccountsActions } from "./chart-of-accounts-actions";
import { ChartOfAccountsTree } from "./chart-of-accounts-tree";
import { LedgerGroupFormDialog } from "./ledger-group-form-dialog";
import { LedgerFormDialog } from "./ledger-form-dialog";
import { emptyLedgerForm, emptyLedgerGroupForm } from "./types";
import type { Ledger, LedgerForm, LedgerGroup, LedgerGroupForm } from "./types";

const QUERY_KEY = ["admin-chart-of-accounts"];

export const AdminChartOfAccountsClient = () => {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );

  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [groupSaving, setGroupSaving] = useState(false);
  const [editingGroup, setEditingGroup] = useState<LedgerGroup | null>(null);
  const [groupForm, setGroupForm] =
    useState<LedgerGroupForm>(emptyLedgerGroupForm);

  const [ledgerDialogOpen, setLedgerDialogOpen] = useState(false);
  const [ledgerSaving, setLedgerSaving] = useState(false);
  const [editingLedger, setEditingLedger] = useState<Ledger | null>(null);
  const [ledgerForm, setLedgerForm] = useState<LedgerForm>(emptyLedgerForm);

  const {
    data: groups = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: chartOfAccountsActions.list,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const openNewGroup = (parentId?: number) => {
    setEditingGroup(null);
    setGroupForm({ ...emptyLedgerGroupForm, parentId: parentId ?? "" });
    setGroupDialogOpen(true);
  };

  const openEditGroup = (group: LedgerGroup) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      code: group.code,
      nature: group.nature as LedgerGroupForm["nature"],
      parentId: "",
    });
    setGroupDialogOpen(true);
  };

  const openNewLedger = (groupId: number) => {
    setEditingLedger(null);
    setLedgerForm({ ...emptyLedgerForm, ledgerGroupId: groupId });
    setLedgerDialogOpen(true);
  };

  const openEditLedger = (ledger: Ledger, groupId: number) => {
    setEditingLedger(ledger);
    setLedgerForm({
      ledgerGroupId: groupId,
      name: ledger.name,
      code: ledger.code,
      openingBalance: ledger.openingBalance,
      isContra: false,
    });
    setLedgerDialogOpen(true);
  };

  const handleSaveGroup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGroupSaving(true);
    try {
      if (editingGroup) {
        await chartOfAccountsActions.updateLedgerGroup(
          editingGroup.id,
          groupForm,
        );
        setMessage("Ledger group updated successfully");
      } else {
        await chartOfAccountsActions.createLedgerGroup(groupForm);
        setMessage("Ledger group created successfully");
      }
      setMessageType("success");
      setGroupDialogOpen(false);
      setGroupForm(emptyLedgerGroupForm);
      await invalidate();
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : `Failed to ${editingGroup ? "update" : "create"} ledger group`,
      );
      setMessageType("error");
    } finally {
      setGroupSaving(false);
    }
  };

  const handleSaveLedger = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLedgerSaving(true);
    try {
      if (editingLedger) {
        await chartOfAccountsActions.updateLedger(editingLedger.id, ledgerForm);
        setMessage("Ledger updated successfully");
      } else {
        await chartOfAccountsActions.createLedger(ledgerForm);
        setMessage("Ledger created successfully");
      }
      setMessageType("success");
      setLedgerDialogOpen(false);
      setLedgerForm(emptyLedgerForm);
      await invalidate();
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : `Failed to ${editingLedger ? "update" : "create"} ledger`,
      );
      setMessageType("error");
    } finally {
      setLedgerSaving(false);
    }
  };

  const handleDeleteGroup = async (group: LedgerGroup) => {
    if (!confirm(`Delete ledger group "${group.name}"? This cannot be undone.`))
      return;
    try {
      await chartOfAccountsActions.deleteLedgerGroup(group.id);
      setMessage("Ledger group deleted");
      setMessageType("success");
      await invalidate();
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : "Failed to delete ledger group",
      );
      setMessageType("error");
    }
  };

  const handleDeleteLedger = async (ledger: Ledger) => {
    if (!confirm(`Delete ledger "${ledger.name}"? This cannot be undone.`))
      return;
    try {
      await chartOfAccountsActions.deleteLedger(ledger.id);
      setMessage("Ledger deleted");
      setMessageType("success");
      await invalidate();
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.message : "Failed to delete ledger",
      );
      setMessageType("error");
    }
  };

  return (
    <Stack spacing={3.2}>
      <AdminFeedbackSnackbar
        open={Boolean(message)}
        message={message}
        severity={messageType}
        onClose={() => setMessage("")}
      />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack spacing={0.3}>
          <Typography sx={{ fontSize: { xs: "2rem", md: "2.2rem" } }}>
            Chart of Accounts
          </Typography>
          <Typography color="text.secondary">
            {isLoading ? "Loading..." : `${groups.length} top-level groups`}
          </Typography>
        </Stack>
        <Tooltip title="Add Ledger Group" arrow>
          <IconButton
            onClick={() => openNewGroup()}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {isLoading ? (
        <Typography color="text.secondary">
          Loading chart of accounts...
        </Typography>
      ) : isError ? (
        <Typography color="error.main">
          Failed to load chart of accounts.
        </Typography>
      ) : groups.length === 0 ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography color="text.secondary">No ledger groups yet.</Typography>
        </Box>
      ) : (
        <ChartOfAccountsTree
          groups={groups}
          onAddSubGroup={openNewGroup}
          onAddLedger={openNewLedger}
          onEditGroup={openEditGroup}
          onDeleteGroup={handleDeleteGroup}
          onEditLedger={openEditLedger}
          onDeleteLedger={handleDeleteLedger}
        />
      )}

      <LedgerGroupFormDialog
        open={groupDialogOpen}
        saving={groupSaving}
        editing={Boolean(editingGroup)}
        editingId={editingGroup?.id}
        form={groupForm}
        groups={groups}
        onClose={() => setGroupDialogOpen(false)}
        onChange={(key, value) =>
          setGroupForm((prev) => ({ ...prev, [key]: value }))
        }
        onSubmit={handleSaveGroup}
      />

      <LedgerFormDialog
        open={ledgerDialogOpen}
        saving={ledgerSaving}
        editing={Boolean(editingLedger)}
        editingLedger={editingLedger}
        form={ledgerForm}
        groups={groups}
        onClose={() => setLedgerDialogOpen(false)}
        onChange={(key, value) =>
          setLedgerForm((prev) => ({ ...prev, [key]: value }))
        }
        onSubmit={handleSaveLedger}
      />
    </Stack>
  );
};
