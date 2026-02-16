"use client";

import React from "react";
import {
  Sheet,
  List,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  Typography,
  Input,
  Divider,
  Box,
  Avatar,
  IconButton,
} from "@mui/joy";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/config/navigation";
import { UserRole } from "@/types/roles";

interface SidebarProps {
  userRole: UserRole;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
}

export default function Sidebar({
  userRole,
  collapsed,
  onToggleCollapse,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <Sheet
      sx={{
        width: collapsed ? 80 : 260,
        height: "100vh",
        transition: "width 0.2s ease",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.surface",
        p: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          mb: 2,
        }}
      >
        {/* Logo area */}
        <Box
          onClick={collapsed ? onToggleCollapse : undefined}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: collapsed ? "pointer" : "default",
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "md",
              bgcolor: "primary.500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            C
          </Box>

          {!collapsed && (
            <Typography
              level="h4"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              Capstone WMS
            </Typography>
          )}
        </Box>

        {/* Collapse arrow only when expanded */}
        {!collapsed && (
          <IconButton
            onClick={onToggleCollapse}
            sx={{ display: { xs: "none", md: "inline-flex" } }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      {!collapsed && (
        <Input
          size="sm"
          startDecorator={<SearchIcon />}
          placeholder="Search"
          sx={{ mb: 2 }}
        />
      )}

      {/* <Divider sx={{ mb: 2 }} /> */}

      {/* Navigation */}
      <List sx={{ gap: 1 }}>
        {visibleItems.map((item) => (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={pathname === item.href}
            onClick={onNavigate}
          >
            <ListItemDecorator>{item.icon}</ListItemDecorator>

            {!collapsed && <ListItemContent>{item.label}</ListItemContent>}
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* Bottom Section (Settings + Profile together) */}
      <Box>
        {/* Settings */}
        <List sx={{ gap: 0.5 }}>
          <ListItemButton component={Link} href="/settings">
            <ListItemDecorator>
              <SettingsIcon />
            </ListItemDecorator>
            {!collapsed && <ListItemContent>Settings</ListItemContent>}
          </ListItemButton>
        </List>

        {/* Divider ABOVE profile */}
        <Divider sx={{ my: 2 }} />

        {/* Profile + Logout */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            py: 1,
          }}
        >
          {/* Profile clickable area */}
          <ListItemButton
            component={Link}
            href="/profile"
            onClick={onNavigate}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexGrow: 1,
              borderRadius: "md",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
          >
            <Avatar size="sm" />

            {!collapsed && (
              <Box>
                <Typography level="body-sm">John</Typography>
                <Typography level="body-xs" color="neutral">
                  {userRole}
                </Typography>
              </Box>
            )}
          </ListItemButton>

          {/* Logout button */}
          {!collapsed && (
            <IconButton
              size="sm"
              variant="plain"
              color="neutral"
              sx={{ ml: 1 }}
              onClick={() => {
                console.log("Logout clicked");
              }}
            >
              <LogoutIcon />
            </IconButton>
          )}
        </Box>
      </Box>
    </Sheet>
  );
}
