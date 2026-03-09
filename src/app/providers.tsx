"use client";

import * as React from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import { AuthProvider } from "@/auth/AuthProvider";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CssVarsProvider defaultMode="system">
        <CssBaseline />
        {children}
      </CssVarsProvider>
    </AuthProvider>
  );
}