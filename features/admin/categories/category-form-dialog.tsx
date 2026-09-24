"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { AdminField, AdminToggle } from "@/components/admin/admin-field";
import { QuickAddLedgerDialog } from "@/components/admin/quick-add-ledger-dialog";
import {
  financeService,
  flattenLedgers,
} from "@/services/finance/finance.service";
import type { CategoryForm } from "./types";

type CategoryFormDialogProps = {
  open: boolean;
  saving: boolean;
  editing: boolean;
  form: CategoryForm;
  onClose: () => void;
  onChange: <K extends keyof CategoryForm>(
    key: K,
    value: CategoryForm[K],
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const CategoryFormDialog = ({
  open,
  saving,
  editing,
  form,
  onClose,
  onChange,
  onSubmit,
}: CategoryFormDialogProps) => {
  const [quickAddNature, setQuickAddNature] = useState<
    "income" | "expense" | null
  >(null);
  const queryClient = useQueryClient();

  const { data: chartOfAccounts = [] } = useQuery({
    queryKey: ["finance-chart-of-accounts"],
    queryFn: financeService.chartOfAccounts,
    enabled: open,
  });

  const ledgers = useMemo(
    () => flattenLedgers(chartOfAccounts),
    [chartOfAccounts],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 0.5,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          width: "min(860px, calc(100vw - 32px))",
          maxHeight: "calc(100vh - 32px)",
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          justifyContent: "space-between",
          px: { xs: 2.5, md: 3.5 },
          pt: { xs: 2.5, md: 3 },
          pb: 1,
        }}
      >
        <Typography
          variant="h4"
          component="div"
          textAlign={"center"}
          sx={{
            color: "text.primary",
            fontFamily: "var(--font-playfair), serif",
            lineHeight: 1,
          }}
        >
          {editing ? "Edit Category" : "New Category"}
        </Typography>
      </DialogTitle>

      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{ display: "flex", flexDirection: "column" }}
      >
        <DialogContent
          dividers
          sx={{
            bgcolor: "background.paper",
            pt: 2,
            overflowY: "auto",
            "& .MuiInputLabel-root": {
              textTransform: "uppercase",
              letterSpacing: "0.24em",
              fontSize: "0.72rem",
              color: "text.secondary",
            },
            "& .MuiOutlinedInput-root": {
              bgcolor: "background.paper",
              borderRadius: 0,
            },
          }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdminField
                label="Name"
                value={form.name}
                onChange={(value) => onChange("name", value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdminField
                label="Slug"
                value={form.slug}
                onChange={(value) => onChange("slug", value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <AdminField
                label="Description"
                value={form.description}
                onChange={(value) => onChange("description", value)}
                multiline
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", pl: 1.5 }}
              >
                Category image is managed from the category list after
                create/update.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdminField
                label="Display Order"
                type="number"
                value={form.sortOrder}
                onChange={(value) => onChange("sortOrder", Number(value) || 0)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack
                direction="row"
                alignItems="center"
                sx={{ height: "100%" }}
              >
                <AdminToggle
                  label="Visible"
                  checked={form.visible}
                  onChange={(checked) => onChange("visible", checked)}
                />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <TextField
                  select
                  fullWidth
                  label="Income Ledger"
                  value={form.incomeLedgerId}
                  onChange={(event) =>
                    onChange(
                      "incomeLedgerId",
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value),
                    )
                  }
                  helperText="Falls back to the global Sales ledger when left blank."
                >
                  <MenuItem value="">Default (global Sales ledger)</MenuItem>
                  {ledgers
                    .filter((ledger) => ledger.groupName)
                    .map((ledger) => (
                      <MenuItem key={ledger.id} value={ledger.id}>
                        {ledger.groupName} — {ledger.name}
                      </MenuItem>
                    ))}
                </TextField>
                <IconButton
                  onClick={() => setQuickAddNature("income")}
                  aria-label="New Income Ledger"
                  sx={{ mt: 1, border: "1px solid", borderColor: "divider" }}
                >
                  <FontAwesomeIcon icon={faPlus} size="xs" />
                </IconButton>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <TextField
                  select
                  fullWidth
                  label="Expense Ledger"
                  value={form.expenseLedgerId}
                  onChange={(event) =>
                    onChange(
                      "expenseLedgerId",
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value),
                    )
                  }
                  helperText="Falls back to the global COGS ledger when left blank."
                >
                  <MenuItem value="">Default (global COGS ledger)</MenuItem>
                  {ledgers
                    .filter((ledger) => ledger.groupName)
                    .map((ledger) => (
                      <MenuItem key={ledger.id} value={ledger.id}>
                        {ledger.groupName} — {ledger.name}
                      </MenuItem>
                    ))}
                </TextField>
                <IconButton
                  onClick={() => setQuickAddNature("expense")}
                  aria-label="New Expense Ledger"
                  sx={{ mt: 1, border: "1px solid", borderColor: "divider" }}
                >
                  <FontAwesomeIcon icon={faPlus} size="xs" />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            bgcolor: "background.paper",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: 0,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              fontSize: "0.72rem",
              borderColor: "divider",
              color: "text.primary",
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{
              borderRadius: 0,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              fontSize: "0.72rem",
              bgcolor: "text.primary",
              px: 4,
              "&:hover": { bgcolor: "text.secondary" },
            }}
          >
            {saving
              ? "Saving..."
              : editing
                ? "Save Changes"
                : "Create Category"}
          </Button>
        </DialogActions>
      </Box>

      <QuickAddLedgerDialog
        open={quickAddNature !== null}
        nature={quickAddNature ?? "income"}
        onClose={() => setQuickAddNature(null)}
        onCreated={(ledgerId) => {
          onChange(
            quickAddNature === "expense" ? "expenseLedgerId" : "incomeLedgerId",
            ledgerId,
          );
          queryClient.invalidateQueries({
            queryKey: ["finance-chart-of-accounts"],
          });
        }}
      />
    </Dialog>
  );
};
