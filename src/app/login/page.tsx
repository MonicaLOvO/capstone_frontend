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

  const [showPassword, setShowPassword] = useState(false);

  function validate() {

    if (!username.trim()) {
      setError("Username or email is required");
      return false;
    }

    if (!password.trim()) {
      setError("Password is required");
      return false;
    }

    return true;
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {

    e.preventDefault();

    setError(null);

    if (!validate()) return;

    setLoading(true);

    try {

      const res = await fetch("http://localhost:4000/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          Username: username,
          Password: password
        })
      });

      if (!res.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await res.json();

      const token: string | undefined = data?.Data?.token;

      if (!token) {
        throw new Error("Invalid login response");
      }

      setAuthCookie(token);

      await login(token);

      router.push("/dashboard");

    } catch (err: unknown) {

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed");
      }

    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <h1 style={styles.title}>Sign in</h1>
          <p style={styles.subtitle}>
            Enter your credentials to continue
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>

          <label style={styles.label}>
            Username or Email
          </label>

          <input
            type="text"
            placeholder="Enter username or email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />

          <label style={styles.label}>
            Password
          </label>

          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.showBtn}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        <div style={styles.footer}>
          Secure system access
        </div>

      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {

  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f1f5f9",
    padding: "20px"
  },

  container: {
    width: "100%",
    maxWidth: "420px",
    background: "white",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
  },

  header: {
    marginBottom: "24px"
  },

  title: {
    fontSize: "26px",
    marginBottom: "6px"
  },

  subtitle: {
    fontSize: "14px",
    color: "#64748b"
  },

  label: {
    fontSize: "14px",
    fontWeight: 500,
    display: "block",
    marginBottom: "6px"
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #cbd5f5",
    background: "#f8fafc",
    color: "#1e293b",
    fontSize: "14px",
    marginBottom: "18px",
    outline: "none"
  },

  showBtn: {
    position: "absolute",
    right: "10px",
    top: "12px",
    border: "none",
    background: "transparent",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "13px"
  },

  button: {
    width: "100%",
    height: "44px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "white",
    fontWeight: 600,
    cursor: "pointer"
  },

  footer: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "12px",
    color: "#94a3b8"
  },

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "18px",
    fontSize: "14px"
  }

};