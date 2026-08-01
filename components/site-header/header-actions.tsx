import { IconButton, MenuItem, Select, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBagShopping, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import {
  CURRENCY_OPTIONS,
  type CurrencyCode,
} from "@/utils/currency";

type Props = {
  currency: CurrencyCode;
  cartCount: number;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onSearchToggle: () => void;
  onCartOpen: () => void;
};

export const SiteHeaderActions = ({
  currency,
  cartCount,
  onCurrencyChange,
  onSearchToggle,
  onCartOpen,
}: Props) => {
  return (
    <>
      <Select
        size="small"
        value={currency}
        onChange={(event) => onCurrencyChange(event.target.value as CurrencyCode)}
        variant="standard"
        disableUnderline
        sx={{
          minWidth: { xs: 72, md: 90 },
          fontSize: "0.72rem",
          letterSpacing: "0.08em",
          color: "text.secondary",
          textTransform: "uppercase",
          "& .MuiSelect-select": {
            py: 0.35,
            pr: "20px !important",
          },
        }}
        renderValue={(value) => value}
      >
        {CURRENCY_OPTIONS.map((option) => (
          <MenuItem key={option.code} value={option.code}>
            {option.code}
          </MenuItem>
        ))}
      </Select>

      <IconButton aria-label="Search" onClick={onSearchToggle}>
        <FontAwesomeIcon icon={faMagnifyingGlass} fontSize={15} />
      </IconButton>

      <IconButton aria-label="Cart" onClick={onCartOpen}>
        <FontAwesomeIcon icon={faBagShopping} fontSize={15} />
      </IconButton>

      {cartCount > 0 ? (
        <Typography
          component="span"
          sx={{
            ml: -0.25,
            minWidth: 20,
            textAlign: "center",
            fontSize: "0.72rem",
            color: "text.secondary",
          }}
        >
          {cartCount}
        </Typography>
      ) : null}
    </>
  );
};
