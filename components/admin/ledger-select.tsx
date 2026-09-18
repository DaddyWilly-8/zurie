import { MenuItem, TextField } from "@mui/material";
import type { Ledger } from "@/services/finance/finance.service";

type Props = {
  label: string;
  value: number | "";
  ledgers: Array<Ledger & { groupName: string }>;
  onChange: (value: number | "") => void;
  size?: "small" | "medium";
  required?: boolean;
};

/** Shared ledger picker for every Transaction subtype form (Payment/Receipt/Journal Voucher/Fund Transfer). */
export const LedgerSelect = ({
  label,
  value,
  ledgers,
  onChange,
  size = "medium",
  required,
}: Props) => (
  <TextField
    select
    fullWidth
    size={size}
    label={label}
    value={value}
    required={required}
    onChange={(event) =>
      onChange(event.target.value === "" ? "" : Number(event.target.value))
    }
  >
    {ledgers.map((ledger) => (
      <MenuItem key={ledger.id} value={ledger.id}>
        {ledger.groupName} — {ledger.name} ({ledger.code})
      </MenuItem>
    ))}
  </TextField>
);
