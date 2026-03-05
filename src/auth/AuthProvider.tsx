"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserRole } from "@/types/roles";

/**
 * Frontend User model
 * Represents the authenticated user stored in React context
 */
type User = {
  id: string;
  name: string;
  role: UserRole;
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
};


const AuthContext = createContext<AuthContextType | null>(null);

/**
 * AuthProvider wraps the entire application
 * and provides authentication state everywhere
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const TOKEN_KEY = "wms_token";

  /**
 * Fetch logged-in user information from backend
 * using the JWT token stored in the browser.
 */
async function fetchUser(token: string) {
  try {

    /**
     * Call backend endpoint to get current user
     */
    const res = await fetch("http://localhost:4000/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`, // send JWT token
      },
    });

    /**
     * If backend says unauthorized
     * the token is invalid or expired
     */
    if (!res.ok) {
      throw new Error("Unauthorized");
    }

    /**
     * Parse JSON response
     */
    const data = await res.json();

    /**
     * Example backend response:
     * 
     * {
     *   Data: {
     *     id: "1",
     *     name: "Super Admin",
     *     role: "ADMIN"
     *   }
     * }
     */

    const userData = data?.Data;

    if (!userData) {
      throw new Error("Invalid user data");
    }

    /**
     * Normalize the role to match frontend roles
     * (admin | manager | staff)
     */
    const normalizedRole =
      userData.role?.toLowerCase();

    /**
     * Store user inside AuthProvider state
     */
    setUser({
      id: userData.id,
      name: userData.name,
      role: normalizedRole,
    });

  } catch (err) {

    /**
     * If request fails:
     * - clear user
     * - remove token
     */
    setUser(null);

    localStorage.removeItem(TOKEN_KEY);

  } finally {

    /**
     * Stop loading state
     */
    setLoading(false);

  }
}

 /**
   * Decode JWT token payload
   * JWT format = header.payload.signature
   * We decode the payload to extract user information
   */
  function decodeToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      return {
        id: payload.userId,
        name: payload.username,
        role: payload.roleName,
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
   * Logout function
   * Clears token and user session
   */
  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
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
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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