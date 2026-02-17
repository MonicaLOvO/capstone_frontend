"use client";

import React, { createContext, useContext } from "react";
import { UserRole } from "@/types/roles";

type User = {
  id: string;
  name: string;
  role: UserRole;
};

const AuthContext = createContext<User | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {

  // TEMP MOCK USER (later backend replaces this)
  const user: User = {
    id: "1",
    name: "John",
    role: "admin",
  };

  return (
    <AuthContext.Provider value={user}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}