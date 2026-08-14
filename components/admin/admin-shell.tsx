"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Box,
  Breadcrumbs,
  Button,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faBoxArchive,
  faBoxesPacking,
  faChartLine,
  faFileLines,
  faEnvelope,
  faGear,
  faHouse,
  faMoon,
  faArrowUpRightFromSquare,
  faImage,
  faLayerGroup,
  faUsers,
  faUserShield,
  faRightFromBracket,
  faSun,
} from "@fortawesome/free-solid-svg-icons";
import { authService } from "@/services/auth/auth.service";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { CURRENCY_OPTIONS, type CurrencyCode } from "@/utils/currency";
import { useThemeMode } from "@/providers/theme-provider";

type AdminNavLink = {
  href: string;
  label: string;
  icon: typeof faHouse;
};

const DRAWER_WIDTH = 260;
const MOBILE_DRAWER_WIDTH = "86vw";

const links: AdminNavLink[] = [
  { href: "/admin", label: "Overview", icon: faHouse },
  { href: "/admin/products", label: "Products", icon: faBoxArchive },
  { href: "/admin/categories", label: "Categories", icon: faLayerGroup },
  { href: "/admin/orders", label: "Orders", icon: faBoxesPacking },
  { href: "/admin/customers", label: "Customers", icon: faUsers },
  { href: "/admin/settings", label: "Settings", icon: faGear },
  { href: "/admin/users", label: "Admin Users", icon: faUserShield },
  { href: "/admin/activity", label: "Activity", icon: faChartLine },
];

export const AdminShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const currentPath = pathname ?? "";
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currency = useCurrencyStore((state) => state.currency);
  const setCurrency = useCurrencyStore((state) => state.setCurrency);
  const refreshRates = useCurrencyStore((state) => state.refreshRates);
  const { mode, toggleMode } = useThemeMode();

  useEffect(() => {
    void refreshRates();
  }, [refreshRates]);

  useEffect(() => {
    setMobileOpen(false);
  }, [currentPath]);

  const breadcrumbs = useMemo(() => {
    const segments = currentPath.split("/").filter(Boolean);
    return segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      const label = segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

      return { href, label };
    });
  }, [currentPath]);

  const onLogout = async () => {
    await authService.logout();
    router.push("/admin/login");
    router.refresh();
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar>
        <Typography variant="h6" fontWeight={700}>
          Zuriè Admin
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        {links.map((link) => {
          const selected =
            currentPath === link.href ||
            currentPath.startsWith(`${link.href}/`);
          return (
            <ListItemButton
              key={link.href}
              component={Link}
              href={link.href}
              selected={selected}
              onClick={() => setMobileOpen(false)}
              sx={{ borderRadius: 1.5, mb: 0.5 }}
            >
              <Box
                sx={{
                  width: 22,
                  color: selected ? "primary.main" : "text.secondary",
                }}
              >
                <FontAwesomeIcon icon={link.icon} size="sm" />
              </Box>
              <ListItemText primary={link.label} />
            </ListItemButton>
          );
        })}
      </List>
      <Box sx={{ mt: "auto", p: 2 }}>
        <Button
          fullWidth
          color="inherit"
          variant="text"
          component={Link}
          href="/"
          sx={{ mb: 1, justifyContent: "flex-start" }}
          startIcon={
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="sm" />
          }
        >
          View Storefront
        </Button>
        <Button
          fullWidth
          color="inherit"
          variant="outlined"
          onClick={onLogout}
          startIcon={<FontAwesomeIcon icon={faRightFromBracket} size="sm" />}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          color: "text.primary",
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 62, md: 64 },
            gap: 1,
            px: { xs: 1.4, md: 2.5 },
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 0.8, display: { md: "none" } }}
          >
            <FontAwesomeIcon icon={faBars} />
          </IconButton>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              Dashboard
            </Typography>
            <Box
              sx={{
                display: { xs: "none", sm: "block" },
                overflowX: "auto",
                "&::-webkit-scrollbar": { height: 4 },
              }}
            >
              <Breadcrumbs
                aria-label="breadcrumb"
                sx={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}
              >
                {breadcrumbs.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </Breadcrumbs>
            </Box>
          </Box>

          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
            sx={{ ml: 0, flexShrink: 0 }}
          >
            <IconButton
              aria-label={
                mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
              }
              onClick={toggleMode}
              sx={{ color: "text.secondary" }}
            >
              <FontAwesomeIcon
                icon={mode === "dark" ? faSun : faMoon}
                fontSize={14}
              />
            </IconButton>

            <Select
              size="small"
              value={currency}
              onChange={(event) =>
                setCurrency(event.target.value as CurrencyCode)
              }
              variant="standard"
              disableUnderline
              sx={{
                minWidth: { xs: 62, md: 88 },
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
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: MOBILE_DRAWER_WIDTH,
              maxWidth: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.35, sm: 2, md: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: 8.5, md: 8 },
          overflowX: "hidden",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: "100%", overflowX: "auto" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};
