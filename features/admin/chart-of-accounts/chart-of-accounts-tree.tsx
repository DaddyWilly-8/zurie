import { useState } from "react";
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  List,
  ListItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
  faFolderPlus,
  faPencil,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import type { Ledger, LedgerGroup } from "./types";

const NATURE_COLORS: Record<
  string,
  "success" | "error" | "info" | "warning" | "default"
> = {
  asset: "info",
  liability: "warning",
  income: "success",
  expense: "error",
  equity: "default",
};

type Props = {
  groups: LedgerGroup[];
  onAddSubGroup: (parentId: number) => void;
  onAddLedger: (groupId: number) => void;
  onEditGroup: (group: LedgerGroup) => void;
  onDeleteGroup: (group: LedgerGroup) => void;
  onEditLedger: (ledger: Ledger, groupId: number) => void;
  onDeleteLedger: (ledger: Ledger) => void;
};

const LedgerRow = ({
  ledger,
  depth,
  groupId,
  onEditLedger,
  onDeleteLedger,
}: {
  ledger: Ledger;
  depth: number;
  groupId: number;
  onEditLedger: (ledger: Ledger, groupId: number) => void;
  onDeleteLedger: (ledger: Ledger) => void;
}) => (
  <ListItem
    sx={{
      pl: 3 + depth * 3,
      borderBottom: "1px solid",
      borderColor: "divider",
    }}
  >
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ width: "100%" }}
    >
      <Stack spacing={0.2}>
        <Typography sx={{ fontSize: "0.9rem" }}>{ledger.name}</Typography>
        <Typography variant="caption" color="text.secondary">
          {ledger.code} · Balance: {ledger.currentBalance.toLocaleString()}
        </Typography>
      </Stack>
      {!ledger.isSystem && (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit Ledger" arrow>
            <IconButton
              size="small"
              onClick={() => onEditLedger(ledger, groupId)}
            >
              <FontAwesomeIcon icon={faPencil} size="xs" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Ledger" arrow>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDeleteLedger(ledger)}
            >
              <FontAwesomeIcon icon={faTrash} size="xs" />
            </IconButton>
          </Tooltip>
        </Stack>
      )}
    </Stack>
  </ListItem>
);

type GroupRowProps = Omit<Props, "groups"> & {
  group: LedgerGroup;
  depth: number;
};

const GroupRow = ({
  group,
  depth,
  onAddSubGroup,
  onAddLedger,
  onEditGroup,
  onDeleteGroup,
  onEditLedger,
  onDeleteLedger,
}: GroupRowProps) => {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren =
    (group.children?.length ?? 0) > 0 || (group.ledgers?.length ?? 0) > 0;

  return (
    <>
      <ListItem
        sx={{
          pl: 1 + depth * 3,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: depth === 0 ? "action.hover" : "transparent",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: "100%" }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              size="small"
              onClick={() => setExpanded((prev) => !prev)}
              disabled={!hasChildren}
            >
              <FontAwesomeIcon
                icon={expanded ? faChevronDown : faChevronRight}
                size="xs"
              />
            </IconButton>
            <Stack spacing={0.2}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.92rem" }}>
                {group.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {group.code}
              </Typography>
            </Stack>
            <Chip
              size="small"
              label={group.nature}
              color={NATURE_COLORS[group.nature] ?? "default"}
              sx={{ textTransform: "capitalize" }}
            />
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Add Sub-Group" arrow>
              <IconButton size="small" onClick={() => onAddSubGroup(group.id)}>
                <FontAwesomeIcon icon={faFolderPlus} size="xs" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add Ledger" arrow>
              <IconButton size="small" onClick={() => onAddLedger(group.id)}>
                <FontAwesomeIcon icon={faPlus} size="xs" />
              </IconButton>
            </Tooltip>
            {!group.isSystem && (
              <>
                <Tooltip title="Edit Group" arrow>
                  <IconButton size="small" onClick={() => onEditGroup(group)}>
                    <FontAwesomeIcon icon={faPencil} size="xs" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Group" arrow>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDeleteGroup(group)}
                  >
                    <FontAwesomeIcon icon={faTrash} size="xs" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        </Stack>
      </ListItem>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <List disablePadding>
          {(group.ledgers ?? []).map((ledger) => (
            <LedgerRow
              key={`ledger-${ledger.id}`}
              ledger={ledger}
              depth={depth + 1}
              groupId={group.id}
              onEditLedger={onEditLedger}
              onDeleteLedger={onDeleteLedger}
            />
          ))}
          {(group.children ?? []).map((child) => (
            <GroupRow
              key={`group-${child.id}`}
              group={child}
              depth={depth + 1}
              onAddSubGroup={onAddSubGroup}
              onAddLedger={onAddLedger}
              onEditGroup={onEditGroup}
              onDeleteGroup={onDeleteGroup}
              onEditLedger={onEditLedger}
              onDeleteLedger={onDeleteLedger}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
};

export const ChartOfAccountsTree = ({ groups, ...handlers }: Props) => {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 0 }}>
      <List disablePadding>
        {groups.map((group) => (
          <Box key={`group-${group.id}`}>
            <GroupRow group={group} depth={0} {...handlers} />
          </Box>
        ))}
      </List>
    </Paper>
  );
};
