"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Box,
  Breadcrumbs,
  Button,
  Collapse,
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
  faChevronDown,
  faChevronRight,
  faMoon,
  faArrowUpRightFromSquare,
  faRightFromBracket,
  faSun,
} from "@fortawesome/free-solid-svg-icons";
import { authService } from "@/services/auth/auth.service";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { CURRENCY_OPTIONS, type CurrencyCode } from "@/utils/currency";
import { useThemeMode } from "@/providers/theme-provider";
import { useAdminAuth } from "@/providers/admin-auth-provider";
import {
  ADMIN_NAV_SECTIONS,
  type NavCollapsible,
  type NavItem,
  type NavSection,
} from "./admin-nav";

const DRAWER_WIDTH = 260;
const MOBILE_DRAWER_WIDTH = "86vw";

const NavItemButton = ({
  item,
  selected,
  onClick,
  indented,
}: {
  item: NavItem;
  selected: boolean;
  onClick: () => void;
  indented?: boolean;
}) => (
  <ListItemButton
    component={Link}
    href={item.href}
    selected={selected}
    onClick={onClick}
    sx={{ borderRadius: 1.5, mb: 0.5, pl: indented ? 4 : 2 }}
  >
    <Box
      sx={{
        width: 22,
        color: selected ? "primary.main" : "text.secondary",
      }}
    >
      <FontAwesomeIcon icon={item.icon} size="sm" />
    </Box>
    <ListItemText primary={item.label} />
  </ListItemButton>
);

const NavCollapsibleGroup = ({
  collapsible,
  open,
  onToggle,
  isNavItemActive,
  onNavigate,
}: {
  collapsible: NavCollapsible;
  open: boolean;
  onToggle: () => void;
  isNavItemActive: (item: NavItem) => boolean;
  onNavigate: () => void;
}) => (
  <>
    <ListItemButton onClick={onToggle} sx={{ borderRadius: 1.5, mb: 0.5 }}>
      <Box sx={{ width: 22, color: "text.secondary" }}>
        <FontAwesomeIcon icon={collapsible.icon} size="sm" />
      </Box>
      <ListItemText primary={collapsible.label} />
      <FontAwesomeIcon icon={open ? faChevronDown : faChevronRight} size="xs" />
    </ListItemButton>
    <Collapse in={open} timeout="auto" unmountOnExit>
      {collapsible.children.map((item) => (
        <NavItemButton
          key={item.href}
          item={item}
          selected={isNavItemActive(item)}
          onClick={onNavigate}
          indented
        />
      ))}
    </Collapse>
  </>
);

export const AdminShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const currentPath = pathname ?? "";
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currency = useCurrencyStore((state) => state.currency);
  const setCurrency = useCurrencyStore((state) => state.setCurrency);
  const refreshRates = useCurrencyStore((state) => state.refreshRates);
  const { mode, toggleMode } = useThemeMode();
  const { user, hasAnyPermission } = useAdminAuth();

  /**
   * Recursive permission filter, matching ProsERP's own separation of
   * concerns (the nav data file stays plain data; this component is the
   * one place that cross-checks it against what the current user can
   * see). A collapsible drops out entirely once none of its children
   * survive; a section drops out once none of its children (nav-items or
   * surviving collapsibles) do.
   */
  const visibleSections = useMemo(() => {
    const filterChildren = (
      children: NavSection["children"],
    ): NavSection["children"] =>
      children.flatMap((child): NavSection["children"] => {
        if (child.type === "nav-item") {
          return hasAnyPermission(child.permissions ?? []) ? [child] : [];
        }

        const visibleGrandchildren = child.children.filter((item) =>
          hasAnyPermission(item.permissions ?? []),
        );

        return visibleGrandchildren.length > 0
          ? [{ ...child, children: visibleGrandchildren }]
          : [];
      });

    return ADMIN_NAV_SECTIONS.map((section) => ({
      ...section,
      children: filterChildren(section.children),
    })).filter((section) => section.children.length > 0);
  }, [hasAnyPermission]);

  const [openCollapsibles, setOpenCollapsibles] = useState<
    Record<string, boolean>
  >({});

  const isNavItemActive = (item: NavItem) =>
    currentPath === item.href || currentPath.startsWith(`${item.href}/`);

  const toggleCollapsible = (label: string) =>
    setOpenCollapsibles((prev) => ({ ...prev, [label]: !prev[label] }));

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
        {visibleSections.map((section, sectionIndex) => (
          <Box key={section.label} sx={{ mb: 0.5 }}>
            <Typography
              variant="overline"
              sx={{
                display: "block",
                px: 1.5,
                pt: sectionIndex === 0 ? 0.5 : 1.5,
                pb: 0.25,
                fontSize: "0.68rem",
                letterSpacing: "0.08em",
                color: "text.secondary",
              }}
            >
              {section.label}
            </Typography>
            {section.children.map((child) =>
              child.type === "nav-item" ? (
                <NavItemButton
                  key={child.href}
                  item={child}
                  selected={isNavItemActive(child)}
                  onClick={() => setMobileOpen(false)}
                />
              ) : (
                <NavCollapsibleGroup
                  key={child.label}
                  collapsible={child}
                  open={
                    openCollapsibles[child.label] ??
                    child.children.some(isNavItemActive)
                  }
                  onToggle={() => toggleCollapsible(child.label)}
                  isNavItemActive={isNavItemActive}
                  onNavigate={() => setMobileOpen(false)}
                />
              ),
            )}
          </Box>
        ))}
      </List>
      <Box sx={{ mt: "auto", p: 2 }}>
        {user ? (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user.email}
            </Typography>
          </Box>
        ) : null}
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
