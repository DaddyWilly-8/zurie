"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Divider,
  MenuItem,
  MenuList,
  Popover,
  Typography,
} from "@mui/material";
import { useCustomerAuth } from "@/providers/customer-auth-provider";
import { GoogleButton } from "@/features/auth/google-button";

/**
 * Click-to-open account popover, following the same "trigger opens an MUI
 * Popover" pattern as admin's PricingPopover (see CLAUDE.md's inline-popover
 * convention) — shares one trigger element (icon or "Sign in" text, passed
 * as `children`) between the logged-out welcome panel and the logged-in
 * quick-links list, so the header only needs one popover instance instead
 * of two divergent components.
 */
export const AccountMenu = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useCustomerAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);

  const close = () => setAnchorEl(null);

  const handleLogout = async () => {
    await logout();
    close();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <Box
        onClick={(event: MouseEvent<HTMLElement>) =>
          setAnchorEl(event.currentTarget)
        }
        sx={{ cursor: "pointer", display: "inline-flex" }}
      >
        {children}
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { mt: 1, width: 280, borderRadius: 2 } } }}
      >
        {isAuthenticated ? (
          <Box sx={{ py: 1 }}>
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600} noWrap>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuList sx={{ py: 0.5 }}>
              <MenuItem component={Link} href="/account" onClick={close}>
                My Account
              </MenuItem>
              <MenuItem component={Link} href="/account" onClick={close}>
                Orders
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
            </MenuList>
          </Box>
        ) : (
          <Box sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Welcome to Zuriè
            </Typography>
            <Button
              component={Link}
              href="/login"
              variant="contained"
              fullWidth
              onClick={close}
              sx={{ borderRadius: 999, mb: 1.5 }}
            >
              Sign in
            </Button>
            <Box sx={{ mb: 1.5 }}>
              <GoogleButton />
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              New to Zuriè?{" "}
              <Link
                href="/register"
                onClick={close}
                style={{ fontWeight: 600 }}
              >
                Create an account
              </Link>
            </Typography>
          </Box>
        )}
      </Popover>
    </>
  );
};
