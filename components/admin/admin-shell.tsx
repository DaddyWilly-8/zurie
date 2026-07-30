"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
  faImage,
  faLayerGroup,
  faUserShield,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { authService } from "@/services/auth/auth.service";

type AdminNavLink = {
  href: string;
  label: string;
  icon: typeof faHouse;
};

const DRAWER_WIDTH = 260;

const links: AdminNavLink[] = [
  { href: "/admin", label: "Overview", icon: faHouse },
  { href: "/admin/products", label: "Products", icon: faBoxArchive },
  { href: "/admin/categories", label: "Categories", icon: faLayerGroup },
  { href: "/admin/orders", label: "Orders", icon: faBoxesPacking },
  { href: "/admin/enquiries", label: "Enquiries", icon: faEnvelope },
  { href: "/admin/homepage", label: "Homepage", icon: faFileLines },
  { href: "/admin/content", label: "Content", icon: faFileLines },
  { href: "/admin/media", label: "Media", icon: faImage },
  { href: "/admin/settings", label: "Settings", icon: faGear },
  { href: "/admin/users", label: "Admin Users", icon: faUserShield },
  { href: "/admin/activity", label: "Activity", icon: faChartLine },
];

export const AdminShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      const label = segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

      return { href, label };
    });
  }, [pathname]);

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
          const selected = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <ListItemButton
              key={link.href}
              component={Link}
              href={link.href}
              selected={selected}
              onClick={() => setMobileOpen(false)}
              sx={{ borderRadius: 1.5, mb: 0.5 }}
            >
              <Box sx={{ width: 22, color: selected ? "primary.main" : "text.secondary" }}>
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
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f6f4f0" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: "#ffffff",
          borderBottom: "1px solid #e9e2d8",
          color: "#171512",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <FontAwesomeIcon icon={faBars} />
          </IconButton>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Dashboard
            </Typography>
            <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: "0.8rem" }}>
              {breadcrumbs.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </Breadcrumbs>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: DRAWER_WIDTH },
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
              borderRight: "1px solid #e9e2d8",
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
          p: { xs: 2, md: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
