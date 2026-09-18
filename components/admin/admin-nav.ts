import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import {
  faBoxArchive,
  faBoxesPacking,
  faChartLine,
  faGear,
  faHouse,
  faLayerGroup,
  faUsers,
  faUserShield,
  faSitemap,
  faStore,
  faTruckField,
  faCashRegister,
  faTruckRampBox,
  faTags,
  faMoneyBillWave,
  faRuler,
  faCoins,
  faClipboardList,
  faDolly,
  faPercent,
  faFileInvoice,
  faMoneyCheckDollar,
  faReceipt,
  faBookOpen,
  faRightLeft,
} from "@fortawesome/free-solid-svg-icons";

/**
 * Adapted from the ProsERP frontend's menu pattern (3-level nested tree,
 * discriminated by `type`) — see Zurie_V3_ProsERP_Adaptation_Plan.md for
 * the full comparison. Two deliberate simplifications from that
 * reference, both because our constraints actually differ:
 *
 * 1. No per-locale server generation — ProsERP's `getMenus(locale)` is
 *    async because it has real i18n and builds this server-side per
 *    request. This app has no locale routing, so it's just a plain
 *    synchronous constant computed once at module load.
 * 2. Icons are real FontAwesome icon objects, not string keys resolved
 *    against a registry — ProsERP needs string keys because its menu
 *    crosses a server-to-client serialization boundary (built in a
 *    layout, passed down as a prop). `AdminShell` is already a client
 *    component with no such boundary, so the indirection would solve a
 *    problem this app doesn't have.
 *
 * Permission-filtering still lives entirely in the rendering component
 * (`AdminShell`), not here — this file stays a plain, testable data
 * structure, matching ProsERP's own separation of data from rendering.
 */

export type NavItem = {
  type: "nav-item";
  href: string;
  label: string;
  icon: IconDefinition;
  /** Permission keys from the catalog — the user needs at least one. Omit for links every logged-in admin can see. */
  permissions?: string[];
};

export type NavCollapsible = {
  type: "collapsible";
  label: string;
  icon: IconDefinition;
  children: NavItem[];
};

export type NavSection = {
  type: "section";
  label: string;
  children: Array<NavItem | NavCollapsible>;
};

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    type: "section",
    label: "Overview",
    children: [
      {
        type: "nav-item",
        href: "/admin",
        label: "Overview",
        icon: faHouse,
        permissions: ["dashboard_view"],
      },
    ],
  },
  {
    type: "section",
    label: "Catalog",
    children: [
      {
        type: "nav-item",
        href: "/admin/products",
        label: "Products",
        icon: faBoxArchive,
        permissions: ["product_view"],
      },
      {
        type: "nav-item",
        href: "/admin/categories",
        label: "Categories",
        icon: faLayerGroup,
        permissions: ["category_view"],
      },
      {
        type: "collapsible",
        label: "Catalog Settings",
        icon: faRuler,
        children: [
          {
            type: "nav-item",
            href: "/admin/measurement-units",
            label: "Measurement Units",
            icon: faRuler,
            permissions: ["measurement_unit_view"],
          },
        ],
      },
    ],
  },
  {
    type: "section",
    label: "Sales & POS",
    children: [
      {
        type: "nav-item",
        href: "/admin/orders",
        label: "Orders",
        icon: faBoxesPacking,
        permissions: ["order_view"],
      },
      {
        type: "nav-item",
        href: "/admin/pos",
        label: "Point of Sale",
        icon: faCashRegister,
        permissions: ["pos_sale"],
      },
      {
        type: "nav-item",
        href: "/admin/cashier-sessions",
        label: "Cashier Sessions",
        icon: faMoneyBillWave,
        permissions: ["cashier_session_view"],
      },
      {
        type: "nav-item",
        href: "/admin/customers",
        label: "Customers",
        icon: faUsers,
        permissions: ["customer_view"],
      },
      {
        type: "nav-item",
        href: "/admin/price-lists",
        label: "Price Lists",
        icon: faTags,
        permissions: ["price_list_view"],
      },
      {
        type: "nav-item",
        href: "/admin/proforma-invoices",
        label: "Proforma Invoices",
        icon: faFileInvoice,
        permissions: ["proforma_invoice_view"],
      },
      {
        type: "nav-item",
        href: "/admin/outlets",
        label: "Outlets",
        icon: faStore,
        permissions: ["outlet_view"],
      },
    ],
  },
  {
    type: "section",
    label: "Procurement",
    children: [
      {
        type: "nav-item",
        href: "/admin/purchases",
        label: "Purchases",
        icon: faTruckRampBox,
        permissions: ["purchase_view"],
      },
      {
        type: "nav-item",
        href: "/admin/purchase-orders",
        label: "Purchase Orders",
        icon: faClipboardList,
        permissions: ["purchase_order_view"],
      },
      {
        type: "nav-item",
        href: "/admin/grns",
        label: "Goods Received",
        icon: faDolly,
        permissions: ["grn_view"],
      },
      {
        type: "nav-item",
        href: "/admin/suppliers",
        label: "Suppliers",
        icon: faTruckField,
        permissions: ["supplier_view"],
      },
    ],
  },
  {
    type: "section",
    label: "Finance",
    children: [
      {
        type: "nav-item",
        href: "/admin/cost-centers",
        label: "Cost Centers",
        icon: faSitemap,
        permissions: ["finance_view"],
      },
      {
        type: "nav-item",
        href: "/admin/currencies",
        label: "Currencies",
        icon: faCoins,
        permissions: ["currency_view"],
      },
      {
        type: "nav-item",
        href: "/admin/vat-transactions",
        label: "VAT",
        icon: faPercent,
        permissions: ["vat_view"],
      },
      {
        type: "collapsible",
        label: "Transactions",
        icon: faMoneyCheckDollar,
        children: [
          {
            type: "nav-item",
            href: "/admin/payments",
            label: "Payments",
            icon: faMoneyCheckDollar,
            permissions: ["transaction_view"],
          },
          {
            type: "nav-item",
            href: "/admin/receipts",
            label: "Receipts",
            icon: faReceipt,
            permissions: ["transaction_view"],
          },
          {
            type: "nav-item",
            href: "/admin/journal-vouchers",
            label: "Journal Vouchers",
            icon: faBookOpen,
            permissions: ["transaction_view"],
          },
          {
            type: "nav-item",
            href: "/admin/fund-transfers",
            label: "Fund Transfers",
            icon: faRightLeft,
            permissions: ["transaction_view"],
          },
        ],
      },
    ],
  },
  {
    type: "section",
    label: "System",
    children: [
      {
        type: "nav-item",
        href: "/admin/settings",
        label: "Settings",
        icon: faGear,
        permissions: ["settings_manage"],
      },
      {
        type: "nav-item",
        href: "/admin/users",
        label: "Admin Users",
        icon: faUserShield,
        permissions: ["user_manage"],
      },
      {
        type: "nav-item",
        href: "/admin/activity",
        label: "Activity",
        icon: faChartLine,
        permissions: ["activity_view"],
      },
    ],
  },
];
