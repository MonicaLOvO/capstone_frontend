"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/roles";
import { clearSession } from "@/auth/session";

/** Backend role name – used to enforce "only SuperAdmin can manage Admin users" */
export type BackendRoleName = "SuperAdmin" | "Admin" | "Manager" | "Staff";

/**
 * Frontend User model
 * Represents the authenticated user stored in React context
 */
type User = {
  id: string;
  name: string;
  role: UserRole;
  /** Backend role name from JWT – use for rules like "Admin cannot edit other Admins" */
  backendRoleName: BackendRoleName;
};
/**
 * Authentication context interface
 * This defines what values/components can access using useAuth()
 */
type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  /** Current user role (convenience so components can use const { role } = useAuth()) */
  role: UserRole | undefined;
  /** Backend role name – e.g. "SuperAdmin" vs "Admin" for permission rules */
  backendRoleName: BackendRoleName | undefined;
};


const AuthContext = createContext<AuthContextType | null>(null);

/**
 * AuthProvider wraps the entire application
 * and provides authentication state everywhere
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const TOKEN_KEY = "wms_token";

  /**
   * Decode JWT token payload
   * JWT format = header.payload.signature
   * We decode the payload to extract user information
   */
  function decodeToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      // Support both camelCase and PascalCase from backend (e.g. RoleName, UserName)
      const rawName =
        payload.username ?? payload.userName ?? payload.Username ?? "";
      const rawRole = (
        payload.roleName ??
        payload.role ??
        payload.RoleName ??
        "staff"
      )
        .toString()
        .toLowerCase();
      // Map backend role names to frontend roles (align with users.mapper)
      let role: UserRole = "staff";
      if (rawRole === "superadmin" || rawRole === "admin") role = "admin";
      else if (rawRole === "manager") role = "manager";
      else if (rawRole === "staff") role = "staff";

      const backendRoleName: BackendRoleName =
        rawRole === "superadmin"
          ? "SuperAdmin"
          : rawRole === "admin"
            ? "Admin"
            : rawRole === "manager"
              ? "Manager"
              : "Staff";

      return {
        id: payload.userId ?? payload.sub ?? payload.UserId ?? "",
        name: String(rawName).trim() || "User",
        role,
        backendRoleName,
      };
    } catch (err) {
      console.error("Invalid JWT token", err);
      return null;
    }
  }

  /**
   * Login function
   * Called after backend returns JWT
   */
  async function login(token: string) {

    // Save token in localStorage
    localStorage.setItem(TOKEN_KEY, token);

    // Decode JWT
    const decodedUser = decodeToken(token);

    if (!decodedUser) {
      throw new Error("Invalid token received");
    }

    // Store user in context
    setUser(decodedUser);

    // Authentication finished
    setLoading(false);
  }

  /**
   * Logout: clear all auth state (token + cookie) and redirect to login
   */
  function logout() {
    clearSession();
    setUser(null);
    router.push("/login");
  }

  /**
   * When the application loads
   * check if a token already exists
   */
  useEffect(() => {

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    const decodedUser = decodeToken(token);

    if (decodedUser) {
      setUser(decodedUser);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }

    setLoading(false);

  }, []);

  /**
   * Provide auth values to the whole app
   */
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        role: user?.role,
        backendRoleName: user?.backendRoleName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook used in components to access authentication
 *
 * Example:
 * const { user, logout } = useAuth();
 */
export function useAuth() {

  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be inside AuthProvider");
  }

  return ctx;
}