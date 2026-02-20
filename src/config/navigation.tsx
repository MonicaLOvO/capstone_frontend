import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import MonitorIcon from "@mui/icons-material/Monitor";
import InsightsIcon from "@mui/icons-material/Insights";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { ReactNode } from "react";
import { Permission } from "@/types/permissions";

export interface NavItem {
  label: string;
  href: string;
  permission: Permission;
  icon: ReactNode;
  section?: string;
}

export const navItems: NavItem[] = [
  // ===== MAIN =====   //We attach a basic permission everyone has (inventory.view) so staff can still enter app.
  {
    label: "Dashboard",
    href: "/dashboard",
    permission: "inventory.view", // basic access permission
    icon: <DashboardIcon />,
    section: "Main",
  },
  {
    label: "Inventory",
    href: "/inventory",
    permission: "inventory.view",
    icon: <InventoryIcon />,
    section: "Main",
  },
  {
    label: "Orders",
    href: "/orders",
    permission: "orders.view",
    icon: <ReceiptLongIcon />,
    section: "Main",
  },

  // ===== MANAGEMENT =====
  {
    label: "Activity Monitor",
    href: "/activity",
    permission: "tasks.view.all", //admin + manager only
    icon: <MonitorIcon />,
    section: "Management",
  },
  {
    label: "Reports",
    href: "/reports",
    permission: "reports.view",
    icon: <AssessmentIcon />,
    section: "Management",
  },
  {
    label: "AI Insights",
    href: "/ai-insights",
    permission: "ai.view",
    icon: <InsightsIcon />,
    section: "Management",
  },
  {
    label: "Staff Management",
    href: "/staff-management",
    permission: "staff.view",
    icon: <PeopleIcon />,
    section: "Management",
  },

  // ===== TASKS =====
  {
    label: "My Tasks",
    href: "/my-tasks",
    permission: "tasks.view.own", //staff + manager
    icon: <AssignmentIcon />,
    section: "Tasks",
  },

  // ===== ADMIN =====
  {
    label: "User Management",
    href: "/user-management",
    permission: "users.view",
    icon: <PeopleIcon />,
    section: "Admin",
  },
];