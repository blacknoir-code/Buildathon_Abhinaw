import {
  LayoutDashboard,
  Megaphone,
  Palette,
  PenLine,
  BarChart3,
  History,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  hint?: string;
}

export const NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Campaigns", href: "/campaigns", icon: Megaphone },
  { label: "Creative Studio", href: "/creative-studio", icon: Palette },
  { label: "Content Generator", href: "/content", icon: PenLine },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "History", href: "/history", icon: History },
  { label: "Settings", href: "/settings", icon: Settings },
];
