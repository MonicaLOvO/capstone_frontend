"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/AuthProvider";
import { setAuthCookie } from "@/lib/authCookies";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [darkMode, setDarkMode] = useState(true);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:4000/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          Username: String(username),
          Password: String(password)
        })
      });

       // If backend rejected login
      if (!res.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await res.json();

      const token = data?.Data?.token;

      if (!token) {
        throw new Error("Invalid login response");
      }

       /**
       * Save token to cookie so middleware can read it
       */
      setAuthCookie(token);


      /**
       * Save user in AuthContext
       */
      await login(token, data?.Data?.user);

      router.push("/dashboard");

    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  const theme = darkMode
    ? {
        background: "#0f172a",
        card: "#1e293b",
        text: "#f1f5f9",
        input: "#334155"
      }
    : {
        background: "#f1f5f9",
        card: "#ffffff",
        text: "#0f172a",
        input: "#e5e7eb"
      };

  return (
    <div
      style={{
        background: theme.background,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "0.3s"
      }}
    >
      <div
        style={{
          width: 420,
          background: theme.card,
          borderRadius: 12,
          padding: 40,
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
        }}
      >

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h1 style={{ color: theme.text, marginBottom: 6 }}>
            Capstone WMS
          </h1>

          <p style={{ color: "#94a3b8", fontSize: 14 }}>
            Warehouse Management System
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "10px",
              borderRadius: 6,
              marginBottom: 20,
              fontSize: 14
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>

          <label style={{ color: theme.text }}>Username or email</label>

          <input
            type="text"
            placeholder="Enter username or email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              marginTop: 6,
              marginBottom: 18,
              borderRadius: 6,
              border: "none",
              background: theme.input,
              color: theme.text
            }}
          />

          <label style={{ color: theme.text }}>Password</label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              marginTop: 6,
              marginBottom: 25,
              borderRadius: 6,
              border: "none",
              background: theme.input,
              color: theme.text
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: 42,
              background: "#2563eb",
              border: "none",
              borderRadius: 6,
              color: "white",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div
          style={{
            marginTop: 25,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <span style={{ fontSize: 12, color: "#94a3b8" }}>
            Secure login
          </span>

          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              border: "none",
              background: "transparent",
              color: "#3b82f6",
              cursor: "pointer",
              fontSize: 12
            }}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>
    </div>
  );
}
