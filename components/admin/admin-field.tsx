import { Checkbox, Stack, TextField, Typography } from "@mui/material";

type AdminFieldProps = {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
  placeholder?: string;
  multiline?: boolean;
  minRows?: number;
  required?: boolean;
  fullWidth?: boolean;
};

const labelSx = {
  textTransform: "uppercase",
  letterSpacing: "0.2em",
  fontSize: "0.7rem",
  color: "text.secondary",
  fontWeight: 500,
};

export const AdminField = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  multiline = false,
  minRows = 3,
  required = false,
  fullWidth = true,
}: AdminFieldProps) => {
  const displayValue = (() => {
    if (type !== "number") return value;
    if (value === "") return "";

    const numeric = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
    if (!Number.isFinite(numeric)) return value;

    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(numeric);
  })();

  const handleChange = (nextValue: string) => {
    if (type !== "number") {
      onChange(nextValue);
      return;
    }

    const normalized = nextValue.replace(/,/g, "").replace(/[^\d.-]/g, "");
    onChange(normalized);
  };

  return (
    <TextField
      label={label}
      value={displayValue}
      onChange={(event) => handleChange(event.target.value)}
      type={type === "number" ? "text" : type}
      inputMode={type === "number" ? "decimal" : undefined}
      placeholder={placeholder}
      multiline={multiline}
      minRows={multiline ? minRows : undefined}
      required={required}
      fullWidth={fullWidth}
      variant="outlined"
      sx={{
        bgcolor: "background.paper",
        "& .MuiOutlinedInput-root": {
          borderRadius: 0,
        },
      }}
      InputLabelProps={{ sx: labelSx }}
    />
  );
};

type AdminToggleProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const AdminToggle = ({ label, checked, onChange }: AdminToggleProps) => {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Checkbox checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <Typography sx={{ fontSize: "0.85rem", color: "text.primary" }}>{label}</Typography>
    </Stack>
  );
};
