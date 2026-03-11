"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/roles";
import { clearSession } from "@/auth/session";
import { usersApi } from "@/services/api/users/users.api";

/**
 * Frontend User model
 * Represents the authenticated user stored in React context
 */
type User = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
};
/**
 * Authentication context interface
 * This defines what values/components can access using useAuth()
 */
type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (
    token: string,
    userDetails?: {
      Id?: string;
      FirstName?: string;
      LastName?: string;
      Email?: string;
    },
  ) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  /** Current user role (convenience so components can use const { role } = useAuth()) */
  role: UserRole | undefined;
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
  const USER_KEY = "wms_user";

  /**
   * Decode JWT token payload
   * JWT format = header.payload.signature
   * We decode the payload to extract user information
   */
  function decodeToken(
    token: string,
    userDetails?: {
      Id?: string;
      FirstName?: string;
      LastName?: string;
      Email?: string;
    },
  ): User | null {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const rawFirstName =
        userDetails?.FirstName ??
        payload.firstName ??
        payload.FirstName ??
        "";
      const rawLastName =
        userDetails?.LastName ??
        payload.lastName ??
        payload.LastName ??
        "";
      const fallbackName =
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

      const firstName = String(rawFirstName).trim();
      const lastName = String(rawLastName).trim();
      const name = [firstName, lastName].filter(Boolean).join(" ") || String(fallbackName).trim() || "User";

      return {
        id: userDetails?.Id ?? payload.userId ?? payload.sub ?? payload.UserId ?? "",
        name,
        firstName,
        lastName,
        email: String(
          userDetails?.Email ??
          payload.email ??
            payload.Email ??
            payload.mail ??
            payload.Mail ??
            payload.upn ??
            payload.Upn ??
            "",
        ).trim(),
        role,
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
  async function login(
    token: string,
    userDetails?: {
      Id?: string;
      FirstName?: string;
      LastName?: string;
      Email?: string;
    },
  ) {

    // Save token in localStorage
    localStorage.setItem(TOKEN_KEY, token);

    // Decode JWT
    const decodedUser = decodeToken(token, userDetails);

    if (!decodedUser) {
      throw new Error("Invalid token received");
    }

    // Store user in context
    setUser(decodedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(decodedUser));

    // Authentication finished
    setLoading(false);
  }

  /**
   * Logout: clear all auth state (token + cookie) and redirect to login
   */
  function logout() {
    clearSession();
    localStorage.removeItem(USER_KEY);
    setUser(null);
    router.push("/login");
  }

  function updateUser(updates: Partial<User>) {
    setUser((current) => {
      if (!current) return current;
      const next = {
        ...current,
        ...updates,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }

  function mergeCurrentUserDetails(
    currentUser: User,
    apiUser: {
      Id?: string;
      FirstName?: string;
      LastName?: string;
      Email?: string;
      Role?: { RoleName?: string };
    },
  ): User {
    const firstName = apiUser.FirstName?.trim() ?? currentUser.firstName;
    const lastName = apiUser.LastName?.trim() ?? currentUser.lastName;
    const roleName = apiUser.Role?.RoleName?.toLowerCase();

    let role = currentUser.role;
    if (roleName === "superadmin" || roleName === "admin") role = "admin";
    else if (roleName === "manager") role = "manager";
    else if (roleName === "staff") role = "staff";

    return {
      ...currentUser,
      id: apiUser.Id ?? currentUser.id,
      firstName,
      lastName,
      email: apiUser.Email?.trim() ?? currentUser.email,
      role,
      name: [firstName, lastName].filter(Boolean).join(" ") || currentUser.name,
    };
  }

  /**
   * When the application loads
   * check if a token already exists
   */
  useEffect(() => {

    const token = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    const parsedStoredUser = storedUser ? JSON.parse(storedUser) : undefined;
    const decodedUser = decodeToken(token, parsedStoredUser);

    if (decodedUser) {
      setUser(decodedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(decodedUser));

      if (!decodedUser.firstName && !decodedUser.lastName) {
        usersApi
          .getCurrent()
          .then((apiUser) => {
            setUser((current) => {
              if (!current) return current;
              const next = mergeCurrentUserDetails(current, apiUser);
              localStorage.setItem(USER_KEY, JSON.stringify(next));
              return next;
            });
          })
          .catch(() => {
            // Keep the decoded user if the profile lookup fails.
          });
      }
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
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
        updateUser,
        role: user?.role,
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
