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
  color: "#7f7467",
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
  return (
    <TextField
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      type={type}
      placeholder={placeholder}
      multiline={multiline}
      minRows={multiline ? minRows : undefined}
      required={required}
      fullWidth={fullWidth}
      variant="outlined"
      sx={{
        bgcolor: "#ffffff",
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
      <Typography sx={{ fontSize: "0.85rem", color: "#171512" }}>{label}</Typography>
    </Stack>
  );
};
