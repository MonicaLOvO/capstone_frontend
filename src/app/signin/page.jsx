"use client";



import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/authContext"; 
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const { signIn, isAuthenticated } = useAuth(); 

  const [theme, setTheme] = useState("light"); // "light" | "dark"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Memoized theme styles
  const mode = useMemo(() => {
    return theme === "dark"
      ? {
          bg: "#000",
          boxBg: "#000",
          inputBg: "#1f242c",
          text: "#ffffff",
          muted: "#9ca3af",
          border: "#353b46",
        }
      : {
          bg: "#f9fafb",
          boxBg: "#ffffff",
          inputBg: "#ffffff",
          text: "#111827",
          muted: "#6b7280",
          border: "#d1d5db",
        };
  }, [theme]);

  const handleLogin = async (e) => { // 
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password); // 
      router.push("/"); // 
    } catch (err) {
  if (
    err.code === "auth/user-not-found" ||
    err.code === "auth/wrong-password" ||
    err.code === "auth/invalid-credential"
  ) {
    setError(
      "The account does not exist or the email or password entered is incorrect. Please verify your credentials and try again."
    );
  } else {
    setError("Unable to sign in at this time. Please try again later.");
  }
} finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.container, backgroundColor: mode.bg }}>
      {/* LEFT SIDE */}
      <div style={{ ...styles.left, backgroundColor: mode.bg }}>
        {/* BRAND + THEME TOGGLE */}
        <div style={styles.topRow}>
          <div style={styles.brand}>
            <img src="/logo.png" alt="Logo" style={styles.brandLogo} />
            <span style={{ ...styles.company, color: mode.text }}>
              New Wave Warehouse Management System
            </span>
          </div>

          <button
            onClick={() =>
              setTheme((prev) => (prev === "dark" ? "light" : "dark"))
            }
            style={styles.themeBtn}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        {/* LOGIN FORM */}
        <div style={styles.formWrapper}>
          <form style={styles.box} onSubmit={handleLogin}>
            <h2 style={{ ...styles.title, color: mode.text }}>Sign in</h2>

            <p style={{ textAlign: "center", marginTop: "12px" }}>
  <Link href="/adduser" style={{ color: "#0d6efd", textDecoration: "underline" }}>
    Add a New User
  </Link>
</p>



            <label style={{ ...styles.label, color: mode.muted }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              style={{
                ...styles.input,
                backgroundColor: mode.inputBg,
                color: mode.text,
                borderColor: mode.border,
              }}
            />

            <label style={{ ...styles.label, color: mode.muted }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{
                ...styles.input,
                backgroundColor: mode.inputBg,
                color: mode.text,
                borderColor: mode.border,
              }}
            />

            <div style={styles.row}>
              <label style={{ ...styles.remember, color: mode.muted }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                />
                Remember me
              </label>
              <span style={styles.forgot}>Forgot your password?</span>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <p style={{ ...styles.footer, color: mode.muted }}>
              © Your company 2026
            </p>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div style={styles.right}>
        <img src="/logo.png" alt="Logo Background" style={styles.rightLogo} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
  },

  left: {
    width: "45%",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    objectFit: "cover",
  },

  company: {
    fontSize: 16,
    fontWeight: 600,
  },

  themeBtn: {
    border: "none",
    background: "transparent",
    fontSize: "20px",
    cursor: "pointer",
  },

  formWrapper: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
  },

  box: {
    width: "320px",
    display: "flex",
    flexDirection: "column",
  },

  title: {
    marginBottom: "20px",
    fontSize: "26px",
  },

  label: {
    marginBottom: "6px",
    fontSize: "14px",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid",
    marginBottom: "14px",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    fontSize: "13px",
  },

  remember: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
  },

  forgot: {
    color: "#2563eb",
    cursor: "pointer",
  },

  button: {
    padding: "12px",
    borderRadius: "20px",
    border: "none",
    backgroundColor: "#0d6efd",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },

  error: {
    color: "#f97373",
    textAlign: "center",
    marginBottom: "10px",
  },

  footer: {
    marginTop: "24px",
    textAlign: "center",
    fontSize: "12px",
  },

  right: {
    width: "55%",
    height: "100vh",
    overflow: "hidden",
  },

  rightLogo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
};
