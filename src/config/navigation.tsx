import { UserRole } from '@/types/roles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MonitorIcon from '@mui/icons-material/Monitor';
import InsightsIcon from '@mui/icons-material/Insights';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { ReactNode } from 'react';


export interface NavItem {
  label: string;
  href: string;
  roles: UserRole[];
  icon: ReactNode;
  section?: string;
}

export const navItems: NavItem[] = [
  // Core
  {
    label: 'Dashboard',
    href: '/dashboard',
    roles: ['manager', 'staff', 'admin'],
    icon: <DashboardIcon />,
    section: 'Main',
  },
  {
    label: 'Inventory',
    href: '/inventory',
    roles: ['manager', 'staff', 'admin'],
    icon: <InventoryIcon />,
    section: 'Main',
  },
  {
    label: 'Orders',
    href: '/orders',
    roles: ['manager', 'staff', 'admin'],
    icon: <ReceiptLongIcon />,
    section: 'Main',
  },

  // Manager
  {
    label: 'Activity Monitor',
    href: '/activity',
    roles: ['manager'],
    icon: <MonitorIcon />,
    section: 'Management',
  },
  {
    label: 'Reports',
    href: '/reports',
    roles: ['manager'],
    icon: <AssessmentIcon />,
    section: 'Management',
  },
  {
    label: 'AI Insights',
    href: '/ai-insights',
    roles: ['manager'],
    icon: <InsightsIcon />,
    section: 'Management',
  },
  {
    label: 'Staff Management',
    href: '/staff-management',
    roles: ['manager'],
    icon: <PeopleIcon />,
    section: 'Management',
  },

  // Staff
  {
    label: 'My Tasks',
    href: '/my-tasks',
    roles: ['staff'],
    icon: <AssignmentIcon />,
    section: 'Tasks',
  },

  // Admin
  {
    label: 'User Management',
    href: '/user-management',
    roles: ['admin'],
    icon: <PeopleIcon />,
    section: 'Admin',
  },
];