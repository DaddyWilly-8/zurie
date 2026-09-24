import Link from "next/link";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faMoon,
  faMagnifyingGlass,
  faSun,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { CURRENCY_OPTIONS, type CurrencyCode } from "@/utils/currency";
import { useCustomerAuth } from "@/providers/customer-auth-provider";
import { AccountMenu } from "@/components/site-header/account-menu";
import type { PaletteMode } from "@mui/material";

type Props = {
  currency: CurrencyCode;
  cartCount: number;
  mode: PaletteMode;
  onThemeToggle: () => void;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onSearchToggle: () => void;
  onCartOpen: () => void;
};

export const SiteHeaderActions = ({
  currency,
  cartCount,
  mode,
  onThemeToggle,
  onCurrencyChange,
  onSearchToggle,
  onCartOpen,
}: Props) => {
  const { isAuthenticated } = useCustomerAuth();
  return (
    <>
      <Select
        size="small"
        value={currency}
        onChange={(event) =>
          onCurrencyChange(event.target.value as CurrencyCode)
        }
        variant="standard"
        disableUnderline
        inputProps={{ "aria-label": "Currency" }}
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

      <IconButton
        aria-label={
          mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        onClick={onThemeToggle}
      >
        <FontAwesomeIcon
          icon={mode === "dark" ? faSun : faMoon}
          fontSize={15}
        />
      </IconButton>

      <IconButton aria-label="Cart" onClick={onCartOpen}>
        <FontAwesomeIcon icon={faCartShopping} fontSize={15} />
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

      {isAuthenticated ? (
        <AccountMenu>
          <IconButton component="span" aria-label="My Account">
            <FontAwesomeIcon icon={faUser} fontSize={15} />
          </IconButton>
        </AccountMenu>
      ) : (
        <>
          {/* Full "Sign in" + "Create account" only where there's room —
              collapses to just the account icon below md, same breakpoint
              SiteHeaderNavLinks already uses for its own desktop-only row.
              "Sign in" opens the welcome popover (AccountMenu); "Create
              account" still navigates straight to /register — no popover
              needed for a page the click already lands you on directly. */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <AccountMenu>
              <Button
                component="span"
                variant="text"
                startIcon={<FontAwesomeIcon icon={faUser} fontSize={13} />}
                sx={{ color: "text.primary", fontWeight: 500 }}
              >
                Sign in
              </Button>
            </AccountMenu>
            <Button
              component={Link}
              href="/register"
              variant="contained"
              sx={{ borderRadius: 999, px: 2.5 }}
            >
              Create account
            </Button>
          </Box>
          <AccountMenu>
            <IconButton
              component="span"
              aria-label="Sign In"
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              <FontAwesomeIcon icon={faUser} fontSize={15} />
            </IconButton>
          </AccountMenu>
        </>
      )}
    </>
  );
};
