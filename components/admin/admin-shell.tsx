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
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faChevronDown,
  faChevronRight,
  faMagnifyingGlass,
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
  ADMIN_DASHBOARD_ITEM,
  ADMIN_NAV_SECTIONS,
  type NavCollapsible,
  type NavItem,
  type NavSection,
} from "./admin-nav";

const DRAWER_WIDTH = 260;
const MOBILE_DRAWER_WIDTH = "86vw";

/**
 * Every plain nav-item (whether a section's direct child or nested inside
 * a collapsible) renders as a bullet + label only — matching the
 * reference screenshot, where icons appear solely on section headers'
 * collapsible siblings ("Masters", "Transactions") and the standalone
 * Dashboard pill, never on a leaf link.
 */
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
    sx={{ borderRadius: 1.5, mb: 0.25, pl: indented ? 4.5 : 3 }}
  >
    <Box
      component="span"
      sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        bgcolor: selected ? "primary.main" : "text.disabled",
        mr: 1.5,
        flexShrink: 0,
      }}
    />
    <ListItemText
      primary={item.label}
      slotProps={{
        primary: { fontSize: "0.875rem", fontWeight: selected ? 600 : 400 },
      }}
    />
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
    <ListItemButton
      onClick={onToggle}
      sx={{ borderRadius: 1.5, mb: 0.25, pl: 3 }}
    >
      <FontAwesomeIcon
        icon={open ? faChevronDown : faChevronRight}
        size="2xs"
        style={{ width: 10, marginRight: 10, opacity: 0.6 }}
      />
      <Box sx={{ width: 20, color: "text.secondary" }}>
        <FontAwesomeIcon icon={collapsible.icon} size="sm" />
      </Box>
      <ListItemText
        primary={collapsible.label}
        slotProps={{ primary: { fontSize: "0.875rem" } }}
      />
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

const DashboardButton = ({
  selected,
  onClick,
}: {
  selected: boolean;
  onClick: () => void;
}) => (
  <ListItemButton
    component={Link}
    href={ADMIN_DASHBOARD_ITEM.href}
    onClick={onClick}
    disableRipple={selected}
    sx={{
      borderRadius: 1.5,
      mb: 1,
      // Driven entirely by this sx block rather than MUI's own
      // `selected` prop — that prop layers a translucent
      // action.selectedOpacity overlay on top of whatever background
      // sx sets, which combined with primary.contrastText produced
      // near-unreadable low-contrast text (reported directly: "Dashboard
      // menu haionekani vzr" — not showing properly).
      ...(selected && {
        bgcolor: "primary.main",
        color: "primary.contrastText",
      }),
      "&:hover": selected ? { bgcolor: "primary.dark" } : undefined,
    }}
  >
    <Box sx={{ width: 22, color: "inherit" }}>
      <FontAwesomeIcon icon={ADMIN_DASHBOARD_ITEM.icon} size="sm" />
    </Box>
    <ListItemText
      primary={ADMIN_DASHBOARD_ITEM.label}
      slotProps={{ primary: { fontWeight: 600 } }}
    />
  </ListItemButton>
);

const NavSectionGroup = ({
  section,
  open,
  onToggleSection,
  openCollapsibles,
  onToggleCollapsible,
  isNavItemActive,
  onNavigate,
  isSearching,
}: {
  section: NavSection;
  open: boolean;
  onToggleSection: () => void;
  openCollapsibles: Record<string, boolean>;
  onToggleCollapsible: (label: string) => void;
  isNavItemActive: (item: NavItem) => boolean;
  onNavigate: () => void;
  isSearching: boolean;
}) => (
  <Box sx={{ mb: 0.5 }}>
    <ListItemButton onClick={onToggleSection} sx={{ borderRadius: 1.5 }}>
      <FontAwesomeIcon
        icon={open ? faChevronDown : faChevronRight}
        size="2xs"
        style={{ width: 10, marginRight: 10, opacity: 0.6 }}
      />
      <ListItemText
        primary={section.label}
        slotProps={{
          primary: {
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: "text.secondary",
            textTransform: "uppercase",
          },
        }}
      />
    </ListItemButton>
    <Collapse in={open} timeout="auto" unmountOnExit>
      {section.children.map((child) =>
        child.type === "nav-item" ? (
          <NavItemButton
            key={child.href}
            item={child}
            selected={isNavItemActive(child)}
            onClick={onNavigate}
          />
        ) : (
          <NavCollapsibleGroup
            key={child.label}
            collapsible={child}
            open={
              isSearching ||
              (openCollapsibles[child.label] ??
                child.children.some(isNavItemActive))
            }
            onToggle={() => onToggleCollapsible(child.label)}
            isNavItemActive={isNavItemActive}
            onNavigate={onNavigate}
          />
        ),
      )}
    </Collapse>
  </Box>
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

  const [navQuery, setNavQuery] = useState("");
  const isSearching = navQuery.trim() !== "";

  /**
   * Recursive permission filter, matching ProsERP's own separation of
   * concerns (the nav data file stays plain data; this component is the
   * one place that cross-checks it against what the current user can
   * see). A collapsible drops out entirely once none of its children
   * survive; a section drops out once none of its children (nav-items or
   * surviving collapsibles) do. The search box's text filter runs the
   * same way, on top of the permission filter, so a search can never
   * surface something permissions already hid.
   */
  const visibleSections = useMemo(() => {
    const query = navQuery.trim().toLowerCase();
    const matches = (label: string) =>
      query === "" || label.toLowerCase().includes(query);

    const filterChildren = (
      children: NavSection["children"],
    ): NavSection["children"] =>
      children.flatMap((child): NavSection["children"] => {
        if (child.type === "nav-item") {
          return hasAnyPermission(child.permissions ?? []) &&
            matches(child.label)
            ? [child]
            : [];
        }

        const visibleGrandchildren = child.children.filter(
          (item) =>
            hasAnyPermission(item.permissions ?? []) && matches(item.label),
        );

        return visibleGrandchildren.length > 0
          ? [{ ...child, children: visibleGrandchildren }]
          : [];
      });

    return ADMIN_NAV_SECTIONS.map((section) => ({
      ...section,
      children: filterChildren(section.children),
    })).filter((section) => section.children.length > 0);
  }, [hasAnyPermission, navQuery]);

  const isDashboardVisible = hasAnyPermission(
    ADMIN_DASHBOARD_ITEM.permissions ?? [],
  );

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [openCollapsibles, setOpenCollapsibles] = useState<
    Record<string, boolean>
  >({});

  /**
   * Prefix-matches so a sub-route (e.g. /admin/products/new) still
   * highlights its parent link (Products) — except Dashboard, whose
   * href ("/admin") is a literal prefix of every other admin route, so
   * it needs an exact match or it would render as "active" (and, worse,
   * visually near-unreadable — see DashboardButton) on every single page.
   */
  const isNavItemActive = (item: NavItem) =>
    item.href === ADMIN_DASHBOARD_ITEM.href
      ? currentPath === item.href
      : currentPath === item.href || currentPath.startsWith(`${item.href}/`);

  const isSectionActive = (section: NavSection) =>
    section.children.some((child) =>
      child.type === "nav-item"
        ? isNavItemActive(child)
        : child.children.some(isNavItemActive),
    );

  const toggleSection = (label: string) =>
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));

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
      <Box sx={{ px: 1.5, pt: 1.5, pb: 0.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search Menu"
          value={navQuery}
          onChange={(event) => setNavQuery(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    size="xs"
                    style={{ opacity: 0.6 }}
                  />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
      <List sx={{ px: 1, py: 1 }}>
        {isDashboardVisible ? (
          <DashboardButton
            selected={isNavItemActive(ADMIN_DASHBOARD_ITEM)}
            onClick={() => setMobileOpen(false)}
          />
        ) : null}
        {visibleSections.map((section) => (
          <NavSectionGroup
            key={section.label}
            section={section}
            open={
              isSearching ||
              (openSections[section.label] ?? isSectionActive(section))
            }
            onToggleSection={() => toggleSection(section.label)}
            openCollapsibles={openCollapsibles}
            onToggleCollapsible={toggleCollapsible}
            isNavItemActive={isNavItemActive}
            onNavigate={() => setMobileOpen(false)}
            isSearching={isSearching}
          />
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
