import {
  IconHome,
  IconSearch,
  IconShieldCheck,
  IconShoppingCart,
  IconTruckDelivery,
  IconUser,
  type Icon,
} from "@tabler/icons-react";

export interface MenuItem {
  title: string;
  href: string;
  icon: Icon;
  description: string;
}

export interface MenuGroup {
  group: string;
  items: MenuItem[];
}

/** The global navigation, grouped. The landing page's tiles read the same list. */
export const MENU_ITEMS: MenuGroup[] = [
  {
    group: "Shop",
    items: [
      { title: "Home", href: "/", icon: IconHome, description: "The Pet Store front door." },
      {
        title: "Catalog & search",
        href: "/catalog",
        icon: IconSearch,
        description: "Browse categories, products and items, or search by keyword.",
      },
      {
        title: "Cart",
        href: "/cart",
        icon: IconShoppingCart,
        description: "Change quantities and see your subtotal.",
      },
    ],
  },
  {
    group: "Account",
    items: [
      {
        title: "Sign on",
        href: "/signon",
        icon: IconUser,
        description: "Sign on to check out, or create an account if you are new.",
      },
    ],
  },
  {
    group: "Operations",
    items: [
      {
        title: "Order fulfilment and invoicing",
        href: "/admin/inventory",
        icon: IconTruckDelivery,
        description: "Update stock quantities on the Inventory screen.",
      },
    ],
  },
  {
    group: "Admin",
    items: [
      {
        title: "Administration of orders",
        href: "/admin",
        icon: IconShieldCheck,
        description: "Admin sign-in to approve or deny orders and read sales reports.",
      },
    ],
  },
];
