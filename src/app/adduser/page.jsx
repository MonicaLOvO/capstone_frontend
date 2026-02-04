"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/components/auth/authContext";

export default function AddUser() {
  const { isAuthenticated } = useAuth(); // optional: check auth

  const [theme, setTheme] = useState("light"); // dark/light mode
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(""); // replaced username with email
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Employee");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

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
          button: "#0d6efd",
        }
      : {
          bg: "#f9fafb",
          boxBg: "#ffffff",
          inputBg: "#ffffff",
          text: "#111827",
          muted: "#6b7280",
          border: "#d1d5db",
          button: "#0d6efd",
        };
  }, [theme]);

  // 🔹 Handle form submission
  const handleAddUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!firstName || !lastName || !email || !password || !role) {
      setError("Please fill in all fields");
      return;
    }

    // Show confirmation modal if role is Admin
    if (role === "Admin") {
      setShowConfirm(true);
      return;
    }

    await createUser();
  };

  // 🔹 Function to actually create user
  const createUser = async () => {
    setShowConfirm(false);
    setLoading(true);

    try {
      // Replace this with your API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(`User "${email}" (${role}) created successfully!`);
      setFirstName("");
      setLastName("");
      setEmail(""); // reset email
      setPassword("");
      setRole("Employee"); // reset to default
    } catch (err) {
      setError(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: mode.bg,
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
        }}
      >
        {/* Header + Theme toggle */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <h1 style={{ color: mode.text, margin: 0 }}>Add New User</h1>

          {/* Theme button like Sign In page */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleAddUser}
          style={{
            backgroundColor: mode.boxBg,
            padding: "32px",
            borderRadius: "12px",
            boxShadow: theme === "dark" ? "0 0 20px #00000088" : "0 0 20px #cccccc88",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <p style={{ color: mode.muted, fontSize: "14px" }}>
            Fill in the information below to add a new user. Creating an Admin requires confirmation.
          </p>

          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: `1px solid ${mode.border}`,
              backgroundColor: mode.inputBg,
              color: mode.text,
            }}
          />

          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: `1px solid ${mode.border}`,
              backgroundColor: mode.inputBg,
              color: mode.text,
            }}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: `1px solid ${mode.border}`,
              backgroundColor: mode.inputBg,
              color: mode.text,
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: `1px solid ${mode.border}`,
              backgroundColor: mode.inputBg,
              color: mode.text,
            }}
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: `1px solid ${mode.border}`,
              backgroundColor: mode.inputBg,
              color: mode.text,
            }}
          >
            <option value="Employee">Employee</option>
            <option value="Admin">Admin</option>
          </select>

          {error && <p style={{ color: "#f97373", textAlign: "center" }}>{error}</p>}
          {success && <p style={{ color: "#38b000", textAlign: "center" }}>{success}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px",
              borderRadius: "20px",
              border: "none",
              backgroundColor: mode.button,
              color: "#fff",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {loading ? "Creating..." : "Add User"}
          </button>
        </form>
      </div>

      {/* ✅ Confirmation Modal for Admin */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              backgroundColor: mode.boxBg,
              padding: "32px",
              borderRadius: "12px",
              maxWidth: "400px",
              width: "90%",
              textAlign: "center",
              boxShadow: theme === "dark" ? "0 0 20px #00000088" : "0 0 20px #cccccc88",
            }}
          >
            <h2 style={{ color: mode.text }}>Confirm Admin Creation</h2>
            <p style={{ color: mode.muted, margin: "16px 0" }}>
              You are about to create a <strong>Manager/Admin</strong> user. Are you sure you want to continue?
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "16px" }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#f97373",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={createUser}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#0d6efd",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
