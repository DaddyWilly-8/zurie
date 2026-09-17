import {
  Button,
  ButtonGroup,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AdminField } from "@/components/admin";
import type { SalesOutlet } from "@/services/outlets/outlet.service";
import type { CustomerMode } from "./types";

type Props = {
  outlets: SalesOutlet[];
  outletId: number | "";
  onOutletChange: (id: number | "") => void;
  customerMode: CustomerMode;
  onCustomerModeChange: (mode: CustomerMode) => void;
  customerName: string;
  onCustomerNameChange: (value: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (value: string) => void;
  customerId: string;
  onCustomerIdChange: (value: string) => void;
  couponCode: string;
  onCouponCodeChange: (value: string) => void;
  disabled: boolean;
  submitting: boolean;
  onSubmit: () => void;
};

export const PosCheckoutPanel = ({
  outlets,
  outletId,
  onOutletChange,
  customerMode,
  onCustomerModeChange,
  customerName,
  onCustomerNameChange,
  customerPhone,
  onCustomerPhoneChange,
  customerId,
  onCustomerIdChange,
  couponCode,
  onCouponCodeChange,
  disabled,
  submitting,
  onSubmit,
}: Props) => {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1">Checkout</Typography>

      <TextField
        select
        fullWidth
        label="Outlet"
        value={outletId}
        onChange={(event) =>
          onOutletChange(
            event.target.value === "" ? "" : Number(event.target.value),
          )
        }
      >
        {outlets.map((outlet) => (
          <MenuItem key={outlet.id} value={outlet.id}>
            {outlet.name}
          </MenuItem>
        ))}
      </TextField>

      <ButtonGroup fullWidth size="small">
        <Button
          variant={customerMode === "walkin" ? "contained" : "outlined"}
          onClick={() => onCustomerModeChange("walkin")}
        >
          Walk-in
        </Button>
        <Button
          variant={customerMode === "existing" ? "contained" : "outlined"}
          onClick={() => onCustomerModeChange("existing")}
        >
          Existing Customer
        </Button>
      </ButtonGroup>

      {customerMode === "walkin" ? (
        <>
          <AdminField
            label="Customer Name"
            value={customerName}
            onChange={onCustomerNameChange}
            required
          />
          <AdminField
            label="Customer Phone"
            value={customerPhone}
            onChange={onCustomerPhoneChange}
            required
          />
        </>
      ) : (
        <AdminField
          label="Customer ID"
          value={customerId}
          onChange={onCustomerIdChange}
          required
        />
      )}

      <AdminField
        label="Coupon Code (optional)"
        value={couponCode}
        onChange={onCouponCodeChange}
      />

      <Button
        variant="contained"
        size="large"
        disabled={disabled || submitting}
        onClick={onSubmit}
      >
        {submitting ? "Processing..." : "Complete Sale"}
      </Button>
    </Stack>
  );
};
