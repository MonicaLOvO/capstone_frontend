"use client";

import { Box, Drawer } from "@mui/joy";
import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { UserRole } from "@/types/roles";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const userRole: UserRole = "manager"; // later from auth

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          width: collapsed ? 80 : 260,
          transition: "width 0.2s ease",
          flexShrink: 0,
        }}
      >
        <Sidebar
          userRole={userRole}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        size="sm"
        variant="plain"
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-content": {
            width: 260,
            p: 0,
          },
        }}
      >
        <Sidebar
          userRole={userRole}
          collapsed={false}
          onToggleCollapse={() => {}}
          onNavigate={() => setMobileOpen(false)}
        />
      </Drawer>

      {/* Main Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Header onMenuClick={() => setMobileOpen(true)} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflow: "auto",
            p: 3,
            bgcolor: "background.body",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
